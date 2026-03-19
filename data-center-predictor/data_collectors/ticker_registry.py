"""
Central registry of all tracked tickers organized by investment theme.
"""

TICKER_UNIVERSE = {
    "ai_demand": {
        "NVDA": "Nvidia — GPU/AI accelerator dominance",
        "AMD": "AMD — GPU/CPU competition to Nvidia",
        "AVGO": "Broadcom — Custom AI ASICs, networking chips",
        "MRVL": "Marvell Technology — Custom silicon, data center networking",
        "ARM": "Arm Holdings — IP behind most AI chips",
        "TSM": "TSMC — Manufactures nearly all advanced AI chips",
        "MSFT": "Microsoft — Azure AI, OpenAI investment",
        "GOOGL": "Alphabet — TPUs, Gemini, cloud AI",
        "AMZN": "Amazon — AWS, Trainium/Inferentia chips",
        "META": "Meta — Llama, massive GPU cluster buildout",
        "ORCL": "Oracle — Fast-growing AI cloud infrastructure",
    },
    "digital_infrastructure": {
        "EQIX": "Equinix — Largest data center REIT globally",
        "DLR": "Digital Realty — Data center REIT",
        "VRT": "Vertiv — Power/cooling systems for data centers",
        "SMCI": "Super Micro Computer — AI server assembly, liquid cooling",
        "DELL": "Dell Technologies — AI server infrastructure",
        "HPE": "Hewlett Packard Enterprise — Enterprise AI/HPC infrastructure",
        "AMT": "American Tower — Tower/edge infrastructure",
        "DTCR": "Global X Data Center ETF",
        "SRVR": "Pacer Data & Infrastructure Real Estate ETF",
    },
    "power_infrastructure": {
        "ETN": "Eaton Corp — Electrical power management, switchgear",
        "GEV": "GE Vernova — Grid turbines, electrification",
        "PWR": "Quanta Services — Grid construction & maintenance",
        "POWL": "Powell Industries — Electrical infrastructure for data centers",
        "HUBB": "Hubbell — Grid hardware, connectors",
        "AMSC": "American Superconductor — Grid-scale power electronics",
        "GNRC": "Generac — Backup power generators for data centers",
    },
    "nuclear": {
        "CEG": "Constellation Energy — Largest US nuclear operator",
        "VST": "Vistra Energy — Nuclear + gas, major data center supplier",
        "ETR": "Entergy — Nuclear-heavy utility",
        "EXC": "Exelon — Large nuclear fleet",
        "OKLO": "Oklo Inc. — Small modular reactors (SMRs)",
        "NNE": "Nano Nuclear Energy — Micro-reactors",
        "SMR": "NuScale Power — SMR developer",
        "BWXT": "BWX Technologies — Nuclear components & fuel manufacturing",
        "CCJ": "Cameco — World's largest uranium miner",
        "UEC": "Uranium Energy Corp — US-focused uranium mining",
        "DNN": "Denison Mines — Uranium exploration/development",
        "UUUU": "Energy Fuels — Uranium + rare earth processing",
        "URA": "Global X Uranium ETF",
        "URNM": "Sprott Uranium Miners ETF",
    },
    "natural_gas": {
        "LNG": "Cheniere Energy — Largest US LNG exporter",
        "EQT": "EQT Corp — Largest US natural gas producer",
        "AR": "Antero Resources — Gas producer, Appalachian basin",
        "KMI": "Kinder Morgan — Gas pipeline infrastructure",
        "ET": "Energy Transfer — Massive midstream pipeline network",
        "TRGP": "Targa Resources — Gas processing & pipelines",
    },
    "renewables": {
        "NEE": "NextEra Energy — Largest renewable energy producer",
        "BEP": "Brookfield Renewable Partners — Diversified global renewables",
        "FSLR": "First Solar — Domestic solar panel manufacturing",
        "ENPH": "Enphase Energy — Solar microinverters",
        "BE": "Bloom Energy — Fuel cells for data center baseload",
        "PLUG": "Plug Power — Hydrogen fuel cells",
        "ICLN": "iShares Global Clean Energy ETF",
    },
    "fiber_networking": {
        "GLW": "Corning — Dominant fiber optic cable manufacturer",
        "COHR": "Coherent Corp — Optical components, transceivers",
        "CIEN": "Ciena — Optical networking for hyperscale",
        "ANET": "Arista Networks — AI/cloud data center switching",
        "CSCO": "Cisco — Networking backbone",
        "INFN": "Infinera — Optical transport networking",
        "VIAV": "Viavi Solutions — Optical test & measurement",
        "LITE": "Lumentum — Optical/photonic components",
    },
    "copper_minerals": {
        "FCX": "Freeport-McMoRan — Largest publicly traded copper producer",
        "SCCO": "Southern Copper — High-margin copper giant",
        "BHP": "BHP Group — Diversified mining, major copper exposure",
        "RIO": "Rio Tinto — Copper, lithium, iron ore",
        "TECK": "Teck Resources — Copper-focused after coal spinoff",
        "COPX": "Global X Copper Miners ETF",
        "CPER": "US Copper Index Fund ETF",
        "MP": "MP Materials — Only US rare earth mine operator",
        "ALB": "Albemarle — Lithium",
        "LAC": "Lithium Americas — Lithium development",
        "PICK": "iShares MSCI Global Metals & Mining ETF",
    },
    "broad_etfs": {
        "BOTZ": "Global X Robotics & AI ETF",
        "CHAT": "Roundhill Generative AI & Technology ETF",
        "AIQ": "Global X AI & Technology ETF",
        "WTAI": "WisdomTree Artificial Intelligence ETF",
        "ROBT": "First Trust Nasdaq AI & Robotics ETF",
        "GRID": "First Trust NASDAQ Clean Edge Smart Grid Infrastructure ETF",
    },
}

