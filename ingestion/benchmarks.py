"""
Benchmark intelligence — SEBI category-standard (Tier-1) benchmark per category.

Deterministic, documented mapping from a fund's category to the standard benchmark SEBI
prescribes for that category (equity, debt and hybrid). Labelled as the *category-standard*
benchmark — the exact index an individual AMC names in its SID may be a Tier-2 variant, which
comes from the factsheet. A category with no single standard benchmark (sectoral/thematic,
index/ETF, FoF, solution, multi-asset) returns None rather than a guess.

TRI variants are used for equity (funds are TRI-benchmarked since 2018); CRISIL total-return
debt indices for debt categories.
"""

from __future__ import annotations

CATEGORY_BENCHMARK = {
    # ---- equity ----
    "Large Cap": "NIFTY 100 TRI",
    "Large & Mid Cap": "NIFTY LargeMidcap 250 TRI",
    "Large and Mid Cap": "NIFTY LargeMidcap 250 TRI",
    "Mid Cap": "NIFTY Midcap 150 TRI",
    "Small Cap": "NIFTY Smallcap 250 TRI",
    "Multi Cap": "NIFTY 500 Multicap 50:25:25 TRI",
    "Flexi Cap": "NIFTY 500 TRI",
    "ELSS": "NIFTY 500 TRI",
    "Focused": "NIFTY 500 TRI",
    "Value": "NIFTY 500 TRI",
    "Contra": "NIFTY 500 TRI",
    "Dividend Yield": "NIFTY 500 TRI",
    # ---- hybrid ----
    "Aggressive Hybrid": "CRISIL Hybrid 35+65 Aggressive Index",
    "Conservative Hybrid": "CRISIL Hybrid 85+15 Conservative Index",
    "Balanced Advantage": "NIFTY 50 Hybrid Composite Debt 50:50 Index",
    "Dynamic Asset Allocation": "NIFTY 50 Hybrid Composite Debt 50:50 Index",
    "Equity Savings": "NIFTY Equity Savings TRI",
    "Arbitrage": "Nifty 50 Arbitrage Index",
    # ---- debt (SEBI Tier-1 CRISIL standards) ----
    "Overnight": "CRISIL Overnight Index",
    "Liquid": "CRISIL Liquid Debt A-I Index",
    "Ultra Short Duration": "CRISIL Ultra Short Duration Debt A-I Index",
    "Low Duration": "CRISIL Low Duration Debt A-I Index",
    "Money Market": "CRISIL Money Market A-I Index",
    "Short Duration": "CRISIL Short Duration Debt A-II Index",
    "Medium Duration": "CRISIL Medium Duration Debt A-III Index",
    "Medium to Long Duration": "CRISIL Medium to Long Duration Debt A-III Index",
    "Long Duration": "CRISIL Long Duration Debt A-III Index",
    "Dynamic Bond": "CRISIL Dynamic Bond A-III Index",
    "Corporate Bond": "CRISIL Corporate Debt A-II Index",
    "Credit Risk": "CRISIL Credit Risk Debt B-II Index",
    "Banking and PSU": "CRISIL Banking and PSU Debt Index",
    "Gilt": "CRISIL Dynamic Gilt Index",
    "Floater": "CRISIL Short Duration Debt A-II Index",
}

EQUITY_DEFAULT = "NIFTY 500 TRI"
# categories where no single standard benchmark applies → None (honest)
VARIES_KEYS = ("sectoral", "thematic", "index", "etf", "fund of fund", "fof",
               "multi asset", "solution", "retirement", "children", "global")


def resolve_benchmark(category: str, scheme_name: str = "", asset_class: str = "") -> tuple:
    """Return (benchmark|None, is_standard). None when no confident category benchmark exists."""
    cat = (category or "").strip()
    if cat in CATEGORY_BENCHMARK:
        return CATEGORY_BENCHMARK[cat], True
    blob = f"{cat} {scheme_name}".lower()
    if any(k in blob for k in VARIES_KEYS):
        return None, False
    # diversified equity not explicitly listed → NIFTY 500 TRI (flagged non-standard)
    if asset_class == "Equity":
        return EQUITY_DEFAULT, False
    return None, False
