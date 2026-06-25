"""Phase 9 — warehouse tests: snapshot health, deterministic intelligence diffs,
append-only no-data-loss, source checksum."""
import hashlib
import json

from scripts.build_snapshots import health, upsert_jsonl
from scripts.daily_intelligence import diff_market, diff_keyed

GOOD_Q = {"status": "ok", "has90d": True, "has1y": True, "hasCategory": True}


def test_health_deterministic_and_bounded():
    strong = {"r1m": 5, "r3m": 15, "catPct": 90, "consistency": 70, "vol90": 12, "maxdd90": -6, "quality": GOOD_Q}
    h1, h2 = health(strong), health(strong)
    assert h1 == h2 and 0 <= h1 <= 100 and h1 >= 70          # deterministic + bounded
    weak = {"r1m": -8, "r3m": -15, "catPct": 5, "consistency": 30, "vol90": 40, "maxdd90": -30, "quality": GOOD_Q}
    assert health(weak) <= 45


def test_diff_market_detects_and_traces_changes():
    prev = {"snapshot_date": "2026-06-22", "top_fund_30d": "A", "top_category_30d": "Mid Cap",
            "top_amc_30d": "X", "market_breadth": 80, "avg_volatility_90d": 12, "research_ready_count": 7000}
    curr = {"snapshot_date": "2026-06-23", "top_fund_30d": "B", "top_category_30d": "Small Cap",
            "top_amc_30d": "Y", "market_breadth": 70, "avg_volatility_90d": 14, "research_ready_count": 7100}
    ins = diff_market(prev, curr)
    types = {i["intelligence_type"] for i in ins}
    assert {"new_top_fund", "category_leader_change", "amc_leader_change"} <= types
    nf = next(i for i in ins if i["intelligence_type"] == "new_top_fund")
    assert nf["previous_value"] == "A" and nf["current_value"] == "B"      # traceable
    assert all(i["source_metric"] for i in ins)                            # every insight cites a metric


def test_diff_market_no_change_no_insight():
    s = {"snapshot_date": "2026-06-23", "top_fund_30d": "A", "top_category_30d": "X", "top_amc_30d": "Y",
         "market_breadth": 80, "avg_volatility_90d": 12, "research_ready_count": 7000}
    assert diff_market(s, dict(s, snapshot_date="2026-06-24")) == []       # no hallucinated insights


def test_diff_keyed_category_leader_change():
    prev = [{"snapshot_date": "d1", "category": "Mid Cap", "top_fund_code": "A"}]
    curr = [{"snapshot_date": "d2", "category": "Mid Cap", "top_fund_code": "B"}]
    ins = diff_keyed(prev, curr, "category", "top_fund_code", "category_leader_change", "category")
    assert len(ins) == 1 and ins[0]["entity_id"] == "Mid Cap" and ins[0]["current_value"] == "B"


def test_append_only_no_data_loss(tmp_path):
    p = str(tmp_path / "m.jsonl")
    upsert_jsonl(p, [{"snapshot_date": "2026-06-22", "x": 1}], "2026-06-22")
    upsert_jsonl(p, [{"snapshot_date": "2026-06-23", "x": 2}], "2026-06-23")
    rows = [json.loads(l) for l in open(p)]
    assert {r["snapshot_date"] for r in rows} == {"2026-06-22", "2026-06-23"}   # prior day retained
    upsert_jsonl(p, [{"snapshot_date": "2026-06-23", "x": 99}], "2026-06-23")   # re-run same day
    rows = [json.loads(l) for l in open(p)]
    assert len(rows) == 2                                                       # idempotent (no dup)
    assert next(r for r in rows if r["snapshot_date"] == "2026-06-23")["x"] == 99
    assert any(r["snapshot_date"] == "2026-06-22" for r in rows)                # NO destructive overwrite


def test_source_checksum_is_stable_64hex():
    b = b"%PDF-1.6 sample factsheet bytes"
    assert hashlib.sha256(b).hexdigest() == hashlib.sha256(b).hexdigest()
    assert len(hashlib.sha256(b).hexdigest()) == 64
