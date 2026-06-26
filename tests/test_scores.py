"""Phase 6 — score validation. Every score is a pure, documented function; here we prove it
stays in-range and reproducible over the REAL committed data. Formulas: SCORE_VALIDATION_REPORT.md."""
import json
import os

import pytest

from scripts.build_snapshots import health, clamp, ret_score
from scripts.explain import attention_score, fund_movements, explain_funds

ROOT = os.path.dirname(os.path.dirname(__file__))
_p = os.path.join(ROOT, "frontend/app/data/funds.json")
FUNDS = json.load(open(_p))["funds"] if os.path.exists(_p) else {}


def test_health_in_range_on_real_data():
    scores = [health(f) for f in FUNDS.values() if f.get("r1m") is not None]
    scores = [s for s in scores if s is not None]
    assert scores and all(0 <= s <= 100 for s in scores)


def test_trend_score_in_range_on_real_data():
    bad = [c for c, f in FUNDS.items() if f.get("trend") is not None and not (0 <= f["trend"] <= 100)]
    assert bad == []


def test_attention_scores_in_range_and_suppressed():
    items = explain_funds(fund_movements(list(FUNDS.values())), limit=20)
    assert all(0 <= i["attentionScore"] <= 100 for i in items)
    assert all(i["value"] in ("High", "Medium") for i in items)     # Low suppressed (Phase 7/8)


def test_health_reproducible_and_clamped():
    f = {"r1m": 5, "r3m": 15, "catPct": 80, "consistency": 60, "vol90": 14, "maxdd90": -8,
         "quality": {"status": "ok", "has90d": True, "has1y": True, "hasCategory": True}}
    assert health(f) == health(f)
    assert clamp(150) == 100 and clamp(-5) == 0 and ret_score(0) == 50


def test_attention_components_documented_bounds():
    # magnitude<=40, novelty<=30, persistence<=15, category-deviation<=15 -> <=100
    m = {"rank_change": 100, "pct3m": 99, "r1m": 50.0, "cat_avg": 0.0}
    assert attention_score(m, 30) == 100
