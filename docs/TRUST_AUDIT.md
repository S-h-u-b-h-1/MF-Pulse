# Trust Audit (Phase 11)

**Data Trust Score: 100/100**

## Validation (must be zero)
| Check | Count |
|---|---|
| Duplicate scheme codes | 0 |
| Scores out of 0–100 range | 0 |
| Impossible returns | 0 |
| Impossible volatility | 0 |
| Impossible expense ratios | 0 |
| Negative AUM | 0 |
| Sector allocations >105% | 0 |

## Reproducibility
- Every displayed number traces to AMFI NAV (returns/risk), the SEBI category map (benchmark) or a checksummed factsheet PDF (metadata).
- Scores are pure functions (`lib/fundHealth.js`, `scripts/explain.py`) with documented weights — re-runnable by any engineer.
- The CI suites `tests/test_data_quality.py` and `tests/test_scores.py` fail the build if any of the above counts is non-zero.