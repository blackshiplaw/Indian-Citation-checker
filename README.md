# Indian Legal Citation Checker (`indian-legal-citation-checker`)

> **Open-Source Legal Research Utility for Extracting, Normalizing, Matching, and Verifying Indian Court Citations against the Open India Law Corpus.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Data Source: Open India Law](https://img.shields.io/badge/Data%20Source-Open%20India%20Law%20(CC%20BY%204.0)-emerald.svg)](https://github.com/Vaquill-AI/open-india-law)

---

## 1. Overview

The **Indian Legal Citation Checker** is an open-source verification engine designed for advocates, litigators, law students, judicial researchers, and LegalTech developers. It extracts citations from unstructured legal text (pleadings, affidavits, articles, judicial orders), normalizes citation strings, cross-references them against indexed judgment metadata from the **Open India Law** repository, evaluates evidence consistency, and provides official direct source links (`sci.gov.in`, High Court portals).

### Primary Verification Questions Answered:
1. **Does a judgment matching this citation exist in the available corpus?**
2. **Does the case name match the judgment?**
3. **Do the citation, court, decision date, and year agree without conflict?**
4. **Can the judgment be located through an official primary source link?**
5. **Which citations in a legal brief could not be verified?**
6. **Which citation matches are ambiguous and require human review?**

---

## 2. Key Features

- **Deterministic Citation Extraction**: High-speed regex parsing with support for SCC (print & online), AIR, SCR, INSC neutral citations, High Court neutral citations (`YYYY:DHC:XXXX`), and specialized High Court reporters (Bom CR, ILR, CTC, Gau LR).
- **Rule-Based Normalization**: Standardizes punctuation, whitespace, and abbreviations into canonical lookup keys.
- **Evidence-Based Case Matching**: Matches across primary citations, parallel citations, case identifiers, and case names with explicit reporting of matched, differed, and missing fields.
- **Clear Verification Statuses**:
  - `VERIFIED MATCH`
  - `PARTIAL MATCH`
  - `AMBIGUOUS MATCH`
  - `NOT FOUND IN DATASET`
  - `UNVERIFIED`
  - `UNSUPPORTED FORMAT`
- **Source Link Provenance**: Displays direct links to official Supreme Court of India or High Court judgment PDFs whenever recorded.
- **Batch Verification & Export**: Submit multiple citations or full documents with 1-click export to CSV and JSON.
- **Optional Proposition Checking**: Research assistant module that retrieves judgment chunks and evaluates whether passages support, contradict, or qualify a stated proposition.
- **Strict Privacy**: No pasted documents are ever stored or written to disk.

---

## 3. Primary Data Source & Attribution

The application interfaces with the **Open India Law** repository:
- **Repository**: [https://github.com/Vaquill-AI/open-india-law](https://github.com/Vaquill-AI/open-india-law)
- **Repository Owner**: Vaquill AI
- **Dataset License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Data Scope**: 32.5 million judgment chunks spanning the Supreme Court of India and all 25 High Courts, plus 1.1 million legislation provisions. Sourced from official government portals.
- **Memory Safety**: AI Studio and web clients never load the multi-gigabyte dataset into browser memory. Instead, the application connects via the modular `DatasetAdapter` interface to indexed local snapshots or server-side databases.

---

## 4. Architecture

```
indian-legal-citation-checker/
│
├── pyproject.toml                         # Python package metadata
├── package.json                           # Node/TypeScript dependencies
├── server.ts                              # Full-stack API & dev server
├── src/
│   ├── engine/                            # Core TypeScript Verification Engine
│   │   ├── models/citationTypes.ts        # Typed schemas
│   │   ├── extraction/citationExtractor.ts# Deterministic parser
│   │   ├── normalization/citationNormalizer.ts # Punctuation & key normalizer
│   │   ├── matching/caseMatcher.ts        # Evidence hierarchy matcher
│   │   ├── verification/citationVerifier.ts # Status and explanation generator
│   │   ├── retrieval/datasetAdapter.ts    # Open India Law adapter & sample corpus
│   │   └── proposition/propositionChecker.ts # Optional semantic proposition evaluator
│   ├── components/                        # React LegalTech UI Components
│   └── indian_legal_citation_checker/     # Python package implementation
│       ├── extraction/
│       ├── normalization/
│       ├── matching/
│       ├── verification/
│       ├── retrieval/
│       └── api/                           # FastAPI endpoints
├── tests/                                 # Unit & integration test suite
└── docs/                                  # Methodologies, schemas, and limitations
```

---

## 5. Quickstart & Local Setup

### Option A: Web Application & API (Node.js / Express + Vite)

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server (Port 3000)
npm run dev

# 3. Build for production
npm run build
npm start
```

### Option B: Python Package & CLI

```bash
# 1. Install Python package in editable mode
pip install -e .

# 2. Run CLI tool on a legal document
citation-checker examples/sample_input.txt

# 3. Run FastAPI backend server
uvicorn indian_legal_citation_checker.api.main:app --port 8000 --reload
```

---

## 6. Hosting & Deployment Guide (GitHub & Cloud)

### Can I host this on GitHub and resolve any citation?

| Hosting Target | Landmark Master Index | Live Primary Legal Registry | Notes |
| :--- | :---: | :---: | :--- |
| **GitHub Repository (Local / Clone)** | ✅ Yes | ✅ Yes | Full backend (`server.ts`) runs on your machine; no CORS issues. |
| **Cloud Hosting (Render / Railway / Hugging Face Spaces / Cloud Run)** | ✅ Yes | ✅ Yes | **Recommended.** Deploy directly from your GitHub repo for free. Full backend runs with zero CORS restrictions. |
| **GitHub Pages (`gh-pages` static only)** | ✅ Yes | ⚠️ Requires CORS Proxy | Pure static browser hosting. Master index works offline; live scraping of external court portals requires a backend API proxy due to browser CORS policies. |

#### Free 1-Click Deployment Options:
1. **Render.com / Railway.app**: Connect your GitHub repo, select Node environment, build command `npm run build`, and start command `npm start`.
2. **Hugging Face Spaces**: Deploy as a Docker or Node space for persistent, free LegalTech hosting.
3. **Remote Parquet Querying via DuckDB**: You can query the upstream 54.4 GB Open India Law Parquet dataset directly on Hugging Face using DuckDB HTTP range requests without downloading the dataset locally:
   ```python
   import duckdb
   # Direct remote query across 32.5M chunks with zero local download:
   res = duckdb.sql("SELECT case_id, title, court FROM 'https://huggingface.co/datasets/Vaquill-AI/open-india-law/resolve/main/*.parquet' WHERE citation ILIKE '%2014 2 SCC 1%' LIMIT 5")
   ```

---

## 7. API Reference

### `POST /api/v1/extract`
Extracts all detected citations from raw text.
```json
{
  "text": "In Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225, the Supreme Court..."
}
```

### `POST /api/v1/verify`
Verifies an array of extracted citation objects against the corpus.

### `POST /api/v1/verify-document`
Performs end-to-end extraction and verification on raw legal text.

### `GET /api/v1/coverage`
Returns documented corpus statistics, covered courts, date ranges, and license attribution.

### `GET /api/v1/health`
Returns system status, active corpus connection, and index metrics.

---

## 7. Verification Methodology vs. Legal Advice

| Concept | Explanation |
| :--- | :--- |
| **Citation Existence** | Confirms whether a judgment with this citation exists in the Open India Law dataset. |
| **Metadata Consistency** | Confirms whether the parties, court, year, and volume align with the record. |
| **Precedential Authority** | **NOT determined.** A verified citation does not prove that a judgment remains good law or has not been overruled. |
| **Proposition Support** | Evaluated separately via textual passage retrieval; never inferred from citation existence. |

---

## 8. License & Attribution

- **Software**: Licensed under the [Apache License, Version 2.0](LICENSE).
- **Legal Corpus**: Open India Law data is provided under **CC BY 4.0** by [Vaquill AI](https://github.com/Vaquill-AI/open-india-law). Official judgment texts remain in the public domain or subject to official Indian court publishing guidelines.
