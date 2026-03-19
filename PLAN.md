# Data Center Demand Predictor — Advanced Enhancement Plan

## Objective
Upgrade the existing data center demand predictor with:
1. **Monte Carlo simulation engine** for probabilistic demand forecasting
2. **Comprehensive ticker tracking** across all AI infrastructure themes
3. **Real-time data pipeline** with live price feeds and news sentiment
4. **Enhanced frontend dashboard** with simulation visualizations

---

## Current State

### What Exists
- Flask API with 7 endpoints (`/api/predict-future`, `/api/collect-data`, etc.)
- ML ensemble (Random Forest, Gradient Boosting, XGBoost, LightGBM) trained on synthetic targets
- Data collectors for: copper (HG=F), energy (IYE), 5 tech stocks (META, GOOGL, MSFT, AAPL, AMZN)
- React frontend with `DataCenterPredictor.tsx`, `SolutionsSection.tsx`
- News scraper for 5 materials (steel, cement, aluminum, copper, rare earths)

### Core Gaps
- Only 5 tickers tracked (vs. 80+ needed)
- Point-estimate predictions only — no uncertainty/confidence intervals
- No Monte Carlo simulation
- No sector-level aggregation or portfolio view
- No real-time price streaming
- Investment themes not connected to demand drivers

---

## Phase 1 — Comprehensive Ticker Data Infrastructure

### 1.1 Ticker Registry (`data_collectors/ticker_registry.py`)
Create a centralized registry of all tickers organized by theme:

