"""
Tests for Citation Normalization.
"""

from src.indian_legal_citation_checker.normalization.citation_normalizer import (
    normalize_citation,
    normalize_case_name
)

def test_whitespace_normalization():
    res = normalize_citation("(  1973 )   4   SCC   225")
    assert res["normalized"] == "(1973) 4 SCC 225"
    assert res["canonical_key"] == "1973-4-scc-225"

def test_bracket_normalization():
    res = normalize_citation("[1973] 4 SCR 541")
    assert res["normalized"] == "(1973) 4 SCR 541"
    assert "1973-4-scr-541" in res["canonical_key"]

def test_reporter_period_normalization():
    res = normalize_citation("A.I.R. 1973 S.C. 1461")
    assert "AIR 1973 SC 1461" in res["normalized"]

def test_case_name_normalization():
    name = "Dr. Kesavananda Bharati vs. State of Kerala, "
    norm = normalize_case_name(name)
    assert norm == "Kesavananda Bharati v. State of Kerala"
