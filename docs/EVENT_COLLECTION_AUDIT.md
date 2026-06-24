# MF Pulse — Event Collection Audit

All events flow to `user_events` (Supabase, RLS public INSERT, aggregate/PII-free) via
`app/lib/track.js`, queryable for analytics. NAV is daily; user activity is the only
real-time signal and is captured live.

## Coverage
| Event | Where | Status |
|---|---|---|
| `page_view` | all pages | ✅ live |
| `search` / `search_click` | global Search | ✅ live (click → `/fund/[code]`) |
| `fund_view` | `/fund/[code]` | ✅ live |
| `fund_search` | (folded into screener) | ✅ via `fund_filter_used` |
| `fund_filter_used` | `/funds` screener | ✅ live (q, plan, opt, sort, fresh, results) |
| `fund_filter_saved` | screener "Save view" | ✅ live |
| `time_range_changed` | NAV chart range switch | ✅ live |
| `category_view` | `/categories`, `/categories/[category]` | ✅ live |
| `amc_view` | `/amc/[amc]` | ✅ live |
| `watchlist_add` / `watchlist_remove` | watchlist | ✅ live |
| `export` | CSV exports (performance, categories) | ✅ live |
| `alert_signup` | alerts | ✅ live |

## Gaps / recommended next
| Event | Note |
|---|---|
| `fund_sort_used` | currently captured inside `fund_filter_used.sort`; split out if sort-specific analytics needed |
| `peer_compare_used` | add when fund-vs-fund compare ships |
| `health_score_expanded` | add if the health card becomes collapsible |
| `data_quality_viewed` | add a viewport/intersection trigger on the data-quality panel |
| `amc_funds_view` | add when `/amc/[amc]/funds` ships |

## Analytics readiness
- Events are append-only, timestamped, and queryable (`/analytics` reads aggregates).
- Recommended view extension: `v_event_daily` (event_type × day counts) and
  `v_fund_engagement` (fund_view counts per scheme_code) to power "most-researched funds".
- No PII stored; payloads carry codes/categories/filter state only.
