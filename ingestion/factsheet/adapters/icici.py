"""ICICI Prudential Mutual Fund factsheet adapter (scaffold).

Source: ICICI Pru monthly factsheet PDF. Structure: per-scheme pages with "Fund Details"
(inception, benchmark, fund managers, AUM (month-end & average), TER for Direct/Other,
exit load, min application) plus "Portfolio Holdings" and "Sector Allocation" tables.
"""

from __future__ import annotations

from ..base import FactsheetAdapter
from ..normalize import SchemeMetadata


class ICICIAdapter(FactsheetAdapter):
    amc_name = "ICICI Prudential Mutual Fund"
    implemented = False
    factsheet_page = "https://www.icicipruamc.com/news-and-update/factsheet"

    def factsheet_url(self, as_of=None) -> str:
        return self.factsheet_page

    def parse(self, pdf_bytes: bytes) -> list[SchemeMetadata]:
        raise NotImplementedError("ICICI factsheet PDF parser not yet implemented")
