"""HDFC Mutual Fund factsheet adapter (scaffold).

Source: HDFC MF monthly factsheet PDF. Structure: scheme fact pages with a standard
"Fund Snapshot" box (inception, benchmark, fund manager(s), AUM, expense ratio (Regular &
Direct), exit load, riskometer) plus "Portfolio" (top holdings + % ) and "Industry
Allocation" tables. One of the cleaner/most consistent layouts.
"""

from __future__ import annotations

from ..base import FactsheetAdapter
from ..normalize import SchemeMetadata


class HDFCAdapter(FactsheetAdapter):
    amc_name = "HDFC Mutual Fund"
    implemented = False
    factsheet_page = "https://www.hdfcfund.com/information/downloads"

    def factsheet_url(self, as_of=None) -> str:
        return self.factsheet_page

    def parse(self, pdf_bytes: bytes) -> list[SchemeMetadata]:
        raise NotImplementedError("HDFC factsheet PDF parser not yet implemented")
