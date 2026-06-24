"""
Benchmark intelligence — SEBI category-standard (Tier-1) benchmark per equity category.

This is a deterministic, documented mapping from a fund's category to the standard
benchmark SEBI prescribes for that category. It is labelled as the *category-standard*
benchmark, NOT necessarily the exact benchmark each AMC names in its SID (which lives in
factsheet PDFs). Honest and traceable: the mapping is public SEBI policy.

Total-return (TRI) variants are used because funds are benchmarked against TRI since 2018.
"""

from __future__ import annotations

# category (cleaned) -> SEBI Tier-1 standard benchmark
CATEGORY_BENCHMARK = {
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
    "Equity Savings": "NIFTY Equity Savings TRI",
    "Aggressive Hybrid": "CRISIL Hybrid 35+65 Aggressive Index",
    "Balanced Advantage": "NIFTY 50 Hybrid Composite Debt 50:50 Index",
    "Dynamic Asset Allocation": "NIFTY 50 Hybrid Composite Debt 50:50 Index",
    "Arbitrage": "NIFTY 50 Arbitrage TRI",
    "Multi Asset Allocation": "NIFTY 50 Hybrid Composite Debt 65:35 Index",
}

# sector/thematic funds vary by mandate — flagged, not forced to a wrong index.
THEMATIC_KEYS = ("sectoral", "thematic", "technology", "pharma", "banking", "infrastructure",
                 "consumption", "energy", "fmcg", "psu", "digital", "manufacturing", "healthcare")


def resolve_benchmark(category: str, scheme_name: str = "") -> tuple[str, bool]:
    """Return (benchmark, is_standard). is_standard=False means category-specific index varies."""
    cat = (category or "").strip()
    if cat in CATEGORY_BENCHMARK:
        return CATEGORY_BENCHMARK[cat], True
    blob = f"{cat} {scheme_name}".lower()
    if any(k in blob for k in THEMATIC_KEYS):
        return "Sector/thematic index (varies by mandate)", False
    if "index" in blob or "etf" in blob:
        return "Tracked index (per scheme mandate)", False
    return "NIFTY 500 TRI", False  # sensible diversified-equity default, flagged non-standard