# Flat list of all tickers for batch fetching
ALL_TICKERS = [
    ticker
    for sector_tickers in TICKER_UNIVERSE.values()
    for ticker in sector_tickers.keys()
]

# Reverse lookup: ticker → sector
TICKER_TO_SECTOR = {
    ticker: sector
    for sector, tickers in TICKER_UNIVERSE.items()
    for ticker in tickers.keys()
}

# Weights for composite demand index (must sum to 1.0)
# Tickers not listed here are non-drivers (tracked but not used in index)
DEMAND_WEIGHTS = {
    "NVDA": 0.12,   # GPU demand is the clearest direct proxy for AI compute
    "TSM": 0.08,    # Chip manufacturing capacity gating AI buildout
    "EQIX": 0.07,   # Data center floorspace absorption
    "VRT": 0.06,    # Cooling demand = power density growth signal
    "CEG": 0.06,    # Nuclear = long-duration power contracts for DCs
    "ETN": 0.05,    # Grid power management — bottleneck signal
    "GEV": 0.05,    # Grid turbine orderbook = power buildout pace
    "PWR": 0.05,    # Grid construction spending
    "MSFT": 0.05,   # Azure AI capex commitments
    "GOOGL": 0.05,  # GCP + TPU buildout
    "AMZN": 0.05,   # AWS capex
    "META": 0.04,   # GPU cluster expansion
    "FCX": 0.04,    # Copper = physical infrastructure demand signal
    "ANET": 0.04,   # Data center networking switches
    "GLW": 0.03,    # Fiber deployment pace
    "AMD": 0.03,    # GPU competition / supply diversification
    "CCJ": 0.03,    # Uranium demand = nuclear growth
    "DLR": 0.03,    # Data center REIT occupancy
    "SMCI": 0.03,   # AI server build rates
    "AVGO": 0.03,   # Custom ASIC / networking chip demand
    # Remaining tickers tracked but weight=0 in index
}

# Thematic composite signals (sector-level)
THEMATIC_SIGNALS = {
    "power_scarcity": {
        "tickers": ["ETN", "GEV", "PWR", "POWL", "HUBB"],
        "description": "Grid infrastructure buildout pace — higher = more power demand pressure",
    },
    "nuclear_momentum": {
        "tickers": ["CEG", "VST", "CCJ", "URA", "BWXT"],
        "description": "Nuclear energy demand for long-term data center contracts",
    },
    "copper_demand": {
        "tickers": ["FCX", "SCCO", "COPX", "BHP", "RIO"],
        "description": "Copper demand proxy — wiring, cooling, physical infrastructure",
    },
    "ai_compute": {
        "tickers": ["NVDA", "TSM", "AMD", "AVGO", "MRVL"],
        "description": "AI compute capacity proxy — chip demand & manufacturing",
    },
    "dc_buildout": {
        "tickers": ["EQIX", "DLR", "VRT", "SMCI", "AMT"],
        "description": "Physical data center construction and infrastructure",
    },
    "grid_buildout": {
        "tickers": ["PWR", "ETN", "GEV", "HUBB", "GNRC"],
        "description": "Electrical grid expansion and hardening",
    },
}

SECTOR_LABELS = {
    "ai_demand": "AI Demand & Hyperscalers",
    "digital_infrastructure": "Digital Infrastructure",
    "power_infrastructure": "Power Infrastructure & Grid",
    "nuclear": "Nuclear Energy",
    "natural_gas": "Natural Gas",
    "renewables": "Renewables",
    "fiber_networking": "Fiber Optics & Networking",
    "copper_minerals": "Copper & Critical Minerals",
    "broad_etfs": "Broad AI/Infrastructure ETFs",
}
