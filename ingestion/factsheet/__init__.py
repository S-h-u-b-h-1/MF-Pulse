"""Factsheet ingestion framework — AMC-specific adapters → normalized fund metadata.

The authoritative source for AUM, expense ratio, benchmark, fund manager, holdings and
sector allocation is each AMC's monthly factsheet PDF. Layouts differ per AMC, so the
framework is adapter-based: a shared base + per-AMC parsers that emit a common normalized
schema with full lineage. Nothing is fabricated — a field absent from a PDF stays None.
"""
