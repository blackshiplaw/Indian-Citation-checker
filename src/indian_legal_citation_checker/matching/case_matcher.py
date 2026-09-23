"""
Case Matching and Verification Engine in Python.
"""

from typing import Dict, Any, List, Optional
from ..retrieval.dataset_adapter import PythonDatasetAdapter, dataset_adapter

class CaseMatcher:
    def __init__(self, adapter: Optional[PythonDatasetAdapter] = None):
        self.adapter = adapter or dataset_adapter

    def match(self, extracted: Dict[str, Any]) -> Dict[str, Any]:
        key = extracted.get("canonicalKey")
        exact_matches = self.adapter.canonical_index.get(key, [])

        if exact_matches:
            primary = exact_matches[0]
            matched_fields = ["citation"]
            differed_fields = []
            if extracted.get("year"):
                if primary["year"] == extracted["year"]:
                    matched_fields.append("year")
                else:
                    differed_fields.append("year")

            return {
                "primary": primary,
                "score": 1.0,
                "match_method": "exact_citation",
                "matched_fields": matched_fields,
                "differed_fields": differed_fields,
                "is_ambiguous": len(exact_matches) > 1
            }

        # Fuzzy case name matching
        case_name = extracted.get("associatedCaseName")
        if case_name:
            fuzzy = self.adapter.search_by_case_name_fuzzy(case_name)
            if fuzzy:
                top = fuzzy[0]
                return {
                    "primary": top["record"],
                    "score": top["score"],
                    "match_method": "fuzzy_case_name",
                    "matched_fields": ["caseName"],
                    "differed_fields": ["citation"],
                    "is_ambiguous": False
                }

        return {
            "primary": None,
            "score": 0.0,
            "match_method": None,
            "matched_fields": [],
            "differed_fields": [],
            "is_ambiguous": False
        }

class CitationVerifier:
    def __init__(self, adapter: Optional[PythonDatasetAdapter] = None):
        self.matcher = CaseMatcher(adapter)

    def verify(self, extracted: Dict[str, Any]) -> Dict[str, Any]:
        if extracted.get("format") == "unsupported":
            return {
                "citationSupplied": extracted.get("originalText"),
                "normalizedCitation": extracted.get("normalizedText"),
                "extractedDetails": extracted,
                "status": "UNSUPPORTED FORMAT",
                "explanation": "Format not supported by standard Indian citation registry.",
                "matchedFields": [],
                "differedFields": [],
                "missingFields": ["standard_format"]
            }

        matched = self.matcher.match(extracted)

        if matched["is_ambiguous"]:
            return {
                "citationSupplied": extracted.get("originalText"),
                "normalizedCitation": extracted.get("normalizedText"),
                "extractedDetails": extracted,
                "status": "AMBIGUOUS MATCH",
                "explanation": "Multiple candidate judgments match this citation in the corpus.",
                "matchedFields": matched["matched_fields"],
                "differedFields": matched["differed_fields"],
                "missingFields": []
            }

        if not matched["primary"]:
            return {
                "citationSupplied": extracted.get("originalText"),
                "normalizedCitation": extracted.get("normalizedText"),
                "extractedDetails": extracted,
                "status": "NOT FOUND IN DATASET",
                "explanation": "No record found in the configured Open India Law dataset snapshot.",
                "matchedFields": [],
                "differedFields": [],
                "missingFields": ["corpus_record"]
            }

        rec = matched["primary"]
        if matched["match_method"] == "exact_citation" and not matched["differed_fields"]:
            status = "VERIFIED MATCH"
            explanation = f"Exact match confirmed for '{rec['caseName']}' ({rec['court']}, {rec['decisionDate']})."
        else:
            status = "PARTIAL MATCH"
            explanation = f"Candidate '{rec['caseName']}' identified, with field differences: {', '.join(matched['differed_fields'])}."

        return {
            "citationSupplied": extracted.get("originalText"),
            "normalizedCitation": extracted.get("normalizedText"),
            "extractedDetails": extracted,
            "status": status,
            "explanation": explanation,
            "matchMethod": matched["match_method"],
            "matchedFields": matched["matched_fields"],
            "differedFields": matched["differed_fields"],
            "missingFields": [],
            "matchedJudgment": {
                "caseId": rec["caseId"],
                "caseName": rec["caseName"],
                "court": rec["court"],
                "decisionDate": rec["decisionDate"],
                "year": rec["year"],
                "citations": rec["citations"],
                "docketNumber": rec.get("docketNumber"),
                "sourceUrl": rec["sourceUrl"],
                "isOfficialSource": rec.get("isOfficialSource", True)
            }
        }
