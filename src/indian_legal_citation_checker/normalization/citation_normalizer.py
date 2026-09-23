"""
Citation Normalization Module for Indian Legal Citations.
"""

import re
from typing import Dict, Any, List

def normalize_citation(raw_citation: str) -> Dict[str, Any]:
    warnings: List[str] = []
    if not raw_citation or not isinstance(raw_citation, str):
        return {
            "original": raw_citation or "",
            "normalized": "",
            "canonical_key": "",
            "warnings": ["Empty citation provided"]
        }

    original = raw_citation.strip()
    cleaned = re.sub(r"\s+", " ", original)

    # Brackets around year: [1973] or {1973} -> (1973)
    cleaned = re.sub(r"\[\s*(\d{4})\s*\]", r"(\1)", cleaned)
    cleaned = re.sub(r"\{\s*(\d{4})\s*\}", r"(\1)", cleaned)
    cleaned = re.sub(r"\(\s*([^\)]+?)\s*\)", r"(\1)", cleaned)

    # Reporter abbreviations - handle periods and word boundaries accurately
    cleaned = re.sub(r"\bS\.?\s*C\.?\s*C\.?(?=\s|[0-9]|$)", "SCC", cleaned, flags=re.I)
    cleaned = re.sub(r"\bA\.?\s*I\.?\s*R\.?(?=\s|$)", "AIR", cleaned, flags=re.I)
    cleaned = re.sub(r"\bS\.?\s*C\.?\s*R\.?(?=\s|$)", "SCR", cleaned, flags=re.I)
    cleaned = re.sub(r"\bI\.?\s*L\.?\s*R\.?(?=\s|$)", "ILR", cleaned, flags=re.I)
    cleaned = re.sub(r"\bJ\.?\s*T\.?(?=\s|$)", "JT", cleaned, flags=re.I)
    cleaned = re.sub(r"\bS\.?\s*C\.?\s*A\.?\s*L\.?\s*E\.?(?=\s|$)", "Scale", cleaned, flags=re.I)
    cleaned = re.sub(r"\bSCC\s+Online\b", "SCC OnLine", cleaned, flags=re.I)
    cleaned = re.sub(r"\bI\.?\s*N\.?\s*S\.?\s*C\.?(?=\s|$)", "INSC", cleaned, flags=re.I)

    # Standardize AIR court indicators
    cleaned = re.sub(r"\bAIR\s+(\d{4})\s+S\.?\s*C\.?(?=\s|$|[0-9])", r"AIR \1 SC", cleaned, flags=re.I)
    cleaned = re.sub(r"\bAIR\s+(\d{4})\s+Del(?:hi)?\.?(?=\s|$|[0-9])", r"AIR \1 Del", cleaned, flags=re.I)
    cleaned = re.sub(r"\bAIR\s+(\d{4})\s+Bom(?:bay)?\.?(?=\s|$|[0-9])", r"AIR \1 Bom", cleaned, flags=re.I)

    # Canonical key for database indexing
    canonical_key = re.sub(r"[^a-z0-9]+", "-", cleaned.lower()).strip("-")

    return {
        "original": original,
        "normalized": cleaned,
        "canonical_key": canonical_key,
        "warnings": warnings,
    }

def normalize_case_name(raw_name: str) -> str:
    if not raw_name:
        return ""
    text = re.sub(r"\s+", " ", raw_name)
    text = re.sub(r"\bDr\.?\s*", "", text, flags=re.I)
    text = re.sub(r"\bShri\s*", "", text, flags=re.I)
    text = re.sub(r"\bSmt\.?\s*", "", text, flags=re.I)
    text = re.sub(r"\bHon(?:'|\b)?ble\s*", "", text, flags=re.I)
    text = re.sub(r"\b(?:vs\.?|versus|v\.)\s*", "v. ", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip(" ,;.")
    return text
