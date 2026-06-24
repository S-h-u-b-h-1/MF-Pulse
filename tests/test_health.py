"""Phase 12 — Fund Health Score model guard.

Mirrors the exact model in frontend/app/lib/fundHealth.js (single source of truth at
runtime). Validates grade thresholds, weight renormalisation when components are missing,
the no-fake-cost rule, and clamping.
"""

def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def ret_score(r):
    return clamp(50 + r * 2)


def grade_of(s):
    return "A" if s >= 85 else "B" if s >= 70 else "C" if s >= 55 else "D" if s >= 40 else "E"


def health(f):
    parts = []
    if f.get("r1m") is not None or f.get("r3m") is not None:
        r1m, r3m = f.get("r1m"), f.get("r3m")
        if r3m is not None:
            r_part = 0.6 * ret_score(r3m) + 0.4 * ret_score(r1m if r1m is not None else r3m)
        else:
            r_part = ret_score(r1m)
        perf = 0.5 * r_part + 0.5 * f["catPct"] if f.get("catPct") is not None else r_part
        parts.append(("performance", 30, clamp(perf)))
    if f.get("consistency") is not None:
        parts.append(("consistency", 20, clamp(f["consistency"])))
    if f.get("vol90") is not None and f.get("maxdd90") is not None:
        parts.append(("risk", 20, clamp(100 - f["vol90"] * 2 - abs(f["maxdd90"]) * 1.5)))
    if f.get("catPct") is not None:
        parts.append(("categoryRank", 15, clamp(f["catPct"])))
    dq = 100
    q = f.get("quality", {})
    if q.get("status") == "stale":
        dq -= 45
    if not q.get("has90d"):
        dq -= 30
    if not q.get("has1y"):
        dq -= 10
    if not q.get("hasCategory"):
        dq -= 15
    parts.append(("dataQuality", 10, clamp(dq)))
    if f.get("expenseRatio") is not None:
        parts.append(("cost", 5, clamp(100 - f["expenseRatio"] * 25)))
    if not parts:
        return None
    total_w = sum(w for _, w, _ in parts)
    overall = round(sum((w / total_w) * v for _, w, v in parts))
    return {"overall": overall, "grade": grade_of(overall),
            "components": [k for k, _, _ in parts], "totalW": total_w}


GOOD_Q = {"status": "ok", "has90d": True, "has1y": True, "hasCategory": True, "obs": 60}


def test_grade_thresholds():
    assert grade_of(90) == "A" and grade_of(84) == "B" and grade_of(60) == "C"
    assert grade_of(45) == "D" and grade_of(30) == "E"


def test_strong_fund_scores_high():
    f = {"r1m": 6, "r3m": 18, "catPct": 95, "consistency": 70, "vol90": 12, "maxdd90": -6, "quality": GOOD_Q}
    h = health(f)
    assert h["overall"] >= 70 and h["grade"] in ("A", "B")


def test_weak_risky_fund_scores_low():
    f = {"r1m": -5, "r3m": -12, "catPct": 8, "consistency": 35, "vol90": 40, "maxdd90": -30, "quality": GOOD_Q}
    h = health(f)
    assert h["overall"] <= 45 and h["grade"] in ("D", "E")


def test_cost_omitted_when_unavailable():
    f = {"r1m": 4, "r3m": 10, "catPct": 60, "consistency": 60, "vol90": 15, "maxdd90": -8, "quality": GOOD_Q}
    h = health(f)
    assert "cost" not in h["components"]          # never faked
    assert h["totalW"] == 95                       # weights renormalise over available 95%


def test_cost_included_when_available():
    f = {"r1m": 4, "r3m": 10, "catPct": 60, "consistency": 60, "vol90": 15, "maxdd90": -8,
         "expenseRatio": 1.0, "quality": GOOD_Q}
    h = health(f)
    assert "cost" in h["components"] and h["totalW"] == 100


def test_insufficient_history_still_scores_with_dq_penalty():
    f = {"r1m": 3, "quality": {"status": "limited", "has90d": False, "has1y": False, "hasCategory": True}}
    h = health(f)
    assert h is not None and "risk" not in h["components"]  # no risk without 90d series


def test_clamp_bounds():
    assert clamp(150) == 100 and clamp(-20) == 0 and ret_score(0) == 50
