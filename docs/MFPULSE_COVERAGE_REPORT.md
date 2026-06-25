# MF Pulse — Coverage Report (Explainability)

_As of 2026-06-23. Can MF Pulse **explain** a fund, not just analyse it? Real data only._

## The 9 investor questions — answerable for how many of 8,611 active funds?
| Question | Data needed | Answerable | % |
|---|---|---|---|
| 1. What is this fund? | identity (AMFI) | 8,611 | 100% |
| 2. What does it own? | holdings/sectors (factsheet) | 152 | 1.8% |
| 3. Who manages it? | manager (factsheet) | ~12 | 0.1% |
| 4. What benchmark? | benchmark mapping | 4,560 | 53.0% |
| 5. Is it outperforming? | returns + benchmark/peers | 4,560 | 53.0% |
| 6. How risky? | volatility/drawdown | 8,468 | 98.3% |
| 7. Is it improving? | trend (90D+) | 8,396 | 97.5% |
| 8. How expensive? | expense ratio (factsheet) | 0 | 0% |
| 9. What to research next? | peers/category | 8,611 | 100% |

## Explainability tiers (of active universe)
| Tier | Meaning | Count | % |
|---|---|---|---|
| **FULLY EXPLAINABLE** | benchmark + portfolio + AUM + riskometer | 152 | 1.8% |
| **PARTIALLY EXPLAINABLE** | benchmark + performance + risk (no portfolio) | 4,376 | 50.8% |
| **ANALYZABLE ONLY** | performance + risk, no benchmark/metadata | 3,868 | 44.9% |
| **UNANALYZABLE** | <90 days history | 215 | 2.5% |

### MF Pulse Coverage Score: 77.4/100

## The brutal truth
- MF Pulse can **analyse** ~97% of active funds (performance/risk/trend).
- It can **contextualise** ~53% (benchmark to judge against).
- It can **fully explain** only **1.8%** (the SBI factsheet slice).
- **No fund can answer 'how expensive is it'** — expense-ratio coverage is 0% (TER not in the SBI per-scheme layout, not estimated).

## Why — the single bottleneck
Non-SBI metadata. SBI publishes clean per-scheme PDFs; the rest publish **consolidated** PDFs whose per-scheme data is split across pages / multi-column tables. pypdf can't attribute it; reliable parsing needs **positional extraction (pdfplumber/camelot)** which requires **Python 3.13** (unavailable in the dev sandbox; present on the GitHub Actions cron runner). That single capability unblocks ICICI/HDFC/Nippon/Kotak metadata + expense ratios.

## Highest-ROI roadmap (Phase 2)
| Rank | Action | Unlocks | Effort |
|---|---|---|---|
| 1 | pdfplumber HDFC/ICICI/Nippon parser on the Py3.13 cron | metadata+expense for ~3 AMCs (~500 codes) → expense/cost score live | M |
| 2 | Improve SBI holdings extraction (debt bond formats) | holdings 17%→~60% of SBI | S |
| 3 | Activate daily NAV cron | 3Y/5Y coverage rises over time | S |
| 4 | Kotak/DSP/UTI per-scheme probing (SBI pattern) | more clean-source AMCs | S each |

## Advisor readiness (Phase 7)
| Persona | Can use daily? | Strength | Gap |
|---|---|---|---|
| Retail investor | **Yes** | performance/risk/health on ~8,400 funds, screener, watchlist | no expense/holdings for most |
| Research analyst | **Mostly** | real returns, risk, benchmark context, category/AMC intel | metadata depth (holdings/manager) thin |
| Distributor/MFD | Partial | screener + health + benchmark | client-ready exports + cost data |
| Family office | Partial | risk + concentration (SBI) + watchlist | full portfolio/holdings coverage |
| Journalist | **Yes** | category/AMC leaders, real momentum, trustworthy + sourced | flow data is sample |

## PMF (Phase 8)
- **Daily reason to open:** real fund performance + health + risk across nearly the whole active universe — trustworthy and source-dated.
- **Uniquely valuable:** honesty (everything sourced/dated; nothing fabricated) + benchmark-aware health scoring on real NAV.
- **Still missing:** holdings/manager/expense for non-SBI funds; real monthly flows.
- **What stops paying:** metadata depth — advisors need holdings + expense to fully replace incumbents.
- **What earns a recommendation:** the trust posture + analytical breadth already do for performance/risk users.