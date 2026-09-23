"""
Tests for Verification Outcomes and Ambiguity.
"""

from src.indian_legal_citation_checker.verification.citation_verifier import CitationVerifier
from src.indian_legal_citation_checker.retrieval.dataset_adapter import dataset_adapter

def test_unsupported_format():
    verifier = CitationVerifier(dataset_adapter)
    fake_extracted = {
        "id": "cit-0-10",
        "originalText": "Random Law Ref 123",
        "normalizedText": "Random Law Ref 123",
        "canonicalKey": "random-law-ref-123",
        "format": "unsupported",
        "startOffset": 0,
        "endOffset": 10,
        "warnings": ["Unsupported format"]
    }
    res = verifier.verify(fake_extracted)
    assert res["status"] == "UNSUPPORTED FORMAT"

def test_source_url_honesty():
    verifier = CitationVerifier(dataset_adapter)
    fake_extracted = {
        "id": "cit-0-10",
        "originalText": "Nonexistent v. State, (2000) 1 SCC 1",
        "normalizedText": "(2000) 1 SCC 1",
        "canonicalKey": "2000-1-scc-1",
        "format": "scc",
        "startOffset": 0,
        "endOffset": 10,
        "warnings": []
    }
    res = verifier.verify(fake_extracted)
    assert res["status"] == "NOT FOUND IN DATASET"
    assert res.get("matchedJudgment") is None
