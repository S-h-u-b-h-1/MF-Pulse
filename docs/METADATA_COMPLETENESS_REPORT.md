# Metadata Completeness Report (Phase 2)

_Real factsheet metadata only (152 scheme rows / 50 funds). Missing = not yet ingested, never fabricated._

| Field | Present (of rows) | % |
|---|---|---|
| benchmark | 134 | 88.2% |
| fund_manager | 12 | 7.9% |
| expense_ratio | 0 | 0.0% |
| aum_crores | 152 | 100.0% |
| riskometer | 152 | 100.0% |
| exit_load | 0 | 0.0% |
| launch_date | 152 | 100.0% |
| holdings | 26 | 17.1% |
| sector_allocation | 152 | 100.0% |
| source_date | 140 | 92.1% |

- Expense ratio 0% — not exposed in the SBI per-scheme layout → cost score stays inactive (not estimated).
- Manager stored only when the multi-manager list is unambiguous (foreign co-manager mis-attribution avoided).
- Every row carries `source_url`, `source_date`, and a SHA-256 checksum (`fact_source_files`).