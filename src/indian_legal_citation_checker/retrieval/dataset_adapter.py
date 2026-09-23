"""
Dataset Adapter for Open India Law corpus.
"""

from typing import List, Dict, Any, Optional
from ..normalization.citation_normalizer import normalize_citation
from .sample_corpus import SAMPLE_JUDGMENT_DATA

class PythonDatasetAdapter:
    def __init__(self, records: Optional[List[Dict[str, Any]]] = None):
        self.records = records if records is not None else SAMPLE_JUDGMENT_DATA
        self.canonical_index: Dict[str, List[Dict[str, Any]]] = {}
        self.case_id_index: Dict[str, Dict[str, Any]] = {}
        self._build_indexes()

    def _build_indexes(self):
        self.canonical_index.clear()
        self.case_id_index.clear()
        for rec in self.records:
            self.case_id_index[rec["caseId"]] = rec
            for cit in rec.get("citations", []):
                norm = normalize_citation(cit)
                key = norm["canonical_key"]
                if key not in self.canonical_index:
                    self.canonical_index[key] = []
                self.canonical_index[key].append(rec)

    def search_exact_citation(self, citation_str: str) -> List[Dict[str, Any]]:
        norm = normalize_citation(citation_str)
        return self.canonical_index.get(norm["canonical_key"], [])

    def search_by_case_id(self, case_id: str) -> Optional[Dict[str, Any]]:
        return self.case_id_index.get(case_id)

    def search_by_case_name_fuzzy(self, query: str, threshold: float = 0.45) -> List[Dict[str, Any]]:
        q_tokens = set(query.lower().split())
        results = []
        for rec in self.records:
            t_tokens = set(rec["caseName"].lower().split())
            intersection = len(q_tokens.intersection(t_tokens))
            union = len(q_tokens.union(t_tokens))
            score = intersection / union if union > 0 else 0
            if score >= threshold:
                results.append({"record": rec, "score": score})
        return sorted(results, key=lambda x: x["score"], reverse=True)

dataset_adapter = PythonDatasetAdapter()
