/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExtractedCitation, JudgmentRecord } from '../models/citationTypes.ts';
import { IDatasetAdapter } from '../retrieval/datasetAdapter.ts';

export interface MatchCandidate {
  record: JudgmentRecord;
  matchMethod:
    | 'exact_citation'
    | 'normalized_citation'
    | 'case_id'
    | 'case_name_and_citation'
    | 'case_name_court_and_date'
    | 'fuzzy_case_name';
  score: number; // 0 to 1
  matchedFields: string[];
  differedFields: string[];
  missingFields: string[];
  heuristicExplanation: string;
}

export interface MatchResult {
  primaryCandidate?: MatchCandidate;
  allCandidates: MatchCandidate[];
  isAmbiguous: boolean;
}

export class CaseMatcher {
  private adapter: IDatasetAdapter;

  constructor(adapter: IDatasetAdapter) {
    this.adapter = adapter;
  }

  /**
   * Evaluates matching candidates by evidence hierarchy.
   */
  match(extracted: ExtractedCitation): MatchResult {
    const candidates: MatchCandidate[] = [];

    // 1. Exact match against citation or normalized citation
    const exactRecords = this.adapter.searchNormalizedCitation(extracted.canonicalKey);

    for (const record of exactRecords) {
      const { matchedFields, differedFields, missingFields } = this.compareFields(extracted, record);

      candidates.push({
        record,
        matchMethod: 'exact_citation',
        score: 1.0,
        matchedFields: ['citation', ...matchedFields],
        differedFields,
        missingFields,
        heuristicExplanation: `Exact match found on citation '${extracted.normalizedText}' in primary or parallel citation records.`,
      });
    }

    // 2. If no exact citation match, or if associated case name is present, check case name matches
    if (extracted.associatedCaseName) {
      const fuzzyMatches = this.adapter.searchByCaseNameFuzzy(extracted.associatedCaseName, 0.45);

      for (const { record, score } of fuzzyMatches) {
        // Avoid duplicate candidate
        if (candidates.some((c) => c.record.caseId === record.caseId)) {
          continue;
        }

        const { matchedFields, differedFields, missingFields } = this.compareFields(extracted, record);

        let matchMethod: MatchCandidate['matchMethod'] = 'fuzzy_case_name';
        let heuristicExplanation = `Fuzzy text overlap (${Math.round(score * 100)}% token match) between input party name '${extracted.associatedCaseName}' and '${record.caseName}'.`;

        // Check if year and court align
        const yearMatches = extracted.year && record.year === extracted.year;
        const courtMatches = extracted.courtIndicator && record.court.toLowerCase().includes(extracted.courtIndicator.toLowerCase());

        if (score >= 0.8 && yearMatches) {
          matchMethod = 'case_name_court_and_date';
          heuristicExplanation = `Strong case name correspondence combined with matching decision year (${extracted.year}).`;
        }

        candidates.push({
          record,
          matchMethod,
          score,
          matchedFields: ['caseName', ...(yearMatches ? ['year'] : []), ...(courtMatches ? ['court'] : []), ...matchedFields],
          differedFields: [
            ...(!yearMatches && extracted.year ? ['year'] : []),
            'citation',
            ...differedFields,
          ],
          missingFields,
          heuristicExplanation,
        });
      }
    }

    // Check ambiguity: if there are multiple strong candidates with near-equal scores
    const sorted = candidates.sort((a, b) => b.score - a.score);
    const isAmbiguous = sorted.length > 1 && Math.abs(sorted[0].score - sorted[1].score) < 0.15;

    return {
      primaryCandidate: sorted[0],
      allCandidates: sorted,
      isAmbiguous,
    };
  }

  private compareFields(extracted: ExtractedCitation, record: JudgmentRecord) {
    const matchedFields: string[] = [];
    const differedFields: string[] = [];
    const missingFields: string[] = [];

    // Compare Year
    if (extracted.year) {
      if (record.year === extracted.year) {
        matchedFields.push('year');
      } else {
        differedFields.push(`year (Input: ${extracted.year}, Record: ${record.year})`);
      }
    } else {
      missingFields.push('year');
    }

    // Compare Court
    if (extracted.courtIndicator) {
      const courtLow = record.court.toLowerCase();
      const indLow = extracted.courtIndicator.toLowerCase();
      if (courtLow.includes(indLow) || (indLow === 'sc' && courtLow.includes('supreme court'))) {
        matchedFields.push('court');
      } else {
        differedFields.push(`court (Input: ${extracted.courtIndicator}, Record: ${record.court})`);
      }
    }

    // Compare Case Name if available
    if (extracted.associatedCaseName) {
      const cleanExtName = extracted.associatedCaseName.toLowerCase();
      const cleanRecName = record.caseName.toLowerCase();
      if (cleanRecName.includes(cleanExtName) || cleanExtName.includes(cleanRecName)) {
        matchedFields.push('caseName');
      }
    }

    return { matchedFields, differedFields, missingFields };
  }
}
