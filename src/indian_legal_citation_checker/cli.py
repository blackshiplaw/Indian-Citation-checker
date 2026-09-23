"""
Command Line Interface for Indian Legal Citation Checker.
"""

import sys
import os
import json
import argparse

# Allow direct execution as a script
if __package__ is None or __package__ == "":
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
    from src.indian_legal_citation_checker.extraction.citation_extractor import extract_citations
    from src.indian_legal_citation_checker.verification.citation_verifier import CitationVerifier
    from src.indian_legal_citation_checker.retrieval.dataset_adapter import dataset_adapter
else:
    from .extraction.citation_extractor import extract_citations
    from .verification.citation_verifier import CitationVerifier
    from .retrieval.dataset_adapter import dataset_adapter

def main():
    parser = argparse.ArgumentParser(description="Indian Legal Citation Checker CLI")
    parser.add_argument("input", nargs="?", help="Legal text to verify or '-' to read from stdin")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("--file", "-f", help="Read input from a text file")

    args = parser.parse_args()

    text = ""
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            text = f.read()
    elif args.input == "-" or not sys.stdin.isatty():
        text = sys.stdin.read()
    elif args.input:
        text = args.input
    else:
        parser.print_help()
        sys.exit(1)

    citations = extract_citations(text)
    verifier = CitationVerifier(dataset_adapter)
    results = [verifier.verify(c) for c in citations]

    if args.json:
        print(json.dumps({"total": len(results), "results": results}, indent=2))
    else:
        print(f"\n==================================================")
        print(f"  INDIAN LEGAL CITATION CHECKER - CLI VERIFICATION")
        print(f"==================================================")
        print(f"Extracted {len(citations)} citation(s).\n")

        for idx, res in enumerate(results, 1):
            print(f"[{idx}] {res['citationSupplied']}")
            print(f"    Status:      {res['status']}")
            print(f"    Explanation: {res['explanation']}")
            if res.get("matchedJudgment"):
                j = res["matchedJudgment"]
                print(f"    Case Name:   {j['caseName']}")
                print(f"    Court:       {j['court']} ({j['decisionDate']})")
                print(f"    Source Link: {j['sourceUrl']}")
            print("-" * 50)

if __name__ == "__main__":
    main()
