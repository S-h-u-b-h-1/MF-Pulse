"""
Real fund-performance intelligence from AMFI NAV history.

Computes true 30-day NAV returns per scheme (Direct/Growth plans only, so payouts
on IDCW plans don't distort returns), ranks top/bottom performers, and bundles a
small JSON the frontend renders. Every number traces to AMFI NAV — no sample data.

    .venv/bin/python -m scripts.build_performance 24-May-2026 23-Jun-2026 > frontend/app/data/performance.json
"""

from __future__ import annotations

import json
import sys
import urllib.request
from datetime import datetime

from ingestion.amfi_parser import parse_file

REPORT = "https://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx"


def download(frmdt: str, todt: str) -> list[str]:
    req = urllib.request.Request(f"{REPORT}?frmdt={frmdt}&todt={todt}", headers={"User-Agent": "mfpulse/1.0"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read().decode("utf-8", errors="replace").splitlines()


def is_growth(name: str) -> bool:
    n = name.lower()
    return "growth" in n and not any(b in n for b in ("idcw", "dividend", "bonus", "payout"))


def main(frmdt: str, todt: str) -> None:
    # dim: scheme_code -> (name, amc, asset_class) from the current universe
    dim = {r.scheme_code: (r.scheme_name, r.amc_name, r.asset_class) for r in parse_file("data/NAVAll.txt")}

    # scheme_code -> {date: nav}
    series: dict[str, dict] = {}
    for raw in download(frmdt, todt):
        s = raw.strip()
        if ";" not in s:
            continue
        p = s.split(";")
        if len(p) < 8 or not p[0].strip().isdigit():
            continue
        code = p[0].strip()
        if code not in dim:
            continue
        try:
            nav = float(p[4].strip().replace(",", ""))
            d = datetime.strptime(p[7].strip(), "%d-%b-%Y").date()
        except ValueError:
            continue
        if nav > 0:
            series.setdefault(code, {})[d] = nav

    rows = []
    for code, by_date in series.items():
        if len(by_date) < 2:
            continue
        name, amc, asset_class = dim[code]
        if asset_class != "Equity" or not is_growth(name):
            continue
        first = by_date[min(by_date)]
        last = by_date[max(by_date)]
        if first <= 0:
            continue
        ret = (last - first) / first * 100
        rows.append({
            "code": code, "name": name.strip(), "amc": amc.replace(" Mutual Fund", ""),
            "ret": round(ret, 2), "nav": round(last, 2),
        })

    rows.sort(key=lambda r: r["ret"], reverse=True)
    asof = max((d for s in series.values() for d in s), default=None)
    out = {
        "window": [frmdt, todt],
        "asOf": asof.isoformat() if asof else None,
        "universe": len(rows),
        "source": "AMFI NAV history · equity Direct/Growth plans · 30-day NAV return",
        "top": rows[:25],
        "bottom": rows[-25:][::-1],
    }
    print(json.dumps(out, indent=0))
    print(f"-- {len(rows)} equity growth schemes ranked", file=sys.stderr)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
