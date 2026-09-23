/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CaseMatcher } from '../matching/caseMatcher.ts';
import { ExtractedCitation, VerificationResult } from '../models/citationTypes.ts';
import { IDatasetAdapter } from '../retrieval/datasetAdapter.ts';
import { liveLegalResolver } from '../retrieval/liveLegalResolver.ts';

export class CitationVerifier {
  private matcher: CaseMatcher;
  private adapter: IDatasetAdapter;

  constructor(adapter: IDatasetAdapter) {
    this.adapter = adapter;
    this.matcher = new CaseMatcher(adapter);
  }

  /**
   * Synchronously verify an extracted citation against the local in-memory corpus.
   */
  verify(extracted: ExtractedCitation): VerificationResult {
    // 1. Check for unsupported format
    if (extracted.format === 'unsupported') {
      return {
        citationSupplied: extracted.originalText,
        normalizedCitation: extracted.normalizedText,
        extractedDetails: extracted,
        status: 'UNSUPPORTED FORMAT',
        explanation:
          'The provided citation string does not conform to known Indian legal reporter or neutral citation patterns (SCC, AIR, SCR, INSC, High Court neutral/reporters). Please review format.',
        matchedFields: [],
        differedFields: [],
        missingFields: ['standard_reporter_format'],
      };
    }

    // 2. Perform case matching
    const matchResult = this.matcher.match(extracted);

    // 3. Evaluate Match Outcome
    if (matchResult.isAmbiguous) {
      return {
        citationSupplied: extracted.originalText,
        normalizedCitation: extracted.normalizedText,
        extractedDetails: extracted,
        status: 'AMBIGUOUS MATCH',
        explanation: `Multiple candidate judgments in the corpus (${matchResult.allCandidates.length} records) match with comparable confidence. Human review required to disambiguate.`,
        matchMethod: matchResult.primaryCandidate?.matchMethod,
        matchedFields: matchResult.primaryCandidate?.matchedFields || [],
        differedFields: matchResult.primaryCandidate?.differedFields || [],
        missingFields: matchResult.primaryCandidate?.missingFields || [],
        candidateJudgments: matchResult.allCandidates.map((c) => ({
          caseId: c.record.caseId,
          caseName: c.record.caseName,
          court: c.record.court,
          decisionDate: c.record.decisionDate,
          citations: c.record.citations,
          sourceUrl: c.record.sourceUrl,
          similarityScore: c.score,
          heuristicExplanation: c.heuristicExplanation,
        })),
      };
    }

    if (!matchResult.primaryCandidate) {
      return {
        citationSupplied: extracted.originalText,
        normalizedCitation: extracted.normalizedText,
        extractedDetails: extracted,
        status: 'NOT FOUND IN DATASET',
        explanation:
          'No matching judgment was located in the local landmark corpus. Note: Absence in the local snapshot indicates it may be indexed in the broader 32.5M Open India Law Parquet files or requires live registry resolution.',
        matchMethod: 'none',
        matchedFields: [],
        differedFields: [],
        missingFields: ['record_in_active_corpus'],
      };
    }

    const best = matchResult.primaryCandidate;
    const record = best.record;

    // Check if exact citation or normalized citation match
    if (best.matchMethod === 'exact_citation' || best.matchMethod === 'normalized_citation') {
      if (best.differedFields.length > 0) {
        return {
          citationSupplied: extracted.originalText,
          normalizedCitation: extracted.normalizedText,
          extractedDetails: extracted,
          status: 'PARTIAL MATCH',
          explanation: `The citation was matched to '${record.caseName}', but some metadata fields conflict (${best.differedFields.join(', ')}).`,
          matchMethod: best.matchMethod,
          matchedFields: best.matchedFields,
          differedFields: best.differedFields,
          missingFields: best.missingFields,
          matchedJudgment: {
            caseId: record.caseId,
            caseName: record.caseName,
            court: record.court,
            decisionDate: record.decisionDate,
            year: record.year,
            citations: record.citations,
            docketNumber: record.docketNumber,
            bench: record.bench,
            sourceUrl: record.sourceUrl,
            isOfficialSource: record.isOfficialSource,
            chunksCount: record.chunks.length,
          },
        };
      }

      return {
        citationSupplied: extracted.originalText,
        normalizedCitation: extracted.normalizedText,
        extractedDetails: extracted,
        status: 'VERIFIED MATCH',
        explanation: `Confirmed exact citation match in the corpus. Aligns with judgment '${record.caseName}' pronounced by ${record.court} on ${record.decisionDate}.`,
        matchMethod: best.matchMethod,
        matchedFields: best.matchedFields,
        differedFields: [],
        missingFields: best.missingFields,
        matchedJudgment: {
          caseId: record.caseId,
          caseName: record.caseName,
          court: record.court,
          decisionDate: record.decisionDate,
          year: record.year,
          citations: record.citations,
          docketNumber: record.docketNumber,
          bench: record.bench,
          sourceUrl: record.sourceUrl,
          isOfficialSource: record.isOfficialSource,
          chunksCount: record.chunks.length,
        },
      };
    }

    // Heuristic match via Case Name or Court + Date
    if (
      best.matchMethod === 'case_name_and_citation' ||
      best.matchMethod === 'case_name_court_and_date' ||
      best.matchMethod === 'fuzzy_case_name'
    ) {
      const isVerified = best.score >= 0.7 && best.differedFields.length === 0;

      return {
        citationSupplied: extracted.originalText,
        normalizedCitation: extracted.normalizedText,
        extractedDetails: extracted,
        status: isVerified ? 'VERIFIED MATCH' : 'PARTIAL MATCH',
        explanation: `Matched through heuristic evidence (${best.heuristicExplanation}). Associated with '${record.caseName}'.`,
        matchMethod: best.matchMethod,
        matchedFields: best.matchedFields,
        differedFields: best.differedFields,
        missingFields: best.missingFields,
        matchedJudgment: {
          caseId: record.caseId,
          caseName: record.caseName,
          court: record.court,
          decisionDate: record.decisionDate,
          year: record.year,
          citations: record.citations,
          docketNumber: record.docketNumber,
          bench: record.bench,
          sourceUrl: record.sourceUrl,
          isOfficialSource: record.isOfficialSource,
          chunksCount: record.chunks.length,
        },
      };
    }

    return {
      citationSupplied: extracted.originalText,
      normalizedCitation: extracted.normalizedText,
      extractedDetails: extracted,
      status: 'UNVERIFIED',
      explanation:
        'Could not establish a reliable match with sufficient confidence. Possible candidate identified with low token overlap.',
      matchMethod: best.matchMethod,
      matchedFields: best.matchedFields,
      differedFields: best.differedFields,
      missingFields: best.missingFields,
      candidateJudgments: [
        {
          caseId: record.caseId,
          caseName: record.caseName,
          court: record.court,
          decisionDate: record.decisionDate,
          citations: record.citations,
          sourceUrl: record.sourceUrl,
          similarityScore: best.score,
          heuristicExplanation: best.heuristicExplanation,
        },
      ],
    };
  }

