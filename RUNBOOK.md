# MF Pulse — Operational Runbook

## ▶ Activate live daily ingestion (the #1 freshness lever)
The daily pipeline + cron are built and idempotent; they only need the service-role key.
1. Supabase → Project Settings → API → copy the **`service_role`** secret key.
2. GitHub repo → Settings → Secrets and variables → Actions → New secret:
   name `SUPABASE_SERVICE_ROLE_KEY`, value = that key.
3. Done. The **Daily NAV pipeline** workflow runs at 8pm IST Mon–Sat (or run it now
   via Actions → "Daily NAV pipeline" → Run workflow). Each run: ingests fresh NAV,
   records `fact_pipeline_runs`, snapshots `fact_system_health`, refreshes matviews.
   `/data-status` flips **green** once NAV is ≤ 2 days old.

To run once locally instead: `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… python -m scripts.cloud_pipeline`

## Connect real monthly flows (removes the last "sample")
Export the SEBI/AMFI monthly net-flow report to a CSV (or the AMFI monthly Excel),
then `python -m ingestion.sebi_flows <file>` (CSV) or `load_excel(<xlsx>, month)`.
No code change — the loaders are ready; the source is just PDF-only today.

## Monitoring
- **Live status page**: `/status` (data freshness, scheme coverage, signals, API reachability).
- **Health endpoint**: `GET /health` on the API → `{"status":"up","db":true}`.
- **Error tracking** (optional): set `SENTRY_DSN` (API) and `NEXT_PUBLIC_SENTRY_DSN` (frontend) to stream errors to Sentry. Both are no-ops when unset.
- **Uptime**: point UptimeRobot (or similar) at `/health` and the status page, 5-min interval.

## Daily pipeline (Airflow DAG `mfpulse_daily`)
`download → parse_and_load → dbt build → quality_gate → deliver_alerts → notify`
- Schedule: `30 20 * * 1-6` (8:30pm IST, Mon–Sat).
- Quality gate halts the run on: negative NAVs, unexpected asset classes, stale data (>5d), or scheme count < 8000.

## Common incidents

| Symptom | Likely cause | Action |
|---|---|---|
| Status page shows **stale NAV** | AMFI file didn't publish / parse failed | Re-run `python -m ingestion.load_nav`; check AMFI URL `portal.amfiindia.com/spages/NAVAll.txt` |
| `quality_gate` fails on scheme count | Partial/broken load | Inspect `dim_scheme` count; re-run loader; do not promote |
| API slow | Redis down (cache cold) | Cache fails open — restart Redis; latency normalises after warm-up |
| Dashboard shows no flows | `fact_flow_monthly` empty | Run `python -m ingestion.sebi_flows <csv>` or `load_excel(<xlsx>, month)` |
| Alerts not sending | `RESEND_API_KEY` unset | Delivery runs in dry-run; set the key to enable |

## Cache invalidation
After a fresh load, flush cached aggregations:
`curl -X POST $API/api/cache/flush -H "x-flush-secret: $CACHE_FLUSH_SECRET"`

## Manual commands
```bash
python -m ingestion.load_nav            # download + load today's NAVs
python -m ingestion.quality_gate        # exit 1 on any quality failure
python -m ingestion.spike_detect        # (via seed script) recompute flow signals
python -m ingestion.alert_delivery      # send/ dry-run alert emails
```
