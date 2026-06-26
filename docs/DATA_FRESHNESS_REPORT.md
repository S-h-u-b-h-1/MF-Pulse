# Data Freshness Report (Phase 5)

- Platform asOf: **2026-06-23**
- Latest AMFI NAV ingested: **2026-06-23**
- Delay vs asOf: **0 day(s)** (current)

## Policy (never imply real-time)
- NAV is **daily**, published by AMFI after market close; MF Pulse never claims intraday data.
- Fund pages show `NAV as of <date>` + a freshness badge (green ≤2d / amber ≤7d / red >7d).
- When AMFI is delayed or markets are closed, the latest available NAV date is shown verbatim.
- Pipeline status + last successful ingestion are on `/data-status`.