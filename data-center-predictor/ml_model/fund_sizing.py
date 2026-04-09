"""
Fund size justification and offtake agreement sizing.

Logic:
  1. Material requirements are derived from demand projections (see material_requirements.py).
  2. The fund targets GREEN / decarbonized versions of those materials.
  3. Fund capital bridges the "green premium" — the extra cost to source low-carbon materials
     vs. conventional supply — and secures multi-year offtake agreements.
  4. Offtake agreements are pre-sold to hyperscaler tech companies as part of their
     Scope 3 decarbonization commitments.

Fund mechanism:
  - Equity investment in supply-chain producers (green steel mills, low-carbon cement,
    responsible rare-earth processors, recycled-copper smelters).
  - Producers agree to supply fixed volumes at a green premium over a contract term.
  - Fund earns: equity upside + green-premium spread + carbon-credit optionality.
  - Hyperscalers lock in supply certainty and Scope 3 reduction claims.
"""

from __future__ import annotations

from .material_requirements import MATERIAL_INTENSITY, MATERIAL_LABELS, MATERIAL_ORDER

# ── Fund parameters ────────────────────────────────────────────────────────────

# What share of incremental green-material demand the fund targets capturing
FUND_MARKET_CAPTURE = 0.15   # 15% of addressable incremental market

# Equity investment leverage: $1 of fund equity finances $N in project debt
INVESTMENT_LEVERAGE = 4.5

# Contract term for offtake agreements (years)
OFFTAKE_TERM_YEARS = 7

# Target IRR (for presentation only — not used in sizing math)
TARGET_IRR = 0.22   # 22% gross IRR

# Hyperscaler addressable demand share — fraction of new DC capacity built by the 5 majors
HYPERSCALER_SHARE = 0.60   # MSFT, GOOGL, AMZN, META, ORCL ≈ 60% of new hyperscale GW

# ── Fund sizing ────────────────────────────────────────────────────────────────

def compute_fund_sizing(material_requirements: dict[str, dict]) -> dict:
    """
    Compute total fund size, offtake volumes, and investment breakdown.

    Parameters
    ----------
    material_requirements : output of material_requirements.gw_to_annual_material_requirements()

    Returns
    -------
    dict with keys:
        total_fund_size_usd
        equity_deployment_usd
        total_offtake_volume (per material)
        per_material breakdown
        narrative
    """
    per_material: dict[str, dict] = {}
    total_green_premium_usd = 0.0
    total_offtake_tons = 0.0

    for mat in MATERIAL_ORDER:
        req = material_requirements.get(mat, {})
        intensity = MATERIAL_INTENSITY[mat]

        cum_tons = req.get("cumulative_tons", 0)
        green_premium_per_ton = intensity["green_premium_per_ton"]
        current_price_per_ton = intensity["current_price_per_ton"]

        # Addressable market = hyperscaler share of total new-build demand
        hyperscaler_tons = cum_tons * HYPERSCALER_SHARE

        # Fund captures FUND_MARKET_CAPTURE of that
        fund_offtake_tons = hyperscaler_tons * FUND_MARKET_CAPTURE

        # Revenue from green premium over contract term
        green_premium_revenue = fund_offtake_tons * green_premium_per_ton

        # Equity needed to finance that supply (using leverage)
        equity_needed = green_premium_revenue / INVESTMENT_LEVERAGE

        # Total value of offtake at market price
        offtake_market_value = fund_offtake_tons * current_price_per_ton

        per_material[mat] = {
            "label": MATERIAL_LABELS[mat],
            "cumulative_market_tons": round(cum_tons),
            "hyperscaler_addressable_tons": round(hyperscaler_tons),
            "fund_offtake_tons": round(fund_offtake_tons),
            "green_premium_per_ton": green_premium_per_ton,
            "green_premium_revenue_usd": round(green_premium_revenue),
            "equity_needed_usd": round(equity_needed),
            "offtake_market_value_usd": round(offtake_market_value),
            "offtake_term_years": OFFTAKE_TERM_YEARS,
            "green_description": intensity["green_description"],
        }

        total_green_premium_usd += green_premium_revenue
        total_offtake_tons += fund_offtake_tons

    # Total fund size = sum of equity needed across all materials
    total_equity_needed = sum(v["equity_needed_usd"] for v in per_material.values())

    # Round up to a clean fund size (nearest $50M)
    import math
    fund_size = math.ceil(total_equity_needed / 50_000_000) * 50_000_000

    # Total offtake value (market price, not just premium)
    total_offtake_market_value = sum(v["offtake_market_value_usd"] for v in per_material.values())

    return {
        "fund_size_usd": fund_size,
        "fund_size_label": f"${fund_size / 1e9:.2f}B" if fund_size >= 1e9 else f"${fund_size / 1e6:.0f}M",
        "equity_deployment_usd": round(total_equity_needed),
        "total_green_premium_usd": round(total_green_premium_usd),
        "total_offtake_tons": round(total_offtake_tons),
        "total_offtake_market_value_usd": round(total_offtake_market_value),
        "investment_leverage": INVESTMENT_LEVERAGE,
        "fund_market_capture": FUND_MARKET_CAPTURE,
        "hyperscaler_share": HYPERSCALER_SHARE,
        "offtake_term_years": OFFTAKE_TERM_YEARS,
        "target_irr": TARGET_IRR,
        "per_material": per_material,
    }


def build_narrative(fund_data: dict, scenario: str, annual_new_builds_gw: float) -> dict:
    """
    Build investor-facing narrative from fund sizing data.
    """
    size_label = fund_data["fund_size_label"]
    offtake_val = fund_data["total_offtake_market_value_usd"] / 1e9
    green_rev = fund_data["total_green_premium_usd"] / 1e6
    capture = int(fund_data["fund_market_capture"] * 100)
    term = fund_data["offtake_term_years"]
    lev = fund_data["investment_leverage"]

    top_material = max(
        fund_data["per_material"].items(),
        key=lambda kv: kv[1]["green_premium_revenue_usd"],
    )
    top_mat_label = top_material[1]["label"]
    top_mat_offtake = top_material[1]["fund_offtake_tons"]

    return {
        "headline": f"{size_label} fund securing {capture}% of hyperscaler green-material offtake",
        "sub_headline": (
            f"Anchored by {annual_new_builds_gw:.0f} GW/year of new data center construction "
            f"({scenario} scenario), generating ${offtake_val:.1f}B in offtake market value "
            f"over {term} years."
        ),
        "key_points": [
            f"${size_label} equity vehicle deploying at {lev}x leverage into upstream supply chains",
            f"Locks in {capture}% of hyperscaler incremental green-material demand across 5 materials",
            f"Largest opportunity: {top_mat_label} ({top_mat_offtake:,.0f} tons offtake secured)",
            f"${green_rev:.0f}M total green-premium revenue stream over {term}-year contract horizon",
            f"Scope 3 offtake agreements pre-sold to MSFT, GOOGL, AMZN, META, ORCL",
            f"Target gross IRR: {int(fund_data['target_irr'] * 100)}% driven by premium spread + equity upside",
        ],
    }
