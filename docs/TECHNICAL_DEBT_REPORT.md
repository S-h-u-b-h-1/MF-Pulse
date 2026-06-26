# Technical Debt Report (Phase 10/11)

Ranked by business impact. Honest accounting of what stands between MF Pulse and
institutional-grade reliability.

## High impact
1. **Factsheet metadata breadth (non-SBI).** AUM/expense/manager/holdings exist for 152 SBI
   codes only; every other fund shows "Not yet available". Blocker: Tier-1 AMCs publish
   consolidated PDFs needing **positional parsing (pdfplumber/Python 3.13)** — not installable
   in the dev sandbox; runs on the CI worker. *This is the #1 gap to "replace Morningstar".*
2. **Live DB application of `sql/006`.** The warehouse schema + analytics views are written and
   tested; applying them to Supabase (events/snapshots/intelligence) needs the service role.
   Today the append-only JSONL stores under `data/warehouse/` are the working mirror.
3. **Canonical de-dup in search.** `fund_family.json` exists (60.6% reduction) and insights
   dedup to canonical, but the search dropdown still lists scheme variants (see SEARCH report).

## Medium impact
4. **Daily snapshot series depth.** "What changed" uses 1M-vs-3M momentum (real, available now);
   literal day-over-day deltas need `rank_snapshots.jsonl` to accrue over trading days — the
   pipeline now records it, but history is shallow.
5. **Benchmark-return alpha.** Fund-vs-peer is shown; true fund-vs-index alpha + Sharpe/beta
   need an index NAV series (not ingested).
6. **Real monthly flows.** Flow features remain clearly-labelled sample (SEBI is PDF-only).

## Low impact / hygiene
7. **dbt won't run on Python 3.14** (mashumaro) — transforms done in raw SQL/Python; documented.
8. **MFAPI dependency** for the per-fund NAV chart (secondary source; cached, graceful fallback).
9. **No end-to-end (Playwright) UI tests** — covered by route/build checks + data tests, not DOM.

## Health
- **63+ automated tests**, two of which (`test_data_quality`, `test_scores`) gate CI on data
  correctness; build is clean; deploys are reproducible; no destructive migrations.
- Architecture is bundle-materialized (fast, cacheable) + append-only warehouse — low
  operational risk; the debt is **coverage breadth**, not correctness or stability.
