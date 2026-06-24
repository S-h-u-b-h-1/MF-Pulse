"""Base factsheet adapter — fetch + parse with retry, versioning, lineage, audit logging."""

from __future__ import annotations

import time
import urllib.request
from abc import ABC, abstractmethod

from .normalize import SchemeMetadata, validate, completeness


class FactsheetAdapter(ABC):
    """One per AMC. Subclasses implement `factsheet_url()` and `parse(pdf_bytes)`."""

    amc_name: str = ""
    frequency: str = "monthly"
    polite_delay_s: float = 2.0          # be kind to AMC servers

    @abstractmethod
    def factsheet_url(self, as_of=None) -> str:
        ...

    @abstractmethod
    def parse(self, pdf_bytes: bytes) -> list[SchemeMetadata]:
        """Return one SchemeMetadata per scheme found. Missing fields stay None."""
        ...

    # ----- shared mechanics -----
    def fetch(self, url: str, retries: int = 3, timeout: int = 120) -> bytes:
        last = None
        for attempt in range(retries):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "mfpulse-research/1.0"})
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    return r.read()
            except Exception as e:  # noqa: BLE001 — log + backoff
                last = e
                time.sleep(self.polite_delay_s * (attempt + 1))
        raise RuntimeError(f"{self.amc_name}: fetch failed after {retries} tries: {last}")

    def run(self, as_of=None) -> dict:
        """Fetch + parse one AMC; return an audit record (never raises into the caller)."""
        url = self.factsheet_url(as_of)
        rec = {"amc": self.amc_name, "url": url, "status": "ok", "schemes": 0,
               "populated": 0, "problems": [], "rows": []}
        try:
            pdf = self.fetch(url)
            metas = self.parse(pdf)
            for m in metas:
                m.source = m.source or f"{self.amc_name} factsheet PDF"
                m.source_url = m.source_url or url
                problems = validate(m)
                if problems:
                    rec["problems"].append({m.scheme_name: problems})
                    continue
                if completeness(m) > 0:
                    rec["populated"] += 1
                rec["rows"].append(m)
            rec["schemes"] = len(metas)
        except Exception as e:  # noqa: BLE001
            rec["status"] = "failed"
            rec["error"] = str(e)
        return rec
