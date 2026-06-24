# MF Pulse — AMC Factsheet Ecosystem Audit (Phase 1)

The authoritative source for fund metadata (AUM, expense ratio, benchmark, manager,
holdings, sector allocation) is each AMC's **monthly factsheet PDF** (a consolidated "fund
sheet" covering all of the AMC's schemes). There is **no free machine-readable API** for
these fields — hence the adapter-based ingestion framework (`ingestion/factsheet/`).

All factsheets are **monthly** and contain, per scheme: benchmark, fund manager(s),
inception date, AUM (month-end and/or average), TER (Regular & Direct), exit load,
riskometer, minimum investment, **top holdings (% weights)** and **sector/industry
allocation**. The variation is in PDF *layout*, which drives parser difficulty.

| AMC | Factsheet source (landing) | Layout consistency | Holdings | Sector | Parse difficulty | Priority |
|---|---|---|---|---|---|---|
| SBI MF | sbimf.com → downloads | medium | ✅ | ✅ | medium-high | P1 (largest AUM) |
| HDFC MF | hdfcfund.com → downloads | **high** | ✅ | ✅ | medium | P1 |
| ICICI Prudential | icicipruamc.com → factsheet | high | ✅ | ✅ | medium | P1 |
| Nippon India | mf.nipponindiaim.com | medium | ✅ | ✅ | medium-high | P1 |
| Kotak | kotakmf.com | high | ✅ | ✅ | medium | P2 |
| Axis | axismf.com | high | ✅ | ✅ | medium | P2 |
| Mirae Asset | miraeassetmf.co.in | high | ✅ | ✅ | medium | P2 |
| Motilal Oswal | motilaloswalmf.com | high | ✅ | ✅ | low-medium | P2 |
| DSP | dspim.com | medium | ✅ | ✅ | medium | P2 |
| Aditya Birla SL | mutualfund.adityabirlacapital.com | medium | ✅ | ✅ | medium-high | P2 |
| UTI | utimf.com | medium | ✅ | ✅ | medium-high | P3 |
| Franklin Templeton | franklintempletonindia.com | high | ✅ | ✅ | medium | P3 |
| Canara Robeco | canararobeco.com | high | ✅ | ✅ | low-medium | P3 |
| Tata | tatamutualfund.com | medium | ✅ | ✅ | medium | P3 |
| HSBC | assetmanagement.hsbc.co.in | medium | ✅ | ✅ | medium-high | P3 |
| Invesco | invescomutualfund.com | high | ✅ | ✅ | medium | P3 |

**P1 AMCs cover the majority of industry AUM** — implementing SBI, HDFC, ICICI, Nippon
first yields the largest metadata coverage per unit of effort.

## Field availability summary
- **Benchmark, manager, expense ratio, AUM, riskometer, exit load:** present in every
  factsheet's per-scheme snapshot box (structured, ~5-10 fields).
- **Top holdings + sector allocation:** present as tables on each scheme page.
- **Launch date, min SIP/lumpsum:** present, sometimes in a separate "fund facts" block.

## Recommended approach
1. Implement HDFC / ICICI / Motilal / Canara first (most consistent layouts → highest parse
   reliability), then SBI / Nippon (larger AUM, medium layouts).
2. Use a table-extraction library (pdfplumber/camelot) inside each adapter's `parse()`.
3. Resolve `scheme_code` by fuzzy name-match against `dim_scheme`; log unmatched.
4. Write to `dim_scheme_metadata` / `fact_scheme_portfolio` / `fact_scheme_sector_allocation`
   with `source`, `source_url`, `source_date`; audit each run in `fact_factsheet_runs`.

## Honest status
- Framework, normalized schema, registry, audit log: **built and runnable** today
  (`python -m ingestion.factsheet.run`).
- PDF parsers: **pending** (0/16 implemented). Until a parser lands, fund pages show
  "Not yet available from source" — never a fabricated value.
