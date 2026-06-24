-- 004_fund_metadata.sql
-- Fund metadata / portfolio / benchmark / risk / health warehouse (Phase 3).
--
-- These tables back deeper fund research once AMC factsheets are parsed. Today the live
-- product computes risk + Health Score in the frontend from the AMFI-built bundle
-- (lib/fundHealth.js + funds.json); these are the source-traceable, historical, idempotent
-- warehouse equivalents the pipeline can populate. Metadata that has no machine-readable
-- source yet (AUM, expense, benchmark, manager, holdings) is left NULL and surfaced as
-- "Not yet available from source" — never fabricated.

create table if not exists dim_scheme_metadata (
  scheme_code           text primary key,
  benchmark             text,
  fund_manager          text,
  launch_date           date,
  expense_ratio         numeric,
  direct_expense_ratio  numeric,
  regular_expense_ratio numeric,
  aum_crores            numeric,
  riskometer            text,
  exit_load             text,
  minimum_sip           numeric,
  minimum_lumpsum       numeric,
  source                text,
  source_date           date,
  ingested_at           timestamptz not null default now()
);

create table if not exists fact_scheme_portfolio (
  scheme_code  text not null,
  as_of_date   date not null,
  holding_name text not null,
  holding_type text,            -- equity | debt | cash | other
  sector       text,
  percentage   numeric,
  source       text,
  ingested_at  timestamptz not null default now(),
  primary key (scheme_code, as_of_date, holding_name)
);

create table if not exists fact_scheme_sector_allocation (
  scheme_code           text not null,
  as_of_date            date not null,
  sector                text not null,
  allocation_percentage numeric,
  source                text,
  ingested_at           timestamptz not null default now(),
  primary key (scheme_code, as_of_date, sector)
);

create table if not exists fact_scheme_benchmark_returns (
  benchmark   text not null,
  as_of_date  date not null,
  return_1m   numeric, return_3m numeric, return_6m numeric,
  return_1y   numeric, return_3y numeric, return_5y numeric,
  source      text,
  ingested_at timestamptz not null default now(),
  primary key (benchmark, as_of_date)
);

create table if not exists fact_scheme_risk_metrics (
  scheme_code            text not null,
  as_of_date             date not null,
  volatility_30d         numeric,
  volatility_90d         numeric,
  downside_volatility_90d numeric,
  max_drawdown_90d       numeric,
  max_drawdown_1y        numeric,
  sharpe_proxy           numeric,
  consistency_score      numeric,
  negative_return_days_90d int,
  calculated_at          timestamptz not null default now(),
  primary key (scheme_code, as_of_date)
);

create table if not exists fact_fund_health_score (
  scheme_code         text not null,
  as_of_date          date not null,
  performance_score   numeric,
  risk_score          numeric,
  consistency_score   numeric,
  category_rank_score numeric,
  data_quality_score  numeric,
  cost_score          numeric,           -- null when expense ratio unavailable
  overall_health_score numeric,
  grade               text,              -- A..E
  confidence          text,              -- high | medium | low
  explanation         text,
  calculated_at       timestamptz not null default now(),
  primary key (scheme_code, as_of_date)
);

create index if not exists ix_health_asof on fact_fund_health_score (as_of_date, overall_health_score desc);
create index if not exists ix_risk_asof on fact_scheme_risk_metrics (as_of_date);

-- Public read; pipeline writes with the service role (no anon writes).
alter table dim_scheme_metadata           enable row level security;
alter table fact_scheme_portfolio         enable row level security;
alter table fact_scheme_sector_allocation enable row level security;
alter table fact_scheme_benchmark_returns enable row level security;
alter table fact_scheme_risk_metrics      enable row level security;
alter table fact_fund_health_score        enable row level security;
do $$ begin
  create policy p_read on dim_scheme_metadata           for select using (true);
  create policy p_read on fact_scheme_portfolio         for select using (true);
  create policy p_read on fact_scheme_sector_allocation for select using (true);
  create policy p_read on fact_scheme_benchmark_returns for select using (true);
  create policy p_read on fact_scheme_risk_metrics      for select using (true);
  create policy p_read on fact_fund_health_score        for select using (true);
exception when duplicate_object then null; end $$;
