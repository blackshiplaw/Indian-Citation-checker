# Architecture: Indian Legal Citation Checker

## System Overview

The **Indian Legal Citation Checker** is a high-reliability, open-source legal research utility designed to detect, normalize, match, and verify citations to Indian court judgments against the [Open India Law](https://github.com/Vaquill-AI/open-india-law) corpus.

```
+--------------------------------------------------------------------+
|                         Frontend Client                            |
|  - Citation Checker (Input, Extraction Inspector, Drawer)          |
|  - Batch Verification (Multi-citation table, CSV/JSON Export)       |
|  - Proposition Checking (Optional semantic research aid)           |
+---------------------------------+----------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                         API Layer (Express / FastAPI)              |
|  - POST /api/v1/extract                                            |
|  - POST /api/v1/verify                                             |
|  - POST /api/v1/verify-document                                    |
|  - GET  /api/v1/cases/:case_id                                     |
|  - GET  /api/v1/coverage                                           |
|  - POST /api/v1/check-proposition                                  |
+---------------------------------+----------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+---------------------------+             +---------------------------+
| Citation Engine           |             | Proposition Engine        |
| - Deterministic Extractor |             | - Keyword chunk retrieval |
| - Citation Normalizer     |             | - Gemini 2.5 Flash        |
| - Case Matcher            |             | - Transparent citations   |
| - Citation Verifier       |             +---------------------------+
+-------------+-------------+
              |
              v
+--------------------------------------------------------------------+
|                     Dataset Adapter Layer                          |
|  - Open India Law schema mapping (case_id, chunk_index, etc.)      |
|  - Fast Canonical Key Map (O(1) lookup on normalized citations)    |
|  - Token Set Jaccard Heuristic for case names                      |
|  - Case Chunk Reconstructor                                        |
+--------------------------------------------------------------------+
```

## Core Modules

1. **Extraction (`citation_extractor`)**:
   Deterministic regex and pattern registry recognizing SCC, SCC OnLine, AIR, SCR, INSC, High Court Neutral citations, and standard High Court reporters. Extracts offsets, structured volume/year/page, and associates preceding case names.

2. **Normalization (`citation_normalizer`)**:
   Removes whitespace variations, strips redundant periods in abbreviations (`S.C.C.` -> `SCC`), standardizes bracket formats, and generates canonical keys (e.g. `1973-4-scc-225`).

3. **Matching & Verification (`case_matcher`, `citation_verifier`)**:
   Applies an unambiguous evidence hierarchy:
   - Rank 1: Exact citation match against indexed citations / parallel citations
   - Rank 2: Case ID match
   - Rank 3: Normalized citation key match
   - Rank 4: Case name and citation combination
   - Rank 5: Case name, court, and date combination
   - Rank 6: Heuristic fuzzy name match

4. **Dataset Adapter (`dataset_adapter`)**:
   Conforms to Open India Law's chunked judgment schema (`case_id`, `chunk_index`, `total_chunks`, `text`, `source_url`), ensuring high-volume memory safety and decoupling data storage from verification logic.