```python
TICKER_UNIVERSE = {
    "ai_demand": {
        "NVDA": "Nvidia - GPU/AI accelerators",
        "AMD": "AMD - GPU/CPU competition",
        "AVGO": "Broadcom - Custom AI ASICs",
        "MRVL": "Marvell - Custom silicon, networking",
        "ARM": "Arm Holdings - AI chip IP",
        "TSM": "TSMC - Manufactures all advanced AI chips",
        "MSFT": "Microsoft - Azure AI, OpenAI",
        "GOOGL": "Alphabet - TPUs, Gemini, cloud AI",
        "AMZN": "Amazon - AWS, Trainium/Inferentia",
        "META": "Meta - Llama, massive GPU clusters",
        "ORCL": "Oracle - Fast-growing AI cloud",
    },
    "digital_infrastructure": {
        "EQIX": "Equinix - Largest data center REIT",
        "DLR": "Digital Realty - Data center REIT",
        "VRT": "Vertiv - Power/cooling systems",
        "SMCI": "Super Micro - AI server assembly",
        "DELL": "Dell - AI server infrastructure",
        "HPE": "Hewlett Packard Enterprise - HPC",
        "AMT": "American Tower - Edge infrastructure",
        "DTCR": "Global X Data Center ETF",
        "SRVR": "Pacer Data & Infrastructure REIT ETF",
    },
    "power_infrastructure": {
        "ETN": "Eaton - Electrical power management",
        "GEV": "GE Vernova - Grid turbines",
        "PWR": "Quanta Services - Grid construction",
        "POWL": "Powell Industries - Electrical infra",
        "HUBB": "Hubbell - Grid hardware",
        "AMSC": "American Superconductor - Power electronics",
        "GNRC": "Generac - Backup power generators",
    },
    "nuclear": {
        "CEG": "Constellation Energy - Largest US nuclear",
        "VST": "Vistra Energy - Nuclear + gas",
        "ETR": "Entergy - Nuclear-heavy utility",
        "EXC": "Exelon - Large nuclear fleet",
        "OKLO": "Oklo - Small modular reactors",
        "NNE": "Nano Nuclear Energy - Micro-reactors",
        "SMR": "NuScale Power - SMR developer",
        "BWXT": "BWX Technologies - Nuclear components",
        "CCJ": "Cameco - Largest uranium miner",
        "UEC": "Uranium Energy Corp - US uranium",
        "DNN": "Denison Mines - Uranium exploration",
        "UUUU": "Energy Fuels - Uranium + rare earths",
        "URA": "Global X Uranium ETF",
        "URNM": "Sprott Uranium Miners ETF",
    },
    "natural_gas": {
        "LNG": "Cheniere Energy - Largest US LNG exporter",
        "EQT": "EQT Corp - Largest US gas producer",
        "AR": "Antero Resources - Appalachian gas",
        "KMI": "Kinder Morgan - Gas pipelines",
        "ET": "Energy Transfer - Midstream pipelines",
        "TRGP": "Targa Resources - Gas processing",
    },
    "renewables": {
        "NEE": "NextEra - Largest renewable producer",
        "BEP": "Brookfield Renewable Partners",
        "FSLR": "First Solar - Domestic solar panels",
        "ENPH": "Enphase Energy - Solar microinverters",
        "BE": "Bloom Energy - Fuel cells",
        "PLUG": "Plug Power - Hydrogen fuel cells",
        "ICLN": "iShares Global Clean Energy ETF",
    },
    "fiber_networking": {
        "GLW": "Corning - Fiber optic cables",
        "COHR": "Coherent Corp - Optical components",
        "CIEN": "Ciena - Optical networking",
        "ANET": "Arista Networks - AI/cloud switching",
        "CSCO": "Cisco - Networking backbone",
        "INFN": "Infinera - Optical transport",
        "VIAV": "Viavi Solutions - Optical test",
        "LITE": "Lumentum - Optical/photonic components",
    },
    "copper_minerals": {
        "FCX": "Freeport-McMoRan - Largest copper producer",
        "SCCO": "Southern Copper - High-margin copper",
        "BHP": "BHP Group - Diversified mining",
        "RIO": "Rio Tinto - Copper, lithium, iron",
        "TECK": "Teck Resources - Copper-focused",
        "COPX": "Global X Copper Miners ETF",
        "CPER": "US Copper Index Fund ETF",
        "MP": "MP Materials - Only US rare earth mine",
        "ALB": "Albemarle - Lithium",
        "LAC": "Lithium Americas - Lithium dev",
        "PICK": "iShares MSCI Global Metals & Mining ETF",
    },
    "broad_etfs": {
        "BOTZ": "Global X Robotics & AI ETF",
        "CHAT": "Roundhill Generative AI ETF",
        "AIQ": "Global X AI & Technology ETF",
        "WTAI": "WisdomTree AI ETF",
        "ROBT": "First Trust Nasdaq AI & Robotics ETF",
        "GRID": "First Trust NASDAQ Smart Grid ETF",
    },
}

# Demand driver weights for Monte Carlo model
DEMAND_WEIGHTS = {
    "NVDA": 0.15,   # GPU demand is direct proxy for AI compute
    "TSM": 0.10,    # Chip manufacturing capacity
    "EQIX": 0.08,   # Data center space demand
    "VRT": 0.07,    # Cooling = power density signal
    "CEG": 0.06,    # Nuclear = long-term power contracts
    "ETN": 0.06,    # Grid infrastructure buildout
    "PWR": 0.05,    # Grid construction pace
    "MSFT": 0.05,
    "GOOGL": 0.05,
    "AMZN": 0.05,
    "FCX": 0.04,    # Copper = physical infra demand
    "GLW": 0.04,    # Fiber = network backbone
    # Remaining weight distributed across other tickers
}
```

### 1.2 Enhanced Data Aggregator (`data_collectors/ticker_collector.py`)
- Batch-fetch all tickers from yfinance (handles 80+ tickers efficiently)
- Calculate per-ticker: price, 7d/30d/90d MA, volatility, momentum score
- Sector-level aggregation: weighted avg price change, sector momentum
- Output: `data/ticker_data.json` (updated on demand)

### 1.3 Real-Time Streaming (`data_collectors/realtime_feed.py`)
- Poll yfinance every 60s during market hours (9:30 AM–4 PM ET)
- Cache results in `data/realtime_cache.json`
- Emit updates via Flask-SocketIO for live frontend updates
- Rate limit: batch all tickers in single yfinance download call

---

## Phase 2 — Monte Carlo Simulation Engine

### 2.1 Core Simulation (`ml_model/monte_carlo.py`)

