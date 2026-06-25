# MF Pulse — Benchmark Quality Report (Phase 6)

SEBI prescribes a Tier-1 standard benchmark per category. MF Pulse maps every fund to its
category-standard benchmark (`ingestion/benchmarks.py`), and shows the AMC's factsheet-stated
benchmark where ingested. A category with no single standard benchmark returns **None** —
never a guess.

## Coverage
- **53.0%** of the active universe (4,560 / 8,611) now carries a category-standard benchmark
  — up from 29.5% after extending the mapping from equity-only to debt + hybrid.
- 24 distinct benchmark indices in use, all real.

## Validated index families
| Family | Examples | Categories |
|---|---|---|
| NIFTY equity TRI | NIFTY 100 TRI, Midcap 150 TRI, Smallcap 250 TRI, 500 TRI, 500 Multicap 50:25:25 TRI | Large/Mid/Small/Flexi/Multi/ELSS/Focused/Value |
| CRISIL debt | Liquid Debt A-I, Overnight, Ultra Short / Low / Short / Medium Duration A-x, Money Market A-I, Corporate Debt A-II, Credit Risk B-II, Banking & PSU, Dynamic Gilt | all debt durations |
| Hybrid | CRISIL Hybrid 35+65 Aggressive, 85+15 Conservative, NIFTY 50 Hybrid Composite Debt 50:50, NIFTY Equity Savings, Nifty 50 Arbitrage | hybrid sleeves |

## Intentionally unmapped (returns None — correct)
Sectoral/Thematic (benchmark varies by theme), Index/ETF (tracks its own index), Fund-of-Funds,
Solution-oriented (retirement/children), Global, Multi-Asset — assigning one standard
benchmark here would be wrong, so MF Pulse shows none rather than a misleading index.

## Mapping-error detection
- Equity funds default to NIFTY 500 TRI only when no specific category matches, and are
  flagged `benchmarkStd=false` so the UI can distinguish standard vs fallback.
- Debt funds never receive an equity benchmark (the old bug where unknown categories defaulted
  to NIFTY 500 is fixed — debt/unknown now return None unless explicitly mapped).
- Factsheet-stated benchmarks (134 SBI codes) cross-check the category mapping; mismatches are
  visible on the fund page (factsheet benchmark shown when present, category-standard otherwise).
