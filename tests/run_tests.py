"""
Stand-alone test runner using Python standard library.
"""

import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.indian_legal_citation_checker.normalization.citation_normalizer import (
    normalize_citation,
    normalize_case_name
)
from src.indian_legal_citation_checker.extraction.citation_extractor import extract_citations
from src.indian_legal_citation_checker.verification.citation_verifier import CitationVerifier
from src.indian_legal_citation_checker.retrieval.dataset_adapter import dataset_adapter

def run():
    print("Running Indian Legal Citation Checker Unit Tests...\n")
    tests_passed = 0

    # 1. Normalization
    r1 = normalize_citation("(  1973 )   4   SCC   225")
    assert r1["normalized"] == "(1973) 4 SCC 225", f"Failed: {r1}"
    assert r1["canonical_key"] == "1973-4-scc-225"
    print("PASS: test_whitespace_normalization")
    tests_passed += 1

    r2 = normalize_citation("[1973] 4 SCR 541")
    assert r2["normalized"] == "(1973) 4 SCR 541", f"Failed: {r2}"
    print("PASS: test_bracket_normalization")
    tests_passed += 1

    r3 = normalize_citation("A.I.R. 1973 S.C. 1461")
    assert "AIR 1973 SC 1461" in r3["normalized"], f"Failed: {r3}"
    print("PASS: test_reporter_period_normalization")
    tests_passed += 1

    r4 = normalize_case_name("Dr. Kesavananda Bharati vs. State of Kerala, ")
    assert r4 == "Kesavananda Bharati v. State of Kerala", f"Failed: {r4}"
    print("PASS: test_case_name_normalization")
    tests_passed += 1

    # 2. Extraction
    text1 = "In Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225, basic structure was formed."
    cits1 = extract_citations(text1)
    assert len(cits1) == 1, f"Expected 1 citation, got {len(cits1)}"
    assert cits1[0]["year"] == 1973
    assert cits1[0]["page"] == "225"
    assert cits1[0]["associatedCaseName"] == "Kesavananda Bharati v. State of Kerala"
    print("PASS: test_extract_single_scc_citation")
    tests_passed += 1

    text2 = "AIR 1973 SC 1461 and 2023 INSC 582 were cited."
    cits2 = extract_citations(text2)
    assert len(cits2) == 2, f"Expected 2 citations, got {len(cits2)}"
    print("PASS: test_extract_multiple_formats")
    tests_passed += 1

    # 3. Verification
    verifier = CitationVerifier(dataset_adapter)
    res1 = verifier.verify(cits1[0])
    assert res1["status"] == "VERIFIED MATCH", f"Expected VERIFIED MATCH, got {res1['status']}"
    assert "SC-1973-13364" == res1["matchedJudgment"]["caseId"]
    assert "https://main.sci.gov.in" in res1["matchedJudgment"]["sourceUrl"]
    print("PASS: test_verified_match_scc")
    tests_passed += 1

    # 4. Not Found In Dataset
    fake_text = "Unpublished v. State, (2049) 99 SCC 8888"
    fake_cits = extract_citations(fake_text)
    res_fake = verifier.verify(fake_cits[0])
    assert res_fake["status"] == "NOT FOUND IN DATASET", f"Expected NOT FOUND, got {res_fake['status']}"
    print("PASS: test_not_found_citation")
    tests_passed += 1

    # 5. Unsupported Format
    unsupp = {
        "originalText": "Random XYZ 123",
        "normalizedText": "Random XYZ 123",
        "canonicalKey": "random-xyz-123",
        "format": "unsupported"
    }
    res_unsupp = verifier.verify(unsupp)
    assert res_unsupp["status"] == "UNSUPPORTED FORMAT", f"Expected UNSUPPORTED, got {res_unsupp['status']}"
    print("PASS: test_unsupported_format")
    tests_passed += 1

    print(f"\nALL {tests_passed} PYTHON UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