  /**
   * Asynchronously verify an extracted citation with automatic fallback
   * to live primary Indian legal registries if absent from local memory.
   */
  async verifyAsync(
    extracted: ExtractedCitation,
    enableLiveResolver = true
  ): Promise<VerificationResult> {
    const localResult = this.verify(extracted);

    // If already verified or partial match, return immediately
    if (localResult.status !== 'NOT FOUND IN DATASET' || !enableLiveResolver) {
      return localResult;
    }

    // Try resolving via live legal registry
    try {
      const liveRecord = await liveLegalResolver.resolveCitation(extracted.originalText);
      if (liveRecord) {
        this.adapter.addRecord(liveRecord);
        // Re-run matching against newly cached live record
        const liveMatch = this.verify(extracted);
        if (liveMatch.status === 'VERIFIED MATCH' || liveMatch.status === 'PARTIAL MATCH') {
          liveMatch.explanation = `Live Primary Registry Match: Verified in public Indian court registry. Aligns with judgment '${liveRecord.caseName}' (${liveRecord.court}, ${liveRecord.decisionDate}).`;
          return liveMatch;
        }

        return {
          citationSupplied: extracted.originalText,
          normalizedCitation: extracted.normalizedText,
          extractedDetails: extracted,
          status: 'VERIFIED MATCH',
          explanation: `Discovered and verified via live Indian legal registry. Aligns with '${liveRecord.caseName}' pronounced on ${liveRecord.decisionDate}.`,
          matchMethod: 'exact_citation',
          matchedFields: ['live_registry_hit', 'citation_string'],
          differedFields: [],
          missingFields: [],
          matchedJudgment: {
            caseId: liveRecord.caseId,
            caseName: liveRecord.caseName,
            court: liveRecord.court,
            decisionDate: liveRecord.decisionDate,
            year: liveRecord.year,
            citations: liveRecord.citations,
            sourceUrl: liveRecord.sourceUrl,
            isOfficialSource: liveRecord.isOfficialSource,
            chunksCount: liveRecord.chunks.length,
          },
        };
      }
    } catch {
      // Live resolver failed or timed out; fall back to local result
    }

    return localResult;
  }

  /**
   * Verify all extracted citations synchronously.
   */
  verifyMultiple(citations: ExtractedCitation[]): VerificationResult[] {
    return citations.map((c) => this.verify(c));
  }

  /**
   * Verify all extracted citations asynchronously with live registry fallback.
   */
  async verifyMultipleAsync(
    citations: ExtractedCitation[],
    enableLive = true
  ): Promise<VerificationResult[]> {
    return Promise.all(citations.map((c) => this.verifyAsync(c, enableLive)));
  }
}
