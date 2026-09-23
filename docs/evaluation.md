# Evaluation & Quality Assurance

The citation extraction and verification pipeline is tested against benchmark test cases spanning landmark judgments and synthetic edge cases:

1. **Extraction Accuracy**:
   - Punctuation variations: `(1973) 4 SCC 225`, `[1973] 4 SCR 541`, `AIR 1973 SC 1461`, `2023 INSC 582`.
   - Associated case name extraction with prefixes like `In the matter of`, `decided in`, `as held in`.
   - Rejection of non-legal citations and numbers.

2. **Metadata Consistency**:
   - Verifying year match vs year mismatch.
   - Court indicator validation (`SC` -> `Supreme Court of India`, `Del` -> `High Court of Delhi`).

3. **Batch Integrity**:
   - Multiple citations in single document extracted without offsets overlapping or corrupting adjacent citations.
   - High speed deterministic extraction (>10,000 words/second).
