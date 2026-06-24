"""Pure freshness helpers (no DB, no network) — easy to unit-test."""

from __future__ import annotations

from datetime import date
from typing import Optional

GREEN_MAX = 2   # days
AMBER_MAX = 7


def staleness_days(latest: Optional[date], today: Optional[date] = None) -> Optional[int]:
    if latest is None:
        return None
    return ((today or date.today()) - latest).days


def freshness_status(latest: Optional[date], today: Optional[date] = None,
                     green: int = GREEN_MAX, amber: int = AMBER_MAX) -> str:
    s = staleness_days(latest, today)
    if s is None:
        return "red"
    if s <= green:
        return "green"
    if s <= amber:
        return "amber"
    return "red"


def is_stale(latest: Optional[date], today: Optional[date] = None, max_days: int = GREEN_MAX) -> bool:
    s = staleness_days(latest, today)
    return s is None or s > max_days


def build_health(latest: Optional[date], total_schemes=None, total_nav_rows=None,
                 total_events=None, flow_latest_month=None, today: Optional[date] = None) -> dict:
    """Construct a fact_system_health snapshot row (status derived from freshness)."""
    return {
        "nav_latest_date": latest.isoformat() if latest else None,
        "nav_staleness_days": staleness_days(latest, today),
        "total_schemes": total_schemes,
        "total_nav_rows": total_nav_rows,
        "total_events": total_events,
        "flow_latest_month": flow_latest_month,
        "status": freshness_status(latest, today),
    }