**Algorithm Design:**
```
Monte Carlo Data Center Demand Simulation
==========================================
Inputs:
  - Current composite demand index (baseline)
  - Historical volatility per demand driver
  - Correlation matrix between drivers
  - N simulations (default: 10,000)
  - T time horizon (days)

Process:
  For each simulation i in 1..N:
    1. Generate correlated random returns using Cholesky decomposition
       - Decompose correlation matrix: L = cholesky(Σ)
       - Sample Z ~ N(0,1) for each driver
       - Correlated returns: r = μ + L * Z * σ

    2. Simulate each demand driver path:
       - Use Geometric Brownian Motion (GBM):
         S(t) = S(0) * exp((μ - σ²/2)*t + σ*√t*Z)
       - Apply mean-reversion (Ornstein-Uhlenbeck) for commodities

    3. Compute composite demand index at each timestep:
       D(t) = Σ weight_k * normalized_driver_k(t)

    4. Store full path D(0..T) for simulation i

Outputs:
  - 10,000 x T matrix of demand paths
  - Percentile bands: P5, P25, P50 (median), P75, P95
  - Expected value (mean path)
  - Probability of demand exceeding thresholds
  - Value at Risk (VaR): P5 at horizon T
  - Conditional VaR (CVaR/Expected Shortfall)
```

**Key Classes:**
```python
class MonteCarloSimulator:
    def __init__(self, n_simulations=10000, seed=42):
        self.n_simulations = n_simulations

    def estimate_parameters(self, historical_data: pd.DataFrame) -> dict:
        """Estimate drift (μ) and volatility (σ) for each driver"""
        # Compute log returns
        # Estimate annualized μ and σ
        # Build correlation matrix via Pearson/Spearman
        # Return: {ticker: {mu, sigma}, correlation_matrix}

    def cholesky_correlated_paths(
        self,
        mu: np.ndarray,
        sigma: np.ndarray,
        corr_matrix: np.ndarray,
        T: int,
        S0: np.ndarray
    ) -> np.ndarray:
        """Generate N correlated GBM paths using Cholesky decomposition"""
        L = np.linalg.cholesky(corr_matrix)
        # Shape: (n_simulations, n_drivers, T)

    def apply_mean_reversion(
        self,
        paths: np.ndarray,
        theta: float,  # mean reversion speed
        long_run_mean: float
    ) -> np.ndarray:
        """Ornstein-Uhlenbeck process for commodity prices"""
        # dX = θ(μ - X)dt + σdW

    def simulate(
        self,
        historical_data: pd.DataFrame,
        months_ahead: int = 12,
        scenario: str = "base"  # "base", "bull", "bear"
    ) -> SimulationResult:
        """Run full Monte Carlo simulation"""

    def compute_statistics(self, paths: np.ndarray) -> dict:
        """
        Returns:
          - percentiles: {5, 10, 25, 50, 75, 90, 95} at each timestep
          - mean_path
          - var_95: Value at Risk at 95% confidence
          - cvar_95: Conditional VaR
          - prob_above_threshold: P(demand > current * 1.5)
          - fan_chart_data: formatted for frontend
        """

class ScenarioManager:
    """Pre-defined scenarios with parameter overrides"""
    SCENARIOS = {
        "base": {"drift_multiplier": 1.0, "vol_multiplier": 1.0},
        "bull": {
            "drift_multiplier": 1.5,   # Higher growth
            "vol_multiplier": 0.8,     # Lower uncertainty
            "description": "AI capex accelerates, no power constraints"
        },
        "bear": {
            "drift_multiplier": 0.5,   # Lower growth
            "vol_multiplier": 1.5,     # Higher uncertainty
            "description": "Regulation, power scarcity, macro slowdown"
        },
        "power_crunch": {
            "driver_shocks": {"ETN": -0.3, "CEG": -0.2, "GEV": -0.25},
            "description": "Grid bottleneck limits data center buildout"
        },
        "nuclear_renaissance": {
            "driver_shocks": {"CEG": +0.4, "CCJ": +0.3, "VST": +0.35},
            "description": "Nuclear SMRs approved, cheap baseload power"
        },
        "copper_shortage": {
            "driver_shocks": {"FCX": -0.25, "SCCO": -0.20},
            "description": "Copper supply deficit delays physical buildout"
        }
    }
```

