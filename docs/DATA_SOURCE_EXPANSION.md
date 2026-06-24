# MF Pulse — Data Source Expansion Audit

Evaluating legitimate sources to deepen fund-level research. Each rated on availability,
format, update frequency, reliability, parsing difficulty, legal/ethical concerns, and
implementation priority. **Unreliable sources are integrated only when clearly labelled
experimental.**

| Source | Data | Format | Freq | Reliability | Parse difficulty | Legal/ethical | Priority |
|---|---|---|---|---|---|---|---|
| **AMFI NAVAll.txt** | latest NAV, identity, category | semicolon TXT | daily | very high | trivial | public, ToS-clean | **live (primary)** |
| **AMFI NAV History** | historical NAV (≤90d window) | semicolon TXT | daily | very high | low | public | **live (primary)** |
| **MFAPI.in** | per-scheme NAV history, metadata | JSON REST | daily | medium-high (community) | trivial | free, be polite | **live (secondary/fallback)** — chart only, cached, on-demand |
| AMC factsheets | AUM, expense ratio, benchmark, manager, holdings, sector, turnover | PDF (per AMC, varied) | monthly | high (authoritative) | **high** (per-AMC PDF layouts) | public disclosures | **P1 — highest research value** |
| AMFI risk parameters | std dev, Sharpe, beta, alpha, tracking error | webpage/PDF | monthly | high | medium-high | public | P2 |
| SEBI/AMFI monthly | industry flows, AUM, category | PDF | monthly | high | high | public | P3 (flows still sample until parsed) |

## Findings
- **NAV pipeline is solved** — AMFI primary + MFAPI fallback already power daily NAV,
  multi-window returns, and a 90-day daily series for risk metrics.
- **The single highest-value gap is factsheet metadata** (AUM, expense ratio, benchmark,
  manager, holdings). It is authoritative but PDF-only with **per-AMC layout variance** —
  there is no clean API. Realistic path: a per-AMC factsheet parser (≈44 AMC templates),
  built incrementally, written to `dim_scheme_metadata` / `fact_scheme_portfolio` with
  `source` + `source_date` lineage. Until then the fund page shows **"Not yet available
  from source"** — never a fabricated value.
- **Risk ratios (Sharpe/beta/alpha)** need a benchmark return series; we compute a
  volatility/drawdown/downside risk profile from NAV today (real), and label Sharpe/beta as
  pending benchmark ingestion rather than approximating them.

## Recommended sequence
1. Activate daily cron (history accrual) — unblocks day-over-day + persistence.
2. Factsheet parser for the top ~10 AMCs by AUM (covers the majority of assets) → AUM,
   expense, benchmark, manager. Expand AMC-by-AMC.
3. Benchmark return series (index NAV) → enables benchmark comparison + Sharpe/beta/alpha.
4. AMFI risk-parameter pages as a cross-check (experimental, labelled).

## Guardrails
- No source is presented as authoritative beyond its real freshness.
- Anything community-sourced (MFAPI) is labelled and used as fallback only.
- No scraping that violates a site's terms; AMFI/SEBI/AMC disclosures are public.
