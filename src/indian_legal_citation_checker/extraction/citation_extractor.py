"""
Deterministic Citation Extraction Engine for Indian Legal Citations.
"""

import re
from typing import List, Optional, Dict, Any
from ..normalization.citation_normalizer import normalize_citation, normalize_case_name

PATTERNS = [
    # 1. SCC Print
    {
        "format": "scc",
        "name": "Supreme Court Cases (Print)",
        "regex": re.compile(r"(?:\((\d{4})\)\s*(\d{1,2})?\s*SCC\s*(\d+)|(\d{4})\s*\(([0-9]+)\)\s*SCC\s*(\d+))", re.I),
        "extractor": lambda m: {
            "year": int(m.group(1)) if m.group(1) else int(m.group(4)),
            "volume": m.group(2) if m.group(1) else m.group(5),
            "page": m.group(3) if m.group(1) else m.group(6),
            "reporter": "SCC",
            "court_indicator": "Supreme Court",
        }
    },
    # 2. SCC OnLine
    {
        "format": "scc_online",
        "name": "SCC OnLine",
        "regex": re.compile(r"\b(\d{4})\s+SCC\s+OnLine\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+)\b", re.I),
        "extractor": lambda m: {
            "year": int(m.group(1)),
            "reporter": "SCC OnLine",
            "court_indicator": m.group(2),
            "page": m.group(3),
            "case_number": m.group(3),
        }
    },
    # 3. AIR
    {
        "format": "air",
        "name": "All India Reporter",
        "regex": re.compile(r"\bAIR\s+(\d{4})\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+)\b", re.I),
        "extractor": lambda m: {
            "year": int(m.group(1)),
            "reporter": "AIR",
            "court_indicator": m.group(2),
            "page": m.group(3),
        }
    },
    # 4. Neutral Citation (INSC)
    {
        "format": "neutral_insc",
        "name": "Supreme Court Neutral Citation",
        "regex": re.compile(r"\b(\d{4})\s+INSC\s+(\d+)\b", re.I),
        "extractor": lambda m: {
            "year": int(m.group(1)),
            "reporter": "INSC",
            "court_indicator": "Supreme Court of India",
            "case_number": m.group(2),
            "page": m.group(2),
        }
    },
    # 5. Neutral Citation (High Courts)
    {
        "format": "neutral_high_court",
        "name": "High Court Neutral Citation",
        "regex": re.compile(r"\b(\d{4})\s*:\s*([A-Z\-]+)\s*:\s*(\d+)\b", re.I),
        "extractor": lambda m: {
            "year": int(m.group(1)),
            "reporter": m.group(2),
            "court_indicator": m.group(2),
            "case_number": m.group(3),
            "page": m.group(3),
        }
    },
    # 6. SCR
    {
        "format": "scr",
        "name": "Supreme Court Reports",
        "regex": re.compile(r"(?:\[(\d{4})\]|\((\d{4})\))\s*(\d{1,2})?\s*SCR\s*(\d+)", re.I),
        "extractor": lambda m: {
            "year": int(m.group(1) or m.group(2)),
            "volume": m.group(3),
            "reporter": "SCR",
            "page": m.group(4),
            "court_indicator": "Supreme Court",
        }
    },
    # 7. Scale / JT
    {
        "format": "scale",
        "name": "Judgments Today / Scale",
        "regex": re.compile(r"\((\d{4})\)\s*(\d{1,2})?\s*(Scale|JT)\s*(\d+)", re.I),
        "extractor": lambda m: {
            "year": int(m.group(1)),
            "volume": m.group(2),
            "reporter": m.group(3),
            "page": m.group(4),
        }
    },
]

def find_associated_case_name(text_before: str) -> Optional[str]:
    window = text_before[-200:]
    pattern = re.compile(r"(?:([A-Z][A-Za-z0-9\s.,'&-]+?)\s+(?:v\.|vs\.?|versus)\s+([A-Z][A-Za-z0-9\s.,'&-]+?))(?:\s*,\s*|\s*\()?\s*$", re.I)
    match = pattern.search(window)
    if match:
        name = match.group(0).strip("(),; ")
        # Strip introductory words like "In", "As held in", "See"
        name = re.sub(r"^(?:in the matter of|in re|as held in|held in|reported in|see|decided in|judgment of|matter of|in)\s+", "", name, flags=re.I)
        cleaned = normalize_case_name(name)
        if 3 <= len(cleaned) <= 120:
            return cleaned
    return None

def extract_citations(text: str) -> List[Dict[str, Any]]:
    if not text or not isinstance(text, str):
        return []

    citations = []
    covered_ranges = []

    def is_overlapping(start, end):
        return any((start >= s and start < e) or (end > s and end <= e) for s, e in covered_ranges)

    for p in PATTERNS:
        for m in p["regex"].finditer(text):
            start = m.start()
            end = m.end()
            if is_overlapping(start, end):
                continue

            raw_str = m.group(0)
            parsed = p["extractor"](m)
            norm = normalize_citation(raw_str)
            case_name = find_associated_case_name(text[:start])

            citations.append({
                "id": f"cit-{start}-{end}",
                "originalText": raw_str,
                "normalizedText": norm["normalized"],
                "canonicalKey": norm["canonical_key"],
                "format": p["format"],
                "startOffset": start,
                "endOffset": end,
                "year": parsed.get("year"),
                "volume": parsed.get("volume"),
                "reporter": parsed.get("reporter"),
                "page": parsed.get("page"),
                "courtIndicator": parsed.get("court_indicator"),
                "caseNumber": parsed.get("case_number"),
                "associatedCaseName": case_name,
                "warnings": norm["warnings"],
            })
            covered_ranges.append((start, end))

    citations.sort(key=lambda x: x["startOffset"])
    return citations
