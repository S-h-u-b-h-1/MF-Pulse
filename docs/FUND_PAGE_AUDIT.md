# Fund Page Audit (Phase 4)

Goal: every fund page is the definitive research page; **sections with no verified data are
hidden — no placeholders, no fake values.** `/fund/[scheme_code]`.

## Sections & data-source status
| Section | Source | Shown when |
|---|---|---|
| Identity (name, AMC, category, plan/option, latest NAV + date, freshness badge) | AMFI | always |
| Health Score (grade, breakdown, confidence, explanation) | computed (lib/fundHealth.js) | when returns/risk exist |
| Performance 1W–5Y (3Y/5Y annualised) | AMFI NAV | per-window, hidden if absent |
| Category rank / percentile / trend | computed | when in an equity-Growth cohort |
| NAV trend chart (range switch, high/low/drawdown) | MFAPI on-demand | when history fetched |
| Risk panel (vol 30/90, downside, max drawdown, neg days, consistency) | 90d daily series | when ≥15 obs |
| **Portfolio risk** (concentration, top-3 sectors, top-10) | factsheet | when holdings/sectors exist |
| Peer comparison (cohort avg/median, best peer, rank) | computed | when cohort exists |
| **Benchmark & peers** (benchmark name + 1W–5Y fund-vs-peer) | SEBI map + NAV | when benchmark + cohort |
| Portfolio & metadata (AUM, expense, manager, riskometer, holdings, sectors) | factsheet PDF | **real values only**, else "Not yet available" |
| Signals (positive / caution / warnings) | computed | when notable |
| Research summary (deterministic) | computed | always |
| Data quality (history points, freshness, source) | computed | always |
| Source + as-of + "dated factsheet" badge | lineage | when metadata present |

## Audit findings
- **No placeholders found** — unpopulated metadata renders an explicit "Not yet available from
  source" line, not a fake value; IDCW funds now show no distorted returns (suppressed at source).
- **Data freshness** is on every page (NAV date + badge); footer states "daily data, not real-time".
- **Sharpe/Sortino** intentionally absent until a validated risk-free + sufficient-history path
  exists (not faked) — see SCORE_VALIDATION_REPORT.
- **Gaps:** AUM/expense/manager/holdings populated only for SBI (152 codes); every other fund
  honestly shows "Not yet available". This is the platform's main completeness gap, tracked in
  METADATA_COMPLETENESS_REPORT.

## Verdict
A fund page can replace multiple research sites **for performance, risk, benchmark and
category context across the active universe**; full factsheet depth (holdings/manager/cost) is
SBI-only today — labelled, never faked.
