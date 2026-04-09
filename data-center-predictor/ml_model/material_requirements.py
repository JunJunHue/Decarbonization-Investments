"""
Convert data center power demand projections (GW) into specific material requirements.

Material intensity coefficients are derived from IEA, LBNL, Goldman Sachs, and
Rocky Mountain Institute studies on hyperscale data center construction.

Baseline assumptions:
  - 2024 global installed IT-load capacity: ~100 GW (hyperscale + colo + enterprise)
  - Annual new builds (base): ~18 GW/year — driven by AI capex commitments
  - PUE ratio: 1.3x (total facility power = IT load × PUE)
  - Material quantities are per MW of installed IT-load capacity
"""

from __future__ import annotations

from typing import TypedDict

# ── Baseline capacity ──────────────────────────────────────────────────────────

# 2024 global installed nameplate IT-load (GW)
DC_BASELINE_GW: float = 100.0

# Annual new-build capacity in each scenario (GW/year) — anchors demand index to reality
ANNUAL_NEW_BUILDS_GW: dict[str, float] = {
    "base":               18.0,
    "bull":               28.0,
    "bear":               10.0,
    "power_crunch":       12.0,
    "nuclear_renaissance": 22.0,
    "copper_shortage":    14.0,
}

# ── Material intensity per MW of new IT-load capacity ─────────────────────────
# Each entry: {dc_construction, power_infra, total} in tons/MW
# dc_construction = building structure, server halls, cooling, electrical in the building
# power_infra      = grid connection, substation, transformer, site power distribution

MATERIAL_INTENSITY: dict[str, dict] = {
    "steel": {
        "dc_construction": 650,   # structural steel, racks, cable trays, raised floor
        "power_infra":      80,   # substations, transformers, switchgear, steel conduit
        "total":           730,
        "unit": "tons/MW",
        "description": "Structural steel, server racks, cable trays, raised floors, switchgear",
        "current_price_per_ton":  680,   # HRC, USD/ton
        "green_premium_per_ton":  260,   # H₂-DRI / EAF green steel premium, USD/ton
        "green_description": "Hydrogen-DRI + electric arc furnace (near-zero CO₂)",
    },
    "cement": {
        "dc_construction": 1_500,  # foundations, raised floors, blast/fire walls
        "power_infra":       50,   # pad-mount transformer foundations, cable duct banks
        "total":          1_550,
        "unit": "tons/MW",
        "description": "Foundations, raised floors, blast walls, cable duct banks",
        "current_price_per_ton":  130,   # OPC, USD/ton
        "green_premium_per_ton":   75,   # CCS clinker / supplementary cementitious materials
        "green_description": "Low-carbon cement: CCS clinker + supplementary cementitious materials",
    },
    "aluminum": {
        "dc_construction": 35,   # cooling coils, bus bars, HVAC, cable trays
        "power_infra":      8,   # overhead distribution lines, conduit
        "total":           43,
        "unit": "tons/MW",
        "description": "Cooling systems, electrical bus bars, HVAC ductwork, overhead lines",
        "current_price_per_ton":  2_350,  # LME Al spot, USD/ton
        "green_premium_per_ton":    420,  # renewable-smelted, USD/ton
        "green_description": "Renewable-powered smelting (hydroelectric or wind)",
    },
    "copper": {
        "dc_construction": 30,   # power distribution (MV/LV), UPS, busduct, grounding
        "power_infra":      4,   # step-down transformers, grounding grid
        "total":           34,
        "unit": "tons/MW",
        "description": "Power distribution, UPS systems, transformers, grounding, busduct",
        "current_price_per_ton":  9_500,  # LME Cu spot, USD/ton
        "green_premium_per_ton":    200,  # recycled / responsibly sourced premium
        "green_description": "High-recycled-content copper with responsible sourcing certification",
    },
    "rare_earths": {
        "dc_construction": 0.75,  # NdFeB permanent magnets in cooling fans, UPS flywheels
        "power_infra":     0.05,  # inverter motors
        "total":           0.80,
        "unit": "tons/MW",
        "description": "NdFeB permanent magnets: cooling fans, UPS flywheel motors, HVAC drives",
        "current_price_per_ton": 50_000,  # NdPr oxide, USD/ton
        "green_premium_per_ton": 10_000,  # non-China / responsibly mined premium
        "green_description": "Non-Chinese supply chain; responsibly mined with full traceability",
    },
}

