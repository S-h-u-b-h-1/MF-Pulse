"""
Daily market-trend snapshots (Phase 2) — deterministic, computed from the analytical layer
(funds.json) + factsheet metadata. Written to append-only, date-keyed JSONL stores under
data/warehouse/ (one immutable row per day, retained historically) and ready to upsert into
the fact_daily_*_snapshot tables.

    .venv/bin/python -m scripts.build_snapshots [YYYY-MM-DD]
"""

from __future__ import annotations

import json
import os
import sys
from collections import defaultdict
from statistics import mean

WH = "data/warehouse"


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def ret_score(r):
    return clamp(50 + r * 2)


def health(f):
    """Mirror of frontend/app/lib/fundHealth.js (perf/consistency/risk/catrank/dq, renormalised)."""
    parts = []
    r1m, r3m, cp = f.get("r1m"), f.get("r3m"), f.get("catPct")
    if r1m is not None or r3m is not None:
        rp = 0.6 * ret_score(r3m) + 0.4 * ret_score(r1m if r1m is not None else r3m) if r3m is not None else ret_score(r1m)
        parts.append((30, clamp(0.5 * rp + 0.5 * cp if cp is not None else rp)))
    if f.get("consistency") is not None:
        parts.append((20, clamp(f["consistency"])))
    if f.get("vol90") is not None and f.get("maxdd90") is not None:
        parts.append((20, clamp(100 - f["vol90"] * 2 - abs(f["maxdd90"]) * 1.5)))
    if cp is not None:
        parts.append((15, clamp(cp)))
    dq = 100
    q = f.get("quality", {})
    dq -= 45 if q.get("status") == "stale" else 0
    dq -= 0 if q.get("has90d") else 30
    dq -= 0 if q.get("has1y") else 10
    dq -= 0 if q.get("hasCategory") else 15
    parts.append((10, clamp(dq)))
    if not parts:
        return None
    tw = sum(w for w, _ in parts)
    return round(sum((w / tw) * v for w, v in parts))


def upsert_jsonl(path, rows, day):
    os.makedirs(WH, exist_ok=True)
    existing = []
    if os.path.exists(path):
        existing = [json.loads(l) for l in open(path) if l.strip()]
    keep = [r for r in existing if r.get("snapshot_date") != day]   # idempotent per day, history retained
    with open(path, "w") as fh:
        for r in keep + rows:
            fh.write(json.dumps(r) + "\n")
    return len(keep) // max(1, len(rows)) if rows else 0


def main():
    day = sys.argv[1] if len(sys.argv) > 1 else None
    data = json.load(open("frontend/app/data/funds.json"))
    funds = list(data["funds"].values())
    cov = data["coverage"]
    day = day or data["asOf"]
    meta = json.load(open("frontend/app/data/metadata.json"))["metadata"]
    meta_codes = {str(m["scheme_code"]) for m in meta}

    eq = [f for f in funds if f.get("assetClass") == "Equity" and f.get("isGrowth") and not f.get("isIdcw") and f.get("r1m") is not None]

    # ---- market snapshot ----
    by_cat, by_amc = defaultdict(list), defaultdict(list)
    for f in eq:
        by_cat[f["category"]].append(f)
        by_amc[f["amc"]].append(f)
    top_cat = max(by_cat.items(), key=lambda kv: mean(x["r1m"] for x in kv[1]))[0] if by_cat else None
    top_amc = max(((a, fs) for a, fs in by_amc.items() if len(fs) >= 3), key=lambda kv: mean(x["r1m"] for x in kv[1]), default=(None, []))[0]
    top_fund = max(eq, key=lambda f: f["r1m"])["code"] if eq else None
    rets = [f["r1m"] for f in eq]
    vols = [f["vol90"] for f in funds if f.get("vol90") is not None]
    market = [{
        "snapshot_date": day, "total_schemes": cov["total"], "active_schemes": cov["active"],
        "trend_ready_count": cov["with90d"], "risk_ready_count": cov["withRisk"], "research_ready_count": cov["with1y"],
        "top_category_30d": top_cat, "top_amc_30d": top_amc, "top_fund_30d": top_fund,
        "market_breadth": round(100 * sum(1 for r in rets if r > 0) / len(rets), 1) if rets else None,
        "avg_return_30d": round(mean(rets), 2) if rets else None,
        "avg_volatility_90d": round(mean(vols), 2) if vols else None,
    }]

    # ---- category snapshots ----
    cats = []
    for cat, fs in sorted(by_cat.items()):
        rs = [f["r1m"] for f in fs]
        hs = [health(f) for f in fs if health(f) is not None]
        ranked = sorted(fs, key=lambda f: f["r1m"], reverse=True)
        cats.append({
            "snapshot_date": day, "category": cat, "fund_count": len(fs),
            "avg_return_30d": round(mean(rs), 2),
            "avg_return_90d": round(mean([f["r3m"] for f in fs if f.get("r3m") is not None]), 2) if any(f.get("r3m") is not None for f in fs) else None,
            "avg_health_score": round(mean(hs)) if hs else None,
            "positive_fund_pct": round(100 * sum(1 for r in rs if r > 0) / len(rs)),
            "top_fund_code": ranked[0]["code"], "worst_fund_code": ranked[-1]["code"],
        })

    # ---- AMC snapshots ----
    amc_all = defaultdict(list)
    for f in funds:
        if f.get("active"):
            amc_all[f["amc"]].append(f)
    amcs = []
    for amc, fs in sorted(amc_all.items()):
        eqfs = [f for f in fs if f.get("r1m") is not None]
        if len(eqfs) < 1:
            continue
        rs = [f["r1m"] for f in eqfs]
        hs = [health(f) for f in eqfs if health(f) is not None]
        ranked = sorted(eqfs, key=lambda f: f["r1m"], reverse=True)
        covered = sum(1 for f in fs if f["code"] in meta_codes)
        amcs.append({
            "snapshot_date": day, "amc": amc, "active_fund_count": len(fs),
            "avg_return_30d": round(mean(rs), 2), "avg_health_score": round(mean(hs)) if hs else None,
            "top_fund_code": ranked[0]["code"], "worst_fund_code": ranked[-1]["code"],
            "metadata_coverage_pct": round(100 * covered / len(fs), 1),
        })

    upsert_jsonl(f"{WH}/market_snapshots.jsonl", market, day)
    upsert_jsonl(f"{WH}/category_snapshots.jsonl", cats, day)
    upsert_jsonl(f"{WH}/amc_snapshots.jsonl", amcs, day)
    print(f"-- snapshots for {day}: market(1) categories({len(cats)}) amcs({len(amcs)}) | "
          f"top fund {top_fund}, top cat {top_cat}, top amc {top_amc}", file=sys.stderr)


if __name__ == "__main__":
    main()