### 2.2 New API Endpoints (`api/app.py` additions)

```
POST /api/simulate
  Body: { months_ahead: int, n_simulations: int, scenario: str }
  Returns: {
    percentiles: { P5, P25, P50, P75, P95 } arrays,
    mean_path,
    dates,
    statistics: { var_95, cvar_95, prob_exceed_150pct },
    scenario_used
  }

POST /api/simulate-scenarios
  Body: { months_ahead: int }
  Returns: { base, bull, bear, power_crunch, nuclear_renaissance, copper_shortage }
  (Runs all 6 scenarios, returns fan charts for each)

GET /api/tickers
  Returns: all ticker data organized by sector
  Query params: ?sector=nuclear&period=30d

GET /api/ticker/:symbol
  Returns: detailed single ticker data + rolling stats

GET /api/sector-momentum
  Returns: weighted momentum score per sector
  Used for: "which themes are heating up?"

GET /api/correlation-matrix
  Returns: correlation matrix for demand drivers
  Used for: visualizing driver relationships
```

### 2.3 Simulation Performance Targets
- 10,000 simulations × 365 days in < 2 seconds (vectorized numpy)
- Use `numba` JIT compilation for inner loop if needed
- Cache simulation results for 5 minutes (parameters unchanged)

---

## Phase 3 — Frontend Dashboard Enhancements

### 3.1 Monte Carlo Visualization Component (`DataCenterPredictor.tsx`)

**Fan Chart** (confidence interval bands):
```
Replace single LineChart with layered area chart:
- P5-P95 band: very light fill (5% opacity)
- P25-P75 band: medium fill (15% opacity)
- P50 median line: solid, 2px
- Mean path: dashed
- Current point: dot marker

Scenario overlay:
- Toggle buttons: Base | Bull | Bear | Power Crunch | Nuclear | Copper
- Each scenario shown as distinct colored path
```

**Statistics Cards:**
```
Current:     [ Median Forecast ] [ P95 Upside ] [ P5 Downside ]
Risk:        [ VaR 95% ] [ Prob > 150% ] [ Expected Shortfall ]
Drivers:     Top 3 positive drivers | Top 3 negative drivers
```

### 3.2 Ticker Dashboard Component (`TickerDashboard.tsx`)

**Sector Tabs:**
- AI Demand | Digital Infra | Power | Nuclear | Gas | Renewables | Fiber | Copper | ETFs

**Per-Ticker Row:**
- Ticker symbol | Company name | Current price | 1d% | 7d% | 30d% | Momentum score | Demand weight

**Sector Heatmap:**
- Grid of sectors, colored by 30-day performance
- Click to drill into sector

**Key Thematic Signals:**
```
Power Scarcity Index:    [ETN + GEV + PWR + POWL composite]
Nuclear Momentum:        [CEG + VST + CCJ + URA composite]
Copper Demand Signal:    [FCX + SCCO + COPX composite]
AI Compute Proxy:        [NVDA + TSM + AMD composite]
Grid Buildout Pace:      [PWR + ETN + GEV + HUBB composite]
```

### 3.3 Correlation Matrix Component (`CorrelationMatrix.tsx`)
- Heatmap of correlations between top 20 demand drivers
- Hover to see value + relationship description
- Helps explain why certain sectors move together

---

## Phase 4 — Real-Time Data Pipeline

### 4.1 Polling Architecture
```
Market Hours (9:30 AM - 4 PM ET):
  Every 60s → batch fetch all tickers → update cache → broadcast via SSE

After Hours:
  Every 15min → fetch delayed quotes → update cache

News Scraping:
  Every 4h → scrape Google News RSS for all ticker keywords
  Sentiment score: positive/negative/neutral per ticker
  Store last 48h of articles per sector
```

### 4.2 Server-Sent Events (`/api/stream`)
```python
@app.route('/api/stream')
def stream():
    """SSE endpoint for real-time price updates"""
    def generate():
        while True:
            data = get_cached_ticker_data()
            yield f"data: {json.dumps(data)}\n\n"
            time.sleep(60)
    return Response(generate(), mimetype='text/event-stream')
```

