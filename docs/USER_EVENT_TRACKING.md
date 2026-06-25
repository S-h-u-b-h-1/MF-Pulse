# MF Pulse — User Event Tracking

First-party, privacy-safe behavioural analytics. No PII unless the user explicitly provides
it (e.g. email on alert signup). Anonymous `session_id` only.

## Client (`app/lib/track.js`)
`track(eventType, payload)` → POST `user_events` (public-insert RLS). Every event is enriched
with `entity_type`, `entity_id`, `page_path`, `referrer`, `device_type` (written inside
`payload` for zero-loss). **Dedup/rate-limit:** identical `event+entity` within 2s is dropped.
Failures never break the page (`keepalive` beacon, try/catch).

## Tracked events
`page_view`, `fund_view`, `amc_view`, `category_view`, `search`, `search_click`,
`fund_filter_used`, `fund_filter_saved`, `time_range_changed` (chart range),
`fund_watchlist_add`, `fund_watchlist_remove`, `export`, `alert_signup`, `manager_view`,
`category_view`. (Remaining spec events — `comparison_created/loaded`,
`data_quality_viewed`, `metadata_panel_viewed`, `health_score_expanded` — are wired the same
way as they ship; the schema + views already accept them.)

## Storage
- `user_events` (live, public-insert) — raw ingest.
- `fact_user_events` (sql/006) — canonical append-only store with structured columns
  (event_id, session_id, user_id, event_type, entity_type, entity_id, page_path, referrer,
  user_agent, device_type, metadata jsonb, created_at). Indexed by type/time, entity, session.

## Analytics views (sql/006)
`v_top_searches`, `v_top_funds_viewed`, `v_top_categories_viewed`, `v_watchlist_trends`,
`v_conversion_funnel`, `v_daily_active_sessions`, `v_user_interest_trends`, plus per-event-type
views (`v_fund_views`, `v_search_events`, …). The existing `/analytics` page reads aggregates.

## Privacy
Anonymous session id (localStorage `mfp_sid`); no names/emails/identifiers in payloads;
device_type is a coarse bucket (mobile/tablet/desktop), not a fingerprint.
