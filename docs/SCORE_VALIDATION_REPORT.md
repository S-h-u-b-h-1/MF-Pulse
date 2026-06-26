# Score Validation Report (Phase 6)

Every score is a **pure, documented function** — re-runnable by any engineer, validated in CI
(`tests/test_scores.py`, `tests/test_health.py`, `tests/test_explain.py`).

## Fund Health Score — `frontend/app/lib/fundHealth.js`
| Component | Weight | Input | Range |
|---|---|---|---|
| Performance | 30% | 1M/3M return + category percentile | 0–100 |
| Consistency | 20% | % non-negative daily NAV days (90d) | 0–100 |
| Risk | 20% | `100 − vol90·2 − |maxdd90|·1.5` | 0–100 |
| Category rank | 15% | peer percentile (Direct/Regular separate) | 0–100 |
| Data quality | 10% | freshness + history depth + mapping | 0–100 |
| Cost | 5% | expense ratio (when ingested) | 0–100 |
| Factsheet | 8% | metadata completeness + diversification (when real) | 0–100 |

Weights of **available** components renormalise to 100% (cost/factsheet omitted, never faked).
Grades: A ≥85 · B ≥70 · C ≥55 · D ≥40 · E <40. **Range 0–100, validated on real data.**

## Attention Score — `scripts/explain.py`
`novelty` (decile crossing +30 / decline +10) + `magnitude` (`|rank_change|·2`, cap 40) +
`persistence` (3-month base, ≤15) + `category_deviation` (`(r1m − cat_avg)·3`, cap 15).
Max 100. Tiers: **High ≥70 · Medium ≥45 · Low <45 (suppressed)**.

## Trend Score — `scripts/build_performance.py`
`clamp(50 + (r1m − r3m/3)·4, 0, 100)` — short-vs-medium momentum. Range 0–100.

## Risk profile — `scripts/build_performance.py`
Volatility = stdev(daily NAV returns)·√252·100; downside = negative-day stdev; max drawdown =
worst peak-to-trough over the window; consistency = % non-negative days. All from a real
≥90-day daily series (≥15 observations required, else omitted).

## Validation dataset
The committed `funds.json` (8.5k active schemes). CI asserts: all health/trend/attention
scores ∈ [0,100]; reproducible (same input → same output); Low-value attention items
suppressed. **If a score cannot be kept in range it fails the build — it is not displayed.**

## Disabled until validated
- **Sharpe / Sortino:** require a risk-free + (Sortino) downside series we surface, but the
  fund page only shows them when ≥3y history supports them — otherwise hidden, not faked.
- **Benchmark-return alpha:** needs an index NAV series (not yet ingested) → fund-vs-peer is
  shown instead, clearly labelled.
