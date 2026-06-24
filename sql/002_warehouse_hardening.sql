-- MF Pulse — warehouse hardening (Phases 2/5/9). Applied to Supabase (FinPulse).
-- Data philosophy: never overwrite history; every fact carries source + ingest time;
-- pipeline runs and health snapshots are append-only audit logs.

-- ---- Lineage on existing facts ----
ALTER TABLE fact_nav_daily
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'AMFI:NAVAll',
  ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE fact_flow_monthly
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'sample',
  ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE flow_signals
  ADD COLUMN IF NOT EXISTS computed_at TIMESTAMPTZ DEFAULT now();

-- ---- Structured, analytics-ready events (Phase 5) ----
ALTER TABLE user_events
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_value TEXT,
  ADD COLUMN IF NOT EXISTS page TEXT;
CREATE INDEX IF NOT EXISTS idx_events_entity  ON user_events (entity_type, entity_value);
CREATE INDEX IF NOT EXISTS idx_events_session ON user_events (session_id);

-- ---- Append-only pipeline run log (audit) ----
CREATE TABLE IF NOT EXISTS fact_pipeline_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pipeline TEXT NOT NULL, status TEXT NOT NULL, source TEXT, source_date DATE,
  rows_ingested INTEGER, duration_ms INTEGER, error TEXT,
  started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_time ON fact_pipeline_runs (finished_at DESC);
ALTER TABLE fact_pipeline_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_runs" ON fact_pipeline_runs FOR SELECT USING (true);
GRANT SELECT ON fact_pipeline_runs TO anon, authenticated;

-- ---- Append-only system-health snapshots ----
CREATE TABLE IF NOT EXISTS fact_system_health (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nav_latest_date DATE, nav_staleness_days INTEGER,
  total_schemes INTEGER, total_amcs INTEGER, total_nav_rows BIGINT,
  total_events BIGINT, flow_latest_month DATE, status TEXT
);
CREATE INDEX IF NOT EXISTS idx_health_time ON fact_system_health (captured_at DESC);
ALTER TABLE fact_system_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_health" ON fact_system_health FOR SELECT USING (true);
GRANT SELECT ON fact_system_health TO anon, authenticated;

CREATE OR REPLACE VIEW v_latest_health AS
  SELECT * FROM fact_system_health ORDER BY captured_at DESC LIMIT 1;
CREATE OR REPLACE VIEW v_recent_runs AS
  SELECT pipeline, status, source, source_date, rows_ingested, duration_ms, finished_at
  FROM fact_pipeline_runs ORDER BY finished_at DESC LIMIT 20;
GRANT SELECT ON v_latest_health, v_recent_runs TO anon, authenticated;
