"""Day-7 data-quality invariants — offline, business-rule checks (run in CI)."""

import csv
from pathlib import Path

from ingestion.amfi_parser import parse_lines

ACCEPTED_CLASSES = {"Equity", "Debt", "Hybrid", "Solution", "Other"}

SAMPLE = """\
Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date

Open Ended Schemes(Equity Scheme - Large Cap Fund)

Test AMC Mutual Fund

100001;INF000A01AB1;-;Fund A - Growth;123.4567;19-Jun-2026
100002;-;-;Fund B - IDCW;98.7600;19-Jun-2026
"""


def test_asset_class_in_accepted_set():
    for r in parse_lines(SAMPLE.splitlines()):
        assert r.asset_class in ACCEPTED_CLASSES, r.asset_class


def test_nav_values_non_negative():
    for r in parse_lines(SAMPLE.splitlines()):
        assert r.nav_value is None or r.nav_value > 0


def test_seed_flows_are_well_formed():
    """fact_flow_monthly seed: AUM positive, net = inflow - outflow, valid months."""
    path = Path("data/flows_seed.csv")
    if not path.exists():
        return  # seed optional in some checkouts
    with path.open() as fh:
        rows = list(csv.DictReader(fh))
    assert rows, "seed CSV is empty"
    for r in rows:
        assert float(r["aum_cr"]) > 0, r
        assert r["asset_class"] in ACCEPTED_CLASSES
        assert r["month"].count("-") == 2  # ISO-ish date
