# Known Limitations & Transparency Notice

## 1. Not Legal Advice
The **Indian Legal Citation Checker** is an automated research aid for advocates, researchers, academics, and legal professionals. It does not replace independent legal verification by a qualified advocate.

## 2. Precedential Authority
A `VERIFIED MATCH` indicates that the judgment exists in the corpus and matches metadata. **It does not establish that the judgment remains good law.** The system does not claim to track whether a judgment has been subsequently overruled, reversed, distinguished, or superseded by constitutional amendment.

## 3. Corpus Boundaries
- The Open India Law dataset excludes District Courts and Subordinate Trial Courts.
- The web demonstration environment operates against a curated indexed sample of landmark decisions to guarantee sub-millisecond response times and prevent memory exhaustion. Production setups can mount the complete corpus via partitioned SQLite or DuckDB Parquet adapters.

## 4. No Synthetic Authorities
The application strictly refuses to fabricate case citations, fake paragraph numbers, or artificial legal holdings. When records or source links are absent, the system honestly marks them as `NOT FOUND IN DATASET` or `Source link unavailable`.
