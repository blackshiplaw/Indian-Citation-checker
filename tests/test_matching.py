"""
Tests for Case Matching and Verification.
"""

from src.indian_legal_citation_checker.extraction.citation_extractor import extract_citations
from src.indian_legal_citation_checker.verification.citation_verifier import CitationVerifier
from src.indian_legal_citation_checker.retrieval.dataset_adapter import dataset_adapter

def test_verified_match_scc():
    verifier = CitationVerifier(dataset_adapter)
    text = "Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225"
    extracted = extract_citations(text)[0]
    res = verifier.verify(extracted)
    assert res["status"] == "VERIFIED MATCH"
    assert res["matchedJudgment"]["caseId"] == "SC-1973-13364"
    assert "https://main.sci.gov.in" in res["matchedJudgment"]["sourceUrl"]

def test_partial_match_mismatched_year():
    verifier = CitationVerifier(dataset_adapter)
    # Give wrong year in extraction
    text = "Kesavananda Bharati v. State of Kerala, (1990) 4 SCC 225"
    extracted = extract_citations(text)[0]
    res = verifier.verify(extracted)
    # The citation text is not in record, but case name matches
    assert res["status"] in ["PARTIAL MATCH", "NOT FOUND IN DATASET"]

def test_not_found_citation():
    verifier = CitationVerifier(dataset_adapter)
    text = "Unrecorded Case v. Respondent, (1955) 99 SCC 9999"
    extracted = extract_citations(text)[0]
    res = verifier.verify(extracted)
    assert res["status"] == "NOT FOUND IN DATASET"
    assert "active corpus" in res["explanation"]