MATERIAL_ORDER = ["steel", "cement", "aluminum", "copper", "rare_earths"]
MATERIAL_LABELS = {
    "steel":       "Green Steel",
    "cement":      "Low-Carbon Cement",
    "aluminum":    "Renewable Aluminum",
    "copper":      "Recycled Copper",
    "rare_earths": "Responsible Rare Earths",
}


# ── Core projection functions ──────────────────────────────────────────────────

def demand_index_to_gw(
    demand_index_path: list[float],
    scenario: str = "base",
    baseline_gw: float = DC_BASELINE_GW,
) -> list[float]:
    """
    Convert normalised demand index (≈ 1.0 at t=0) to absolute GW of installed capacity.

    The demand index represents the *cumulative* installed base relative to today.
    index 1.5 → 50% more capacity installed than baseline.
    """
    return [baseline_gw * idx for idx in demand_index_path]


def gw_to_annual_material_requirements(
    gw_path: list[float],
    months_per_step: int = 1,
) -> dict[str, dict]:
    """
    Convert a monthly GW path into ANNUAL incremental material requirements.

    Parameters
    ----------
    gw_path : list of GW values at monthly intervals
    months_per_step : how many months each step represents (default 1)

    Returns dict keyed by material with:
        annual_tons_list  : tons required each calendar year
        cumulative_tons   : total over full horizon
        annual_years      : calendar-year labels (Year 1, Year 2 …)
        intensity_per_mw  : tons/MW used
    """
    # Compute incremental new capacity per month (GW)
    incremental_gw = []
    for i in range(1, len(gw_path)):
        delta = max(0.0, gw_path[i] - gw_path[i - 1])
        incremental_gw.append(delta)

    # Aggregate to calendar years (12 months each)
    months_in_path = len(incremental_gw)
    n_years = max(1, (months_in_path + 11) // 12)

    annual_new_gw: list[float] = []
    for yr in range(n_years):
        start = yr * 12
        end = min(start + 12, months_in_path)
        annual_new_gw.append(sum(incremental_gw[start:end]))

    results: dict[str, dict] = {}
    for mat in MATERIAL_ORDER:
        intensity = MATERIAL_INTENSITY[mat]
        tons_per_mw = intensity["total"]

        # Convert GW → MW (×1000) then multiply by intensity
        annual_tons = [gw * 1_000 * tons_per_mw for gw in annual_new_gw]
        cumulative = sum(annual_tons)
        years = [f"Year {i + 1}" for i in range(n_years)]

        results[mat] = {
            "annual_tons": [round(t) for t in annual_tons],
            "cumulative_tons": round(cumulative),
            "annual_years": years,
            "intensity_tons_per_mw": tons_per_mw,
            "label": MATERIAL_LABELS[mat],
            "unit": intensity["unit"],
            "description": intensity["description"],
        }

    return results


def compute_requirements_for_scenario(
    p50_path: list[float],
    scenario: str,
    months: list[str],
) -> dict:
    """
    Full pipeline: demand index → GW → material tons.

    Parameters
    ----------
    p50_path  : P50 median demand-index values (monthly)
    scenario  : scenario key (base / bull / bear / …)
    months    : ISO date strings for each step

    Returns a dict suitable for JSON serialisation.
    """
    gw_path = demand_index_to_gw(p50_path, scenario=scenario)
    material_reqs = gw_to_annual_material_requirements(gw_path)

    # Annotate with price data for dollar value calculations
    for mat, req in material_reqs.items():
        intensity = MATERIAL_INTENSITY[mat]
        cum_tons = req["cumulative_tons"]
        req["cumulative_value_usd"] = round(cum_tons * intensity["current_price_per_ton"])
        req["green_premium_total_usd"] = round(cum_tons * intensity["green_premium_per_ton"])
        req["current_price_per_ton"] = intensity["current_price_per_ton"]
        req["green_premium_per_ton"] = intensity["green_premium_per_ton"]
        req["green_description"] = intensity["green_description"]

    return {
        "scenario": scenario,
        "gw_path": [round(g, 2) for g in gw_path],
        "gw_baseline": DC_BASELINE_GW,
        "months": months,
        "annual_new_builds_gw": ANNUAL_NEW_BUILDS_GW.get(scenario, 18.0),
        "materials": material_reqs,
    }
