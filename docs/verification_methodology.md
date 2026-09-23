# Verification Methodology

The application strictly distinguishes between five core legal concepts:

1. **Citation Existence**: Does a judgment matching this citation appear in the indexed corpus?
2. **Citation Identity**: Does the citation identify the exact same judicial proceeding as the candidate record?
3. **Metadata Consistency**: Do the case name, court, date, year, and docket number agree without conflict?
4. **Source Availability**: Is there an official, verifiable source link (e.g. `sci.gov.in`)?
5. **Proposition Support**: Does the judgment actually support the legal proposition for which it was cited? (Evaluated in a dedicated optional mode, never inferred from citation existence).

---

## Verification Status Definitions

### 1. `VERIFIED MATCH`
- **Definition**: The input citation corresponds to a verified judgment record in the corpus with exact or unambiguous normalized matching and consistent metadata (court, decision year).
- **Evidence Required**: Exact match on citation or parallel citation, or exact match on case identifier.

### 2. `PARTIAL MATCH`
- **Definition**: The case was identified through case name matching or parallel citation, but certain metadata fields differ (e.g., conflicting decision year or volume number) or citation string is missing from primary citations.
- **Evidence Required**: Explains exact differences in `differedFields`.

### 3. `AMBIGUOUS MATCH`
- **Definition**: Multiple judgments in the corpus matched the supplied citation or case name with comparable heuristic confidence.
- **Action**: Exposes all candidate judgments for manual advocate review.

### 4. `NOT FOUND IN DATASET`
- **Definition**: No matching record was located in the configured corpus snapshot.
- **Transparency Rule**: This status MUST NOT be interpreted as evidence that the judgment does not exist in Indian legal history. It simply denotes absence in the active indexed database.

### 5. `UNVERIFIED`
- **Definition**: Low confidence match with insufficient corroborating metadata to establish reliability.

### 6. `UNSUPPORTED FORMAT`
- **Definition**: The input text resembles a legal reference but does not conform to recognized Indian reporter or neutral citation syntax.
