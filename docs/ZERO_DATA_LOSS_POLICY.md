# MF Pulse — Zero Data Loss Policy

MF Pulse is a **structured data warehouse**, not just a website. Every write flow is
append-only or idempotent-by-key; nothing is destructively overwritten.

## Write flows & their guarantees
| Flow | Store | Guarantee |
|---|---|---|
| NAV ingestion | `fact_nav_daily` (date-keyed) | idempotent upsert per (scheme, date); history retained |
| Factsheet metadata | `metadata.json` + `dim_scheme_metadata` | source_url + source_date + **sha256** lineage per file (`data/warehouse/source_files.jsonl`) |
| User events | `user_events` / `fact_user_events` | **append-only** (event_id immutable); enriched context written inside `payload` so nothing is lost pre-migration |
| Market snapshots | `fact_daily_*_snapshot` + `data/warehouse/*.jsonl` | one immutable row per day; re-run replaces only that day, **prior days retained** (tested) |
| Daily intelligence | `fact_daily_intelligence` + `intelligence.jsonl` | **append-only** insight log |
| Pipeline runs | `fact_pipeline_runs` | append-only |
| Errors | `fact_ingestion_errors`, `fact_validation_errors` | append-only |

## Safeguards
- **Additive migrations only** — `006_warehouse.sql` uses `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`; no `DROP`, no destructive `ALTER`.
- **Idempotent upserts** — snapshots keyed by date; re-running a day is safe and lossless (`test_append_only_no_data_loss`).
- **Source checksums** — every acquired factsheet's sha256 + byte size + source_date logged.
- **Validation before ingest** — impossible values rejected (`normalize.validate`), captured in `fact_validation_errors`.
- **Backup export** — the JSONL warehouse files under `data/warehouse/` are plain-text, versioned in git (daily backup-by-commit); the Supabase tables are the queryable mirror.
- **Tracking never breaks the page** — `track()` is fully wrapped in try/catch with `keepalive` beacons.

## Anti-overwrite rule
Behavioural events are **never** updated or deleted. Snapshots are immutable per day. Only
derived analytical bundles (funds.json/metadata.json) are regenerated — and their source
lineage is preserved in the append-only stores.
