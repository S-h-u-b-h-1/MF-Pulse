# MF Pulse — Metadata Coverage Report (Phase 10)

_As of 2026-06-23. Honest accounting — coverage reflects only data we actually hold from a
real source. Nothing is counted as "covered" by estimation or fabrication._

## Coverage by field (active/equity schemes)
| Field | Source | Coverage | Status |
|---|---|---|---|
| **Benchmark (category-standard)** | SEBI category framework | **100%** of equity (2,546) | ✅ live |
| Performance / returns (1W–5Y) | AMFI NAV | ~95% of active | ✅ live |
| Risk metrics (vol, drawdown, etc.) | AMFI 90d series | 8,567 schemes | ✅ live |
| Category / AMC mapping | AMFI | 100% | ✅ live |
| Expense ratio | AMC factsheet PDF | **0%** | ⏳ framework ready, parser pending |
| AUM | AMC factsheet PDF / AMFI AAUM | **0%** | ⏳ pending |
| Fund manager | AMC factsheet PDF | **0%** | ⏳ pending |
| Top holdings | AMC factsheet PDF | **0%** | ⏳ pending |
| Sector allocation | AMC factsheet PDF | **0%** | ⏳ pending |
| Riskometer / exit load / min SIP | AMC factsheet PDF | **0%** | ⏳ pending |

## AMC adapter coverage
- Adapters registered: 3 (SBI, HDFC, ICICI) of 16 audited.
- Adapters implemented (PDF parser): **0** — framework, schema, registry, audit log are
  built and runnable (`python -m ingestion.factsheet.run`); per-AMC PDF parsers are the
  remaining work.

## Why factsheet fields are still 0%
The 80% metadata target requires parsing monthly AMC factsheet **PDFs** — there is no free
machine-readable source for expense ratio, AUM, manager, holdings, or sector allocation
(verified in `DATA_SOURCE_EXPANSION.md`). Rather than scrape an unreliable third party or
estimate values, MF Pulse ships the **ingestion framework** and labels these fields
"Not yet available from source." This preserves trust — the platform's core asset.

## What shipped this phase (real)
- **Benchmark intelligence:** every equity fund now shows its SEBI category-standard
  benchmark and a **real fund-vs-peer-cohort outperformance table** (1W–5Y, 3Y/5Y annualised).
- **Ingestion framework:** adapter base (retry/versioning/lineage), normalized schema with
  validation + no-fabrication guarantees, registry, orchestrator with per-AMC audit, and
  `fact_factsheet_runs` + `dim_scheme_metadata`/`fact_scheme_portfolio`/`fact_scheme_sector_allocation`.

## Path to 80% metadata coverage
1. Implement P1 adapters (HDFC, ICICI, SBI, Nippon) → covers the majority of industry AUM.
2. Expand to P2/P3 AMCs (16 audited) adapter-by-adapter.
3. On each parsed field landing, the fund page replaces "Not yet available" automatically,
   and the Health Score **cost component activates** (already wired in `lib/fundHealth.js`).
Estimated: P1 alone lifts expense/AUM/manager/holdings coverage past ~50% of active-equity AUM.
