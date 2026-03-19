"""
Monte Carlo simulation engine for data center demand forecasting.

Uses Geometric Brownian Motion (GBM) for equity-like drivers and
Ornstein-Uhlenbeck (mean-reverting) process for commodity drivers.
Cholesky decomposition preserves empirical correlations between drivers.
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_collectors.ticker_registry import DEMAND_WEIGHTS

# Commodity tickers that should use mean-reverting OU process
COMMODITY_TICKERS = {"FCX", "SCCO", "BHP", "RIO", "TECK", "CCJ", "UEC", "DNN", "UUUU"}

# Pre-built scenarios: overrides applied on top of estimated parameters
SCENARIOS = {
    "base": {
        "description": "Base case — current trends continue",
        "drift_multiplier": 1.0,
        "vol_multiplier": 1.0,
        "driver_shocks": {},
    },
    "bull": {
        "description": "Bull — AI capex accelerates, no power constraints",
        "drift_multiplier": 1.6,
        "vol_multiplier": 0.75,
        "driver_shocks": {"NVDA": 0.30, "TSM": 0.20, "EQIX": 0.15, "CEG": 0.20},
    },
    "bear": {
        "description": "Bear — regulatory headwinds, macro slowdown, power scarcity",
        "drift_multiplier": 0.3,
        "vol_multiplier": 1.6,
        "driver_shocks": {"NVDA": -0.20, "EQIX": -0.15, "VRT": -0.10},
    },
    "power_crunch": {
        "description": "Power Crunch — grid bottleneck limits data center buildout",
        "drift_multiplier": 0.6,
        "vol_multiplier": 1.3,
        "driver_shocks": {"ETN": 0.20, "GEV": 0.25, "PWR": 0.20, "EQIX": -0.15, "VRT": -0.10},
    },
    "nuclear_renaissance": {
        "description": "Nuclear Renaissance — SMRs approved, cheap baseload power unlocked",
        "drift_multiplier": 1.3,
        "vol_multiplier": 0.9,
        "driver_shocks": {"CEG": 0.40, "CCJ": 0.30, "VST": 0.35, "BWXT": 0.25},
    },
    "copper_shortage": {
        "description": "Copper Shortage — supply deficit delays physical infrastructure",
        "drift_multiplier": 0.7,
        "vol_multiplier": 1.2,
        "driver_shocks": {"FCX": -0.25, "SCCO": -0.20, "VRT": -0.15, "EQIX": -0.10},
    },
}


@dataclass
class SimulationResult:
    scenario: str
    description: str
    dates: list[str]
    # Demand index paths — shape (n_simulations, n_days)
    paths: np.ndarray
    # Percentile fan chart bands at each timestep
    percentiles: dict  # keys: "p5", "p10", "p25", "p50", "p75", "p90", "p95"
    mean_path: list[float]
    # Risk statistics at terminal horizon
    var_95: float        # 5th percentile terminal value
    cvar_95: float       # Expected value below VaR (Conditional VaR)
    prob_exceed_150: float   # Probability demand index > 1.5x baseline
    prob_exceed_200: float   # Probability demand index > 2x baseline
    baseline: float      # Starting demand index value
    n_simulations: int


class MonteCarloSimulator:
    def __init__(self, n_simulations: int = 10_000, seed: int = 42):
        self.n_simulations = n_simulations
        self.rng = np.random.default_rng(seed)

    def simulate(
        self,
        historical_prices: pd.DataFrame,
        months_ahead: int = 12,
        scenario: str = "base",
    ) -> SimulationResult:
        """
        Run a Monte Carlo simulation for data center demand.

        Parameters
        ----------
        historical_prices : DataFrame
            Daily closing prices, columns = ticker symbols (DEMAND_WEIGHTS keys)
        months_ahead : int
            Forecast horizon in months
        scenario : str
            One of: base, bull, bear, power_crunch, nuclear_renaissance, copper_shortage
        """
        scenario_cfg = SCENARIOS.get(scenario, SCENARIOS["base"])
        T = months_ahead * 21  # ~21 trading days per month

        # Align columns to DEMAND_WEIGHTS keys that are available
        available = [t for t in DEMAND_WEIGHTS if t in historical_prices.columns]
        prices = historical_prices[available].copy()
        weights = np.array([DEMAND_WEIGHTS[t] for t in available])
        weights = weights / weights.sum()  # renormalize

        # Estimate parameters from historical data
        log_returns = np.log(prices / prices.shift(1)).dropna()
        mu_daily = log_returns.mean().values          # shape (n_tickers,)
        sigma_daily = log_returns.std().values        # shape (n_tickers,)
        corr_matrix = log_returns.corr().values       # shape (n_tickers, n_tickers)

        # Regularise correlation matrix to ensure positive semi-definiteness
        corr_matrix = self._regularise_corr(corr_matrix)

        # Apply scenario overrides
        drift_mult = scenario_cfg["drift_multiplier"]
        vol_mult = scenario_cfg["vol_multiplier"]
        driver_shocks = scenario_cfg.get("driver_shocks", {})

        mu_daily = mu_daily * drift_mult
        sigma_daily = sigma_daily * vol_mult

        # Apply ticker-level shocks (annualised → convert to daily)
        for ticker, annual_shock in driver_shocks.items():
            if ticker in available:
                idx = available.index(ticker)
                mu_daily[idx] += annual_shock / 252

        # Cholesky decomposition for correlated sampling
        try:
            L = np.linalg.cholesky(corr_matrix)
        except np.linalg.LinAlgError:
            L = np.eye(len(available))

        # Initial prices (last row of historical)
        S0 = prices.iloc[-1].values.astype(float)
        is_commodity = np.array([t in COMMODITY_TICKERS for t in available])

        # Run simulations — vectorised over n_simulations
        # paths shape: (n_simulations, n_tickers, T)
        ticker_paths = self._simulate_paths(
            S0, mu_daily, sigma_daily, L, T, is_commodity
        )

        # Composite demand index: weighted average of normalised ticker paths
        # Normalise each ticker path by its starting price
        S0_bc = S0[np.newaxis, :, np.newaxis]  # (1, n_tickers, 1)
        normalised = ticker_paths / S0_bc       # (n_sims, n_tickers, T)

        # Weighted sum → demand index paths (n_sims, T)
        demand_paths = np.einsum("j,ijk->ik", weights, normalised)

        # Build date axis (monthly sampling for output)
        today = pd.Timestamp.today()
        monthly_indices = [min(i * 21, T - 1) for i in range(1, months_ahead + 1)]
        dates = [
            (today + pd.DateOffset(months=i)).strftime("%Y-%m-%d")
            for i in range(1, months_ahead + 1)
        ]

        # Sample monthly
        monthly_paths = demand_paths[:, monthly_indices]  # (n_sims, months)

        # Compute fan chart percentiles at each monthly step
        pct_values = [5, 10, 25, 50, 75, 90, 95]
        percentiles = {}
        for p in pct_values:
            percentiles[f"p{p}"] = np.percentile(monthly_paths, p, axis=0).tolist()

        mean_path = monthly_paths.mean(axis=0).tolist()

        # Risk statistics at terminal horizon
        terminal = monthly_paths[:, -1]
        baseline = float(demand_paths[0, 0])  # first sim, first step ≈ 1.0

        var_95 = float(np.percentile(terminal, 5))
        below_var = terminal[terminal <= var_95]
        cvar_95 = float(below_var.mean()) if len(below_var) > 0 else var_95
        prob_exceed_150 = float(np.mean(terminal > 1.5))
        prob_exceed_200 = float(np.mean(terminal > 2.0))

        return SimulationResult(
            scenario=scenario,
            description=scenario_cfg["description"],
            dates=dates,
            paths=monthly_paths,
            percentiles=percentiles,
            mean_path=mean_path,
            var_95=round(var_95, 4),
            cvar_95=round(cvar_95, 4),
            prob_exceed_150=round(prob_exceed_150, 4),
            prob_exceed_200=round(prob_exceed_200, 4),
            baseline=round(baseline, 4),
            n_simulations=self.n_simulations,
        )

    def simulate_all_scenarios(
        self,
        historical_prices: pd.DataFrame,
        months_ahead: int = 12,
    ) -> dict[str, SimulationResult]:
        """Run all pre-built scenarios and return results keyed by scenario name."""
        results = {}
        for scenario_name in SCENARIOS:
            print(f"  Running scenario: {scenario_name}...")
            results[scenario_name] = self.simulate(
                historical_prices, months_ahead=months_ahead, scenario=scenario_name
            )
        return results

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _simulate_paths(
        self,
        S0: np.ndarray,
        mu: np.ndarray,
        sigma: np.ndarray,
        L: np.ndarray,
        T: int,
        is_commodity: np.ndarray,
        ou_theta: float = 0.1,  # mean-reversion speed for commodities
    ) -> np.ndarray:
        """
        Vectorised path generation.
        Returns shape: (n_simulations, n_tickers, T)
        """
        n = len(S0)
        N = self.n_simulations

        # Independent standard normals: (N, n, T)
        Z_independent = self.rng.standard_normal((N, n, T))

        # Correlate via Cholesky: for each sim & timestep, apply L
        # L: (n, n), Z_independent: (N, n, T)
        # Result: (N, n, T)
        Z_corr = np.einsum("ij,kjt->kit", L, Z_independent)

        # GBM increments: log-normal step
        # S(t+1) = S(t) * exp((mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
        dt = 1.0  # daily steps
        drift = (mu - 0.5 * sigma ** 2) * dt           # (n,)
        diffusion = sigma * np.sqrt(dt)                 # (n,)

        # Broadcast: (1, n, 1) for shapes
        drift_bc = drift[np.newaxis, :, np.newaxis]
        diffusion_bc = diffusion[np.newaxis, :, np.newaxis]

        log_increments = drift_bc + diffusion_bc * Z_corr  # (N, n, T)

        # Cumulative product to get price paths
        log_paths = np.cumsum(log_increments, axis=2)       # (N, n, T)
        price_paths = S0[np.newaxis, :, np.newaxis] * np.exp(log_paths)  # (N, n, T)

        # Apply Ornstein-Uhlenbeck mean reversion for commodity tickers
        commodity_idx = np.where(is_commodity)[0]
        if len(commodity_idx) > 0:
            for idx in commodity_idx:
                long_run = S0[idx]
                # OU correction: pull path back toward long-run mean
                for t in range(1, T):
                    deviation = price_paths[:, idx, t - 1] - long_run
                    price_paths[:, idx, t] = (
                        price_paths[:, idx, t]
                        - ou_theta * deviation * dt
                    )
                    price_paths[:, idx, t] = np.maximum(price_paths[:, idx, t], 1e-6)

        return price_paths

    @staticmethod
    def _regularise_corr(corr: np.ndarray, epsilon: float = 1e-6) -> np.ndarray:
        """
        Ensure correlation matrix is symmetric and positive semi-definite
        by clipping eigenvalues to epsilon.
        """
        corr = (corr + corr.T) / 2
        eigvals, eigvecs = np.linalg.eigh(corr)
        eigvals = np.maximum(eigvals, epsilon)
        corr_reg = eigvecs @ np.diag(eigvals) @ eigvecs.T
        # Re-normalise diagonal to 1
        d = np.sqrt(np.diag(corr_reg))
        corr_reg = corr_reg / np.outer(d, d)
        return corr_reg


def simulation_result_to_dict(result: SimulationResult) -> dict:
    """Serialise SimulationResult to JSON-safe dict for API response."""
    return {
        "scenario": result.scenario,
        "description": result.description,
        "dates": result.dates,
        "percentiles": result.percentiles,
        "mean_path": result.mean_path,
        "risk_stats": {
            "var_95": result.var_95,
            "cvar_95": result.cvar_95,
            "prob_exceed_150_pct": result.prob_exceed_150,
            "prob_exceed_200_pct": result.prob_exceed_200,
        },
        "baseline": result.baseline,
        "n_simulations": result.n_simulations,
    }
