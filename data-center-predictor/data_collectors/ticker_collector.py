"""
Batch ticker data collector — fetches all 80+ tickers from yfinance efficiently.
"""
import yfinance as yf
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta
from .ticker_registry import (
    TICKER_UNIVERSE, ALL_TICKERS, TICKER_TO_SECTOR,
    DEMAND_WEIGHTS, THEMATIC_SIGNALS, SECTOR_LABELS
)

CACHE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "ticker_data.json"
)
CACHE_TTL_SECONDS = 300  # 5 minutes


class TickerCollector:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(base_dir, "data")
        os.makedirs(self.data_dir, exist_ok=True)
        self.cache_file = os.path.join(self.data_dir, "ticker_data.json")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fetch_all(self, period: str = "3mo", force_refresh: bool = False) -> dict:
        """
        Fetch all tickers. Returns cached data if fresh enough.
        period: yfinance period string ("1mo", "3mo", "6mo", "1y")
        """
        if not force_refresh and self._cache_is_fresh():
            return self._load_cache()

        print(f"Fetching {len(ALL_TICKERS)} tickers from yfinance...")
        raw = self._batch_download(ALL_TICKERS, period=period)
        result = self._build_ticker_payload(raw)
        self._save_cache(result)
        return result

    def fetch_sector(self, sector: str, period: str = "3mo") -> dict:
        """Fetch tickers for a specific sector."""
        tickers = list(TICKER_UNIVERSE.get(sector, {}).keys())
        if not tickers:
            return {}
        raw = self._batch_download(tickers, period=period)
        return self._build_ticker_payload(raw)

    def compute_sector_momentum(self, ticker_data: dict | None = None) -> dict:
        """
        Returns weighted 30d momentum score per sector (−1 to +1).
        """
        if ticker_data is None:
            ticker_data = self.fetch_all()

        sector_scores = {}
        for sector, tickers in TICKER_UNIVERSE.items():
            changes = []
            for symbol in tickers:
                td = ticker_data.get(symbol)
                if td and td.get("change_30d") is not None:
                    changes.append(td["change_30d"])
            if changes:
                sector_scores[sector] = {
                    "momentum": round(float(np.mean(changes)), 4),
                    "label": SECTOR_LABELS.get(sector, sector),
                    "ticker_count": len(changes),
                }
        return sector_scores

    def compute_thematic_signals(self, ticker_data: dict | None = None) -> dict:
        """
        Returns composite score for each thematic signal (power scarcity, nuclear, etc.)
        """
        if ticker_data is None:
            ticker_data = self.fetch_all()

        signals = {}
        for signal_key, config in THEMATIC_SIGNALS.items():
            changes = []
            for symbol in config["tickers"]:
                td = ticker_data.get(symbol)
                if td and td.get("change_30d") is not None:
                    changes.append(td["change_30d"])
            if changes:
                signals[signal_key] = {
                    "score": round(float(np.mean(changes)), 4),
                    "description": config["description"],
                    "tickers": config["tickers"],
                    "data_points": len(changes),
                }
        return signals

    def compute_demand_index(self, ticker_data: dict | None = None) -> dict:
        """
        Compute weighted composite demand index from DEMAND_WEIGHTS tickers.
        Returns current index value, 7d and 30d changes.
        """
        if ticker_data is None:
            ticker_data = self.fetch_all()

        weighted_current = 0.0
        weighted_change_7d = 0.0
        weighted_change_30d = 0.0
        total_weight = 0.0

        for symbol, weight in DEMAND_WEIGHTS.items():
            td = ticker_data.get(symbol)
            if td and td.get("current_price"):
                weighted_current += weight * (td["current_price"] or 0)
                weighted_change_7d += weight * (td.get("change_7d") or 0)
                weighted_change_30d += weight * (td.get("change_30d") or 0)
                total_weight += weight

        if total_weight == 0:
            return {"index": 0, "change_7d": 0, "change_30d": 0}

        return {
            "index": round(weighted_current / total_weight, 2),
            "change_7d": round(weighted_change_7d / total_weight, 4),
            "change_30d": round(weighted_change_30d / total_weight, 4),
            "coverage": round(total_weight, 3),
        }

    def get_historical_for_simulation(self, period: str = "1y") -> pd.DataFrame:
        """
        Returns a DataFrame of daily closing prices for DEMAND_WEIGHTS tickers.
        Shape: (days, n_tickers). Used as input for Monte Carlo simulation.
        """
        driver_tickers = list(DEMAND_WEIGHTS.keys())
        print(f"Fetching historical data for {len(driver_tickers)} demand drivers...")
        data = yf.download(
            driver_tickers,
            period=period,
            auto_adjust=True,
            progress=False,
        )
        if isinstance(data.columns, pd.MultiIndex):
            closes = data["Close"]
        else:
            closes = data[["Close"]]
            closes.columns = driver_tickers[:1]

        closes = closes.dropna(how="all")
        closes = closes.ffill().bfill()
        return closes

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _batch_download(self, tickers: list[str], period: str = "3mo") -> pd.DataFrame:
        """Download OHLCV for all tickers in a single yfinance call."""
        try:
            data = yf.download(
                tickers,
                period=period,
                auto_adjust=True,
                progress=False,
            )
            return data
        except Exception as e:
            print(f"Batch download error: {e}")
            return pd.DataFrame()

    def _build_ticker_payload(self, raw: pd.DataFrame) -> dict:
        """
        Transform raw yfinance download into structured per-ticker dict.
        """
        result = {}

        if raw.empty:
            return result

        # Handle both single-ticker (flat columns) and multi-ticker (MultiIndex)
        is_multi = isinstance(raw.columns, pd.MultiIndex)

        for symbol in ALL_TICKERS:
            try:
                if is_multi:
                    if symbol not in raw["Close"].columns:
                        continue
                    closes = raw["Close"][symbol].dropna()
                    volumes = raw["Volume"][symbol].dropna() if "Volume" in raw else pd.Series(dtype=float)
                else:
                    closes = raw["Close"].dropna()
                    volumes = raw["Volume"].dropna() if "Volume" in raw else pd.Series(dtype=float)

                if len(closes) < 2:
                    continue

                current_price = float(closes.iloc[-1])
                prev_7d = float(closes.iloc[-8]) if len(closes) >= 8 else float(closes.iloc[0])
                prev_30d = float(closes.iloc[-31]) if len(closes) >= 31 else float(closes.iloc[0])
                prev_90d = float(closes.iloc[-91]) if len(closes) >= 91 else float(closes.iloc[0])

                change_1d = float((closes.iloc[-1] / closes.iloc[-2] - 1)) if len(closes) >= 2 else 0.0
                change_7d = float((closes.iloc[-1] / prev_7d - 1))
                change_30d = float((closes.iloc[-1] / prev_30d - 1))
                change_90d = float((closes.iloc[-1] / prev_90d - 1))

                # 30-day annualised volatility
                log_returns = np.log(closes / closes.shift(1)).dropna()
                volatility_30d = float(log_returns.tail(30).std() * np.sqrt(252)) if len(log_returns) >= 5 else 0.0

                # MA
                ma_7 = float(closes.tail(7).mean())
                ma_30 = float(closes.tail(30).mean())
                ma_90 = float(closes.tail(90).mean())

                # Momentum score: composite of recent returns, normalised
                momentum = (change_7d * 0.5 + change_30d * 0.3 + change_1d * 0.2)

                # Historical daily closes (last 90 days for charting)
                history = [
                    {"date": d.strftime("%Y-%m-%d"), "price": round(float(p), 4)}
                    for d, p in closes.tail(90).items()
                ]

                sector = TICKER_TO_SECTOR.get(symbol, "unknown")
                description = TICKER_UNIVERSE.get(sector, {}).get(symbol, "")

                result[symbol] = {
                    "symbol": symbol,
                    "sector": sector,
                    "description": description,
                    "current_price": round(current_price, 4),
                    "change_1d": round(change_1d, 4),
                    "change_7d": round(change_7d, 4),
                    "change_30d": round(change_30d, 4),
                    "change_90d": round(change_90d, 4),
                    "volatility_30d": round(volatility_30d, 4),
                    "ma_7": round(ma_7, 4),
                    "ma_30": round(ma_30, 4),
                    "ma_90": round(ma_90, 4),
                    "momentum_score": round(momentum, 4),
                    "demand_weight": DEMAND_WEIGHTS.get(symbol, 0.0),
                    "history": history,
                    "updated_at": datetime.utcnow().isoformat() + "Z",
                }

            except Exception as e:
                print(f"  Error processing {symbol}: {e}")
                continue

        print(f"  Built payload for {len(result)}/{len(ALL_TICKERS)} tickers")
        return result

    def _cache_is_fresh(self) -> bool:
        if not os.path.exists(self.cache_file):
            return False
        age = datetime.utcnow().timestamp() - os.path.getmtime(self.cache_file)
        return age < CACHE_TTL_SECONDS

    def _load_cache(self) -> dict:
        with open(self.cache_file, "r") as f:
            return json.load(f)

    def _save_cache(self, data: dict):
        with open(self.cache_file, "w") as f:
            json.dump(data, f)
        print(f"Ticker cache saved ({len(data)} tickers)")
