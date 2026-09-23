"""
Tests for Citation Extraction Engine.
"""

from src.indian_legal_citation_checker.extraction.citation_extractor import extract_citations

def test_extract_single_scc_citation():
    text = "In Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225, the basic structure doctrine was evolved."
    citations = extract_citations(text)
    assert len(citations) == 1
    cit = citations[0]
    assert cit["format"] == "scc"
    assert cit["year"] == 1973
    assert cit["page"] == "225"
    assert cit["associatedCaseName"] == "Kesavananda Bharati v. State of Kerala"

def test_extract_multiple_citations():
    text = """
    As held in Maneka Gandhi v. Union of India, (1978) 1 SCC 248, and reiterated in
    Justice K.S. Puttaswamy v. Union of India, (2017) 10 SCC 1, Article 21 guarantees personal liberty.
    Also refer to 2023 INSC 582 for recent developments.
    """
    citations = extract_citations(text)
    assert len(citations) == 3
    reporters = [c["reporter"] for c in citations]
    assert "SCC" in reporters
    assert "INSC" in reporters

def test_extract_air_citation():
    text = "The court observed in AIR 1973 SC 1461 that constitutional amendments have limits."
    citations = extract_citations(text)
    assert len(citations) == 1
    assert citations[0]["format"] == "air"
    assert citations[0]["year"] == 1973
