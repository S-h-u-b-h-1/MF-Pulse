# MF Pulse — Data Collection Architecture

MF Pulse continuously collects two streams of structured intelligence with zero data loss:
**market intelligence** (what funds are doing) and **user-interest intelligence** (what users
research).

```
  AMFI NAV ─┐                         ┌─ funds.json (analytical layer)
            ├─ build_performance ─────┤
 NAV history┘                         └─ build_snapshots ─► fact_daily_*_snapshot (append-only/day)
                                                         └─► daily_intelligence ─► fact_daily_intelligence
 AMC factsheets ─► ingest_factsheets ─► metadata.json + source_files.jsonl (sha256 lineage)
                                      └─► validate_metadata ─► fact_validation_errors
 Browser ─► track() ─► user_events / fact_user_events ─► analytics views (v_*)
```

## Streams
1. **Market** — daily snapshots (market/category/AMC) + deterministic "what-changed" insights,
   from real NAV + factsheet data. See `MARKET_TRENDS_SCHEMA.md`.
2. **Behavioural** — first-party event stream, enriched + deduped, into an append-only store
   with analytics views. See `USER_EVENT_TRACKING.md`.
3. **Lineage** — every acquired source file checksummed (`fact_source_files`); every ingest
   validated (`fact_validation_errors`); every run logged (`fact_pipeline_runs`).

## Orchestration
- `scripts/factsheet_pipeline.py`: acquire → validate → snapshots → intelligence → coverage.
- `.github/workflows/factsheets.yml`: monthly, no manual intervention.
- Daily NAV cron rebuilds funds.json and should call `build_snapshots` once per trading day to
  grow the historical snapshot series (which the intelligence engine diffs).

## Stores
- **SQL (Supabase):** `sql/006_warehouse.sql` — events, snapshots, intelligence, manager/
  portfolio snapshots, errors, source files, analytics views. Additive, RLS-protected.
- **File (git-versioned):** `data/warehouse/*.jsonl` — append-only mirror that runs today
  without DB write access (zero-loss, plain-text backup).

## Guarantee
See `ZERO_DATA_LOSS_POLICY.md`. Nothing is overwritten; every behavioural event and every
day's snapshot is retained permanently.
