# Search & Discovery Validation (Phase 7)

## Paths verified
| Path | Mechanism | Status |
|---|---|---|
| Search → Fund page | `Search.jsx` queries `dim_scheme` (PostgREST), routes to `/fund/[scheme_code]` | ✅ |
| AMC → fund list | `/amc/[amc]` | ✅ |
| Category → fund list | `/categories/[category]` (equity Growth, ranked) | ✅ |
| Screener → fund page | `/funds` server-filtered, links to `/fund/[code]` | ✅ |
| Benchmark → related funds | category-standard benchmark shown on fund page; reverse lookup not yet a route | ⏳ |

## Search quality
- Every **priced** scheme is searchable (name / AMC / category / code) via `dim_scheme`.
- Results route to the canonical scheme-level fund page; routing verified.

## Known gap (ranked)
- **Search returns scheme variants, not canonical funds.** Searching "SBI Small Cap" returns
  Direct/Regular/IDCW rows. The canonical map (`fund_family.json`, 60.6% reduction) exists and
  the *attention/insight* layer already dedups to canonical, but the **search dropdown does not
  yet collapse variants**. This is the top discovery-quality fix.
  - *Recommended fix (low risk, no new page):* group `Search.jsx` results by
    `canonical_fund_id`, show one row per canonical fund with a variant count, route to the
    Direct-Growth variant by default. Deterministic, reversible.
- Benchmark→related-funds is a nice-to-have reverse index, not built.

## Verdict
Discovery is correct and complete at the scheme level (no broken routes, no duplicate scheme
codes). The one quality gap is **canonical de-duplication in the search dropdown** — high user
impact, low effort, no new surface.