### 4.3 Data Freshness Indicators
- Show last-updated timestamp per ticker
- "LIVE" badge when within 2 minutes
- "DELAYED" badge for after-hours data
- "CACHED" badge for demo/offline mode

---

## Implementation Order

### Step 1: Ticker Registry + Collector (1-2 days)
**Files to create/modify:**
- `data_collectors/ticker_registry.py` — new file, all 80+ tickers + weights
- `data_collectors/ticker_collector.py` — new file, batch yfinance fetcher
- `api/app.py` — add `/api/tickers` and `/api/sector-momentum` endpoints

**Deliverable:** All 80+ tickers fetched and cached in `data/ticker_data.json`

### Step 2: Monte Carlo Engine (2-3 days)
**Files to create:**
- `ml_model/monte_carlo.py` — simulation engine
- `ml_model/scenario_manager.py` — 6 pre-built scenarios

**Modify:**
- `api/app.py` — add `/api/simulate` and `/api/simulate-scenarios` endpoints
- `requirements.txt` — add `scipy` for statistical functions, `numba` for performance

**Deliverable:** POST `/api/simulate` returns fan chart data with P5/P25/P50/P75/P95 bands

### Step 3: Frontend — Ticker Dashboard (1-2 days)
**Files to create:**
- `src/components/TickerDashboard.tsx` — sector tabs + ticker rows
- `src/components/SectorHeatmap.tsx` — color-coded sector performance

**Modify:**
- `src/App.tsx` — add TickerDashboard route/section
- `decarbonization-website/package.json` — no new deps needed (recharts already installed)

**Deliverable:** Full ticker dashboard with all 80+ tickers organized by sector

### Step 4: Frontend — Monte Carlo Visualization (1-2 days)
**Files to modify:**
- `src/components/DataCenterPredictor.tsx` — add fan chart, scenario toggles, risk stats

**Deliverable:** Fan chart with confidence bands + scenario comparison overlay

### Step 5: Real-Time Pipeline (1 day)
**Files to modify:**
- `api/app.py` — add SSE `/api/stream` endpoint + background polling thread
- `src/components/DataCenterPredictor.tsx` — consume SSE updates

**Deliverable:** Prices update in real-time during market hours

---

## Technical Decisions

### Monte Carlo: Why GBM + Cholesky?
- **GBM** (Geometric Brownian Motion) is standard for equity price paths — log-normal distribution prevents negative prices, multiplicative shocks
- **Cholesky decomposition** preserves empirical correlations between drivers — NVDA and TSM are highly correlated, ignoring this would understate tail risk
- **Ornstein-Uhlenbeck** for commodities (copper, uranium) — commodity prices mean-revert to marginal cost of production, unlike equities

### Ticker Data: Why yfinance over paid APIs?
- Free, no API key required, handles 80+ tickers in batch download
- 15-min delay is acceptable for investment research (not HFT)
- Fallback to cached data if rate-limited

### Why SSE over WebSockets?
- SSE is unidirectional (server → client) which is all we need
- Simpler to implement in Flask (no additional library)
- Native browser support, auto-reconnect built in

---

## Dependencies to Add

```
# requirements.txt additions
scipy>=1.11.0          # Statistical distributions for Monte Carlo
numba>=0.58.0          # JIT compilation for simulation inner loop (optional)
flask-sse>=1.0.0       # Server-Sent Events helper
redis>=5.0.0           # Optional: cache layer for simulation results
```

---

## Success Metrics
- [ ] All 80+ tickers fetchable and cached
- [ ] Monte Carlo simulation returns in < 3 seconds for 10,000 paths × 12 months
- [ ] Fan chart renders with 6 confidence bands
- [ ] 6 scenarios (base/bull/bear/power_crunch/nuclear/copper) all functional
- [ ] Ticker dashboard loads sector data in < 2 seconds
- [ ] Real-time updates fire every 60s during market hours
- [ ] Correlation matrix computed and visualized for top 20 drivers
