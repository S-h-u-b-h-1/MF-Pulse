-- 006_warehouse.sql — structured, append-only financial + behavioural data warehouse.
-- Additive only: no destructive migrations, no overwrites. Idempotent (IF NOT EXISTS).
-- Behavioural events are append-only; daily snapshots are keyed by date (one immutable row
-- per day, retained historically); analytics are read-only views.

-- ============================================================================
-- PHASE 1 — behavioural events (zero data loss)
-- ============================================================================
-- The frontend already inserts into user_events (public-insert RLS). Harden it additively
-- with the structured columns; existing rows keep their data.
alter table if exists user_events add column if not exists entity_type text;
alter table if exists user_events add column if not exists entity_id   text;
alter table if exists user_events add column if not exists page_path   text;
alter table if exists user_events add column if not exists referrer    text;
alter table if exists user_events add column if not exists user_agent  text;
alter table if exists user_events add column if not exists device_type text;
alter table if exists user_events add column if not exists user_id     text;

-- Canonical append-only event store (event_id immutable, never updated/deleted).
create table if not exists fact_user_events (
  event_id    bigint generated always as identity primary key,
  session_id  text,
  user_id     text,
  event_type  text not null,
  entity_type text,          -- fund | amc | category | search | watchlist | comparison | export | alert | chart | page
  entity_id   text,
  page_path   text,
  referrer    text,
  user_agent  text,
  device_type text,          -- mobile | tablet | desktop
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists ix_events_type_time on fact_user_events (event_type, created_at desc);
create index if not exists ix_events_entity on fact_user_events (entity_type, entity_id);
create index if not exists ix_events_session on fact_user_events (session_id, created_at);

-- Per-event-type access views (the fact_* names from the spec, as filtered views over the
-- single append-only store — one source of truth, no duplicated writes).
create or replace view v_fund_views        as select * from fact_user_events where event_type = 'fund_view';
create or replace view v_search_events      as select * from fact_user_events where event_type = 'search';
create or replace view v_category_views     as select * from fact_user_events where event_type = 'category_view';
create or replace view v_amc_views          as select * from fact_user_events where event_type = 'amc_view';
create or replace view v_watchlist_events    as select * from fact_user_events where event_type in ('fund_watchlist_add','fund_watchlist_remove');
create or replace view v_comparison_events   as select * from fact_user_events where event_type in ('comparison_created','comparison_loaded');
create or replace view v_export_events       as select * from fact_user_events where event_type in ('export','export_clicked');
create or replace view v_alert_events        as select * from fact_user_events where event_type = 'alert_signup';
create or replace view v_chart_events        as select * from fact_user_events where event_type in ('chart_range_changed','time_range_changed');

-- ============================================================================
-- PHASE 2 — market trend snapshots (one immutable row per day)
-- ============================================================================
create table if not exists fact_daily_market_snapshot (
  snapshot_date       date primary key,
  total_schemes       int, active_schemes int,
  trend_ready_count   int, risk_ready_count int, research_ready_count int,
  top_category_30d    text, top_amc_30d text, top_fund_30d text,
  market_breadth      numeric, avg_return_30d numeric, avg_volatility_90d numeric,
  created_at          timestamptz not null default now()
);

create table if not exists fact_daily_category_snapshot (
  snapshot_date    date not null, category text not null,
  fund_count       int, avg_return_30d numeric, avg_return_90d numeric,
  avg_health_score numeric, positive_fund_pct numeric,
  top_fund_code    text, worst_fund_code text,
  created_at       timestamptz not null default now(),
  primary key (snapshot_date, category)
);

create table if not exists fact_daily_amc_snapshot (
  snapshot_date         date not null, amc text not null,
  active_fund_count     int, avg_return_30d numeric, avg_health_score numeric,
  top_fund_code         text, worst_fund_code text, metadata_coverage_pct numeric,
  created_at            timestamptz not null default now(),
  primary key (snapshot_date, amc)
);

-- ============================================================================
-- PHASE 3 — daily "what changed" intelligence (deterministic, traceable)
-- ============================================================================
create table if not exists fact_daily_intelligence (
  id                bigint generated always as identity primary key,
  intelligence_date date not null,
  intelligence_type text not null,     -- new_top_fund | enter_top_decile | exit_top_decile |
                                       -- category_leader_change | amc_leader_change | risk_warning |
                                       -- stale_warning | metadata_improved | factsheet_acquired
  entity_type       text, entity_id text,
  title             text not null, summary text,
  severity          text,              -- info | positive | caution | warning
  source_metric     text, previous_value text, current_value text,
  created_at        timestamptz not null default now()
);
create index if not exists ix_intel_date on fact_daily_intelligence (intelligence_date desc, intelligence_type);

-- ============================================================================
-- PHASE 6 — manager & portfolio quality snapshots
-- ============================================================================
create table if not exists fact_manager_daily_snapshot (
  snapshot_date    date not null, manager_slug text not null, manager_name text,
  funds_managed    int, avg_health_score numeric, avg_return_1y numeric, category_leaders int,
  created_at       timestamptz not null default now(),
  primary key (snapshot_date, manager_slug)
);

create table if not exists fact_portfolio_quality_snapshot (
  snapshot_date        date not null, scheme_code text not null,
  concentration_score  numeric, diversification_score numeric, sector_concentration numeric,
  top_holding_pct      numeric, portfolio_risk_score numeric, source_date date,
  created_at           timestamptz not null default now(),
  primary key (snapshot_date, scheme_code)
);

-- ============================================================================
-- PHASE 7 — data quality & lineage safety
-- ============================================================================
create table if not exists fact_source_files (
  id            bigint generated always as identity primary key,
  source        text not null,        -- e.g. "SBI factsheet PDF"
  source_url    text, amc text, scheme_hint text,
  sha256        text, byte_size bigint, source_date date,
  downloaded_at timestamptz not null default now()
);
create index if not exists ix_source_sha on fact_source_files (sha256);

create table if not exists fact_ingestion_errors (
  id          bigint generated always as identity primary key,
  pipeline    text not null, stage text, amc text, scheme_hint text,
  error       text, raw jsonb, created_at timestamptz not null default now()
);

create table if not exists fact_validation_errors (
  id          bigint generated always as identity primary key,
  scheme_code text, field text, problem text, value text,
  source      text, created_at timestamptz not null default now()
);

-- ============================================================================
-- PHASE 4 — analytics views
-- ============================================================================
create or replace view v_top_searches as
  select lower(metadata->>'q') as query, count(*) as n
  from fact_user_events where event_type = 'search' and coalesce(metadata->>'q','') <> ''
  group by 1 order by n desc;

create or replace view v_top_funds_viewed as
  select entity_id as scheme_code, count(*) as views, count(distinct session_id) as sessions
  from fact_user_events where event_type = 'fund_view' and entity_id is not null
  group by 1 order by views desc;

create or replace view v_top_categories_viewed as
  select coalesce(entity_id, metadata->>'category') as category, count(*) as views
  from fact_user_events where event_type = 'category_view' group by 1 order by views desc;

create or replace view v_watchlist_trends as
  select date_trunc('day', created_at) as day,
         count(*) filter (where event_type='fund_watchlist_add')    as adds,
         count(*) filter (where event_type='fund_watchlist_remove') as removes
  from fact_user_events where event_type in ('fund_watchlist_add','fund_watchlist_remove')
  group by 1 order by 1 desc;

create or replace view v_conversion_funnel as
  select count(distinct session_id) filter (where event_type='page_view')      as visited,
         count(distinct session_id) filter (where event_type='search')         as searched,
         count(distinct session_id) filter (where event_type='fund_view')      as viewed_fund,
         count(distinct session_id) filter (where event_type like 'fund_watchlist%') as watchlisted,
         count(distinct session_id) filter (where event_type='alert_signup')   as signed_up
  from fact_user_events;

create or replace view v_daily_active_sessions as
  select date_trunc('day', created_at) as day, count(distinct session_id) as sessions, count(*) as events
  from fact_user_events group by 1 order by 1 desc;

create or replace view v_user_interest_trends as
  select date_trunc('day', created_at) as day, entity_type, count(*) as events
  from fact_user_events where entity_type is not null group by 1,2 order by 1 desc, 3 desc;

-- ============================================================================
-- RLS: public read on snapshots/intelligence; events keep public-insert; pipeline tables
-- are written by the service role only (no anon writes).
-- ============================================================================
alter table fact_user_events                enable row level security;
alter table fact_daily_market_snapshot      enable row level security;
alter table fact_daily_category_snapshot    enable row level security;
alter table fact_daily_amc_snapshot         enable row level security;
alter table fact_daily_intelligence         enable row level security;
alter table fact_manager_daily_snapshot     enable row level security;
alter table fact_portfolio_quality_snapshot enable row level security;
alter table fact_source_files               enable row level security;
alter table fact_ingestion_errors           enable row level security;
alter table fact_validation_errors          enable row level security;
do $$ begin
  create policy p_insert on fact_user_events for insert with check (true);
  create policy p_read on fact_user_events for select using (true);
  create policy p_read on fact_daily_market_snapshot      for select using (true);
  create policy p_read on fact_daily_category_snapshot    for select using (true);
  create policy p_read on fact_daily_amc_snapshot         for select using (true);
  create policy p_read on fact_daily_intelligence         for select using (true);
  create policy p_read on fact_manager_daily_snapshot     for select using (true);
  create policy p_read on fact_portfolio_quality_snapshot for select using (true);
exception when duplicate_object then null; end $$;
