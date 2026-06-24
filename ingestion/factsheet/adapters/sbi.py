"""SBI Mutual Fund factsheet adapter (scaffold).

Source: SBI MF monthly factsheet ("Fundsheet"), one consolidated PDF covering all schemes.
Structure: per-scheme blocks with a metadata header (benchmark, fund manager, inception,
expense ratio, AUM, riskometer, exit load, min investment) followed by a holdings table and
a sector-allocation table. Parser maps each block to a SchemeMetadata; scheme_code resolved
by name-match against dim_scheme.
"""

from __future__ import annotations

from ..base import FactsheetAdapter
from ..normalize import SchemeMetadata


class SBIAdapter(FactsheetAdapter):
    amc_name = "SBI Mutual Fund"
    implemented = False  # PDF parser pending; framework + lineage are ready
    factsheet_page = "https://www.sbimf.com/en-us/all-forms-and-downloads"

    def factsheet_url(self, as_of=None) -> str:
        # Real adapter resolves the latest month's factsheet PDF link from the page.
        return self.factsheet_page

    def parse(self, pdf_bytes: bytes) -> list[SchemeMetadata]:
        raise NotImplementedError("SBI factsheet PDF parser not yet implemented")
