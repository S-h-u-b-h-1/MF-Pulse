"""Freshness + health-snapshot logic (pure, no DB)."""

from datetime import date

from ingestion.freshness import build_health, freshness_status, is_stale, staleness_days

T = date(2026, 6, 24)  # fixed "today" for determinism


def test_status_thresholds():
    assert freshness_status(date(2026, 6, 24), T) == "green"  # 0d
    assert freshness_status(date(2026, 6, 22), T) == "green"  # 2d
    assert freshness_status(date(2026, 6, 21), T) == "amber"  # 3d
    assert freshness_status(date(2026, 6, 17), T) == "amber"  # 7d
    assert freshness_status(date(2026, 6, 16), T) == "red"    # 8d
    assert freshness_status(None, T) == "red"


def test_staleness_and_is_stale():
    assert staleness_days(date(2026, 6, 21), T) == 3
    assert is_stale(date(2026, 6, 21), T) is True   # > 2 days
    assert is_stale(date(2026, 6, 23), T) is False  # 1 day
    assert is_stale(None, T) is True


def test_build_health_snapshot():
    h = build_health(date(2026, 6, 21), total_schemes=14219, total_nav_rows=15438, total_events=22, today=T)
    assert h["status"] == "amber"
    assert h["nav_staleness_days"] == 3
    assert h["total_schemes"] == 14219
    assert h["nav_latest_date"] == "2026-06-21"
