# MF Pulse — Metadata Coverage Report (Phase 5)

_As of 2026-06-23. Real factsheet metadata only — `python -m scripts.coverage_audit`._

## Coverage tracker by AMC
| AMC | Schemes acquired (funds) | Codes parsed | Benchmark | AUM | Riskometer | Sectors | Holdings | Manager |
|---|---|---|---|---|---|---|---|---|
| **SBI** | 50 | **152** | 134 | 152 | 152 | 152 | 26 | 12 |
| HDFC | 1 (consolidated, fetched) | 0 | — | — | — | — | — | — |
| ICICI / Nippon / others | 0 | 0 | — | — | — | — | — | — |

## Field coverage of the 152 ingested codes
| Field | Coverage |
|---|---|
| AUM | **152/152 (100%)** |
| Riskometer | **152/152 (100%)** |
| Launch date | **152/152 (100%)** |
| Sector allocation | **152/152 (100%)** |
| Benchmark (factsheet) | 134/152 (88%) |
| Top holdings | 26/152 (17%) |
| Fund manager | 12/152 (8%, multi-manager lists only) |
| Expense ratio | 0/152 (not in SBI per-scheme layout → cost score off, not faked) |

## Against the success criteria (% of 8,611 active universe)
| Metric | Start | Now | Target |
|---|---|---|---|
| **Benchmark coverage** | 29.5% | **53.0%** | 98% |
| Metadata coverage | 0.6% | **1.8%** | 25% |
| Holdings coverage | 0.6% | 0.3% | 25% |
| Sector coverage | 0.6% | 1.8% | 25% |
| AUM coverage | 0.6% | 1.8% | 25% |
| Manager coverage | 0.6% | 0.1% | 25% |

## Honest read
- **Benchmark nearly doubled** (29.5→53%) by extending the SEBI category-standard mapping to
  debt + hybrid (real, documented CRISIL/NIFTY indices) — and lifted FULLY-analyzable schemes
  from 2,329 → 4,380.
- **Factsheet metadata tripled** (52→152 codes) but is still **1.8%** of the active universe.
  Reaching 25% needs per-AMC parsers for the consolidated Tier-1 layouts (positional
  extraction) — that work is scoped, not done, and not faked.
- The 25% targets are **not met this cycle**. Per the mandate (*Trust > Coverage*), real,
  source-dated coverage was expanded as far as the SBI per-scheme source allows rather than
  manufacturing a number from unreliable extraction.
