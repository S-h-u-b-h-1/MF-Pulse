"""
Daily "what changed" intelligence (Phase 3) — deterministic diffs of consecutive market /
category / AMC snapshots. No LLM, no fabrication: every insight cites a source metric with
previous + current value. Appended to data/warehouse/intelligence.jsonl (append-only).

    .venv/bin/python -m scripts.daily_intelligence
"""

from __future__ import annotations

import json
import os
import sys

WH = "data/warehouse"


def _load(path):
    if not os.path.exists(path):
        return []
    return [json.loads(l) for l in open(path) if l.strip()]


def _by_date(rows):
    d = {}
    for r in rows:
        d.setdefault(r["snapshot_date"], []).append(r)
    return d


def diff_market(prev, curr):
    """prev/curr are single market-snapshot dicts. Returns list of insight dicts."""
    out = []
    day = curr["snapshot_date"]

    def ins(itype, title, summary, sev, metric, pv, cv, etype=None, eid=None):
        out.append({"intelligence_date": day, "intelligence_type": itype, "entity_type": etype,
                    "entity_id": eid, "title": title, "summary": summary, "severity": sev,
                    "source_metric": metric, "previous_value": str(pv), "current_value": str(cv)})

    if curr.get("top_fund_30d") and curr["top_fund_30d"] != prev.get("top_fund_30d"):
        ins("new_top_fund", "New top-performing fund", f"Top 30-day fund is now {curr['top_fund_30d']}.",
            "positive", "top_fund_30d", prev.get("top_fund_30d"), curr["top_fund_30d"], "fund", curr["top_fund_30d"])
    if curr.get("top_category_30d") and curr["top_category_30d"] != prev.get("top_category_30d"):
        ins("category_leader_change", "Category leadership changed",
            f"{curr['top_category_30d']} overtook {prev.get('top_category_30d')} as the top 30-day category.",
            "info", "top_category_30d", prev.get("top_category_30d"), curr["top_category_30d"], "category", curr["top_category_30d"])
    if curr.get("top_amc_30d") and curr["top_amc_30d"] != prev.get("top_amc_30d"):
        ins("amc_leader_change", "AMC leadership changed",
            f"{curr['top_amc_30d']} is now the top 30-day AMC (was {prev.get('top_amc_30d')}).",
            "info", "top_amc_30d", prev.get("top_amc_30d"), curr["top_amc_30d"], "amc", curr["top_amc_30d"])
    pb, cb = prev.get("market_breadth"), curr.get("market_breadth")
    if pb is not None and cb is not None and abs(cb - pb) >= 5:
        ins("risk_warning" if cb < pb else "breadth_improved", "Market breadth shifted",
            f"Share of funds with positive 30-day returns moved {pb}% → {cb}%.",
            "caution" if cb < pb else "positive", "market_breadth", pb, cb)
    pv, cv = prev.get("avg_volatility_90d"), curr.get("avg_volatility_90d")
    if pv is not None and cv is not None and cv - pv >= 1.5:
        ins("risk_warning", "Average volatility rising", f"Mean 90-day volatility moved {pv}% → {cv}%.",
            "warning", "avg_volatility_90d", pv, cv)
    rr, rr0 = curr.get("research_ready_count"), prev.get("research_ready_count")
    if rr is not None and rr0 is not None and rr > rr0:
        ins("metadata_improved", "More funds became research-ready",
            f"Research-ready (1Y history) funds rose {rr0} → {rr}.", "positive", "research_ready_count", rr0, rr)
    return out


def diff_keyed(prev_rows, curr_rows, key, leader_field, itype, label):
    """Per-category / per-AMC leader changes."""
    p = {r[key]: r for r in prev_rows}
    out = []
    for r in curr_rows:
        pr = p.get(r[key])
        if pr and r.get(leader_field) and r[leader_field] != pr.get(leader_field):
            out.append({"intelligence_date": r["snapshot_date"], "intelligence_type": itype,
                        "entity_type": label, "entity_id": r[key],
                        "title": f"{label.title()} leader changed: {r[key]}",
                        "summary": f"Top fund in {r[key]} is now {r[leader_field]} (was {pr.get(leader_field)}).",
                        "severity": "info", "source_metric": leader_field,
                        "previous_value": str(pr.get(leader_field)), "current_value": str(r[leader_field])})
    return out


def main():
    mkt = sorted(_load(f"{WH}/market_snapshots.jsonl"), key=lambda r: r["snapshot_date"])
    if len(mkt) < 2:
        print("-- need >=2 market snapshots to diff; none emitted (accrues over days)", file=sys.stderr)
        return
    prev, curr = mkt[-2], mkt[-1]
    insights = diff_market(prev, curr)

    cat = _by_date(_load(f"{WH}/category_snapshots.jsonl"))
    amc = _by_date(_load(f"{WH}/amc_snapshots.jsonl"))
    days = sorted(cat)
    if len(days) >= 2:
        insights += diff_keyed(cat[days[-2]], cat[days[-1]], "category", "top_fund_code", "category_leader_change", "category")
    days = sorted(amc)
    if len(days) >= 2:
        insights += diff_keyed(amc[days[-2]], amc[days[-1]], "amc", "top_fund_code", "amc_leader_change", "amc")

    os.makedirs(WH, exist_ok=True)
    with open(f"{WH}/intelligence.jsonl", "a") as fh:   # append-only
        for i in insights:
            fh.write(json.dumps(i) + "\n")
    print(f"-- {len(insights)} insights for {curr['snapshot_date']} (vs {prev['snapshot_date']})", file=sys.stderr)
    for i in insights[:8]:
        print(f"   [{i['severity']}] {i['title']}: {i['summary']}", file=sys.stderr)


if __name__ == "__main__":
    main()
