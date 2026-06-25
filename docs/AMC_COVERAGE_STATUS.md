# MF Pulse — AMC Coverage Status (Phase 1)

Acquisition + parser status per AMC, in target order. "Direct PDF" = fetchable by URL (no
browser); "Consolidated" = single multi-scheme PDF (needs positional parsing); "Per-scheme"
= clean one-scheme PDFs (parse like SBI).

| # | AMC | Factsheet available | Acquisition | Update freq | Parser feasibility | Status |
|---|---|---|---|---|---|---|
| 1 | ICICI Prudential | yes | CDN PDF likely | monthly | consolidated → hard | **pending** |
| 2 | HDFC | yes | ✅ direct CDN (`files.hdfcfund.com`) | monthly | consolidated, data split across pages → hard | acquired, parse pending |
| 3 | Nippon India | yes | CDN PDF likely | monthly | consolidated → hard | pending |
| 4 | **SBI** | yes | ✅ **direct CDN, per-scheme** | monthly | **clean per-scheme** | **DONE — 50 funds / 152 codes** |
| 5 | Kotak | yes | partial direct | monthly | consolidated/per-scheme TBD | pending |
| 6 | Aditya Birla SL | yes | Playwright | monthly | consolidated → hard | pending |
| 7 | Axis | yes | Playwright | monthly | consolidated → hard | pending |
| 8 | DSP | yes | partial direct | monthly | TBD | pending |
| 9 | Mirae Asset | yes | Playwright | monthly | consolidated → hard | pending |
| 10 | UTI | yes | partial direct | monthly | TBD | pending |
| 11 | Franklin Templeton | yes | Playwright | monthly | consolidated → hard | pending |
| 12 | Canara Robeco | yes | Playwright | monthly | consolidated → hard | pending |

## Key learning
**SBI is uniquely easy** — it publishes clean per-scheme PDFs at `sbimf.com/docs/.../scheme-factsheets/sbi-<slug>-factsheet-.pdf`, which the targeted parser extracts reliably. 41 SBI slugs verified (equity + hybrid + debt) → 152 codes.

The other Tier-1 AMCs publish **consolidated** factsheets (HDFC's is fetched and current, 136pp) whose per-scheme data is split across pages / multi-column tables — pypdf cannot attribute it confidently. Reliable parsing needs **positional extraction** (pdfplumber/camelot on the Py3.13 cron worker). This is the gated next step; we will not ship mis-attributed data.

## Acquisition reliability (Phase 2)
`scripts/ingest_factsheets.py` validates `%PDF` on download, records `source_url` + `source_date`, skips non-PDF/404 gracefully, and de-dups across plan variants. Monthly version tracking + checksums run via the GitHub Actions cron (`.github/workflows/factsheets.yml`).
