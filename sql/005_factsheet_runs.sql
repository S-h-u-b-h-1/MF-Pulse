-- 005_factsheet_runs.sql — audit log for factsheet ingestion (lineage + observability).

create table if not exists fact_factsheet_runs (
  run_id            bigserial primary key,
  amc               text not null,
  as_of_date        date,
  status            text not null,            -- ok | pending | failed
  schemes_found     int default 0,
  schemes_populated int default 0,
  problems          jsonb,
  source_url        text,
  started_at        timestamptz not null default now(),
  finished_at       timestamptz
);

create index if not exists ix_factsheet_runs_amc on fact_factsheet_runs (amc, started_at desc);

alter table fact_factsheet_runs enable row level security;
do $$ begin
  create policy p_read on fact_factsheet_runs for select using (true);
exception when duplicate_object then null; end $$;
