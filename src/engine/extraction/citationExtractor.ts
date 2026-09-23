/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CitationFormat, ExtractedCitation } from '../models/citationTypes.ts';
import { normalizeCaseName, normalizeCitation } from '../normalization/citationNormalizer.ts';

export interface CitationPatternDef {
  format: CitationFormat;
  name: string;
  regex: RegExp;
  extract: (match: RegExpExecArray, fullText: string) => Partial<ExtractedCitation>;
}

/**
 * Modular Pattern Registry for Indian Legal Citations.
 */
export const CITATION_PATTERNS: CitationPatternDef[] = [
  // 1. SCC Print: (1973) 4 SCC 225 or 1997 (2) SCC 12 or (2017) 10 SCC 1
  {
    format: 'scc',
    name: 'Supreme Court Cases (Print)',
    regex: /(?:\((\d{4})\)\s*(\d{1,2})?\s*SCC\s*(\d+)|(\d{4})\s*\(([0-9]+)\)\s*SCC\s*(\d+))/gi,
    extract: (match) => {
      let year: number;
      let volume: string | undefined;
      let page: string;

      if (match[1]) {
        year = parseInt(match[1], 10);
        volume = match[2] || undefined;
        page = match[3];
      } else {
        year = parseInt(match[4], 10);
        volume = match[5];
        page = match[6];
      }

      return {
        format: 'scc',
        year,
        volume,
        reporter: 'SCC',
        page,
        courtIndicator: 'Supreme Court',
      };
    },
  },

  // 2. SCC OnLine: 2021 SCC OnLine SC 450 or 2019 SCC OnLine Del 8214
  {
    format: 'scc_online',
    name: 'SCC OnLine',
    regex: /\b(\d{4})\s+SCC\s+OnLine\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+)\b/gi,
    extract: (match) => {
      const year = parseInt(match[1], 10);
      const courtIndicator = match[2];
      const page = match[3];
      return {
        format: 'scc_online',
        year,
        reporter: 'SCC OnLine',
        courtIndicator,
        caseNumber: page,
        page,
      };
    },
  },

  // 3. AIR: AIR 1973 SC 1461, AIR 1967 SC 1643, AIR 2020 Del 120
  {
    format: 'air',
    name: 'All India Reporter',
    regex: /\bAIR\s+(\d{4})\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+)\b/gi,
    extract: (match) => {
      const year = parseInt(match[1], 10);
      const courtIndicator = match[2];
      const page = match[3];
      return {
        format: 'air',
        year,
        reporter: 'AIR',
        courtIndicator,
        page,
      };
    },
  },

  // 4. Neutral Citation (Supreme Court of India): 2023 INSC 582 or 2024 INSC 105
  {
    format: 'neutral_insc',
    name: 'Supreme Court Neutral Citation (INSC)',
    regex: /\b(\d{4})\s+INSC\s+(\d+)\b/gi,
    extract: (match) => {
      const year = parseInt(match[1], 10);
      const caseNumber = match[2];
      return {
        format: 'neutral_insc',
        year,
        reporter: 'INSC',
        courtIndicator: 'Supreme Court of India',
        caseNumber,
        page: caseNumber,
      };
    },
  },

  // 5. Neutral Citation (High Courts): 2023:DHC:1234 or 2022:BHC-OS:456
  {
    format: 'neutral_high_court',
    name: 'High Court Neutral Citation',
    regex: /\b(\d{4})\s*:\s*([A-Z\-]+)\s*:\s*(\d+)\b/gi,
    extract: (match) => {
      const year = parseInt(match[1], 10);
      const courtIndicator = match[2];
      const caseNumber = match[3];
      return {
        format: 'neutral_high_court',
        year,
        reporter: courtIndicator,
        courtIndicator,
        caseNumber,
        page: caseNumber,
      };
    },
  },

  // 6. SCR: [1973] 4 SCR 541 or (1973) 4 SCR 541 or 1967 (2) SCR 762
  {
    format: 'scr',
    name: 'Supreme Court Reports',
    regex: /(?:\[(\d{4})\]|\((\d{4})\))\s*(\d{1,2})?\s*SCR\s*(\d+)/gi,
    extract: (match) => {
      const year = parseInt(match[1] || match[2], 10);
      const volume = match[3] || undefined;
      const page = match[4];
      return {
        format: 'scr',
        year,
        volume,
        reporter: 'SCR',
        page,
        courtIndicator: 'Supreme Court',
      };
    },
  },

  // 7. Scale & JT: (1993) 4 Scale 1 or (2002) 2 JT 450
  {
    format: 'scale',
    name: 'Judgments Today / Scale',
    regex: /\((\d{4})\)\s*(\d{1,2})?\s*(Scale|JT)\s*(\d+)/gi,
    extract: (match) => {
      const year = parseInt(match[1], 10);
      const volume = match[2] || undefined;
      const reporter = match[3];
      const page = match[4];
      return {
        format: reporter.toLowerCase() === 'jt' ? 'jt' : 'scale',
        year,
        volume,
        reporter,
        page,
      };
    },
  },

  // 8. High Court Specific Reporters: ILR (2000) 2 Del 450, (2015) 3 Bom CR 120, (2018) 5 CTC 201
  {
    format: 'high_court_reporter',
    name: 'High Court Reporter',
    regex: /(?:ILR\s*\((\d{4})\)\s*(\d+)?\s*([A-Za-z]+)\s*(\d+)|\((\d{4})\)\s*(\d+)\s*(Bom\s*CR|CTC|Gau\s*LR|DLT)\s*(\d+))/gi,
    extract: (match) => {
      if (match[1]) {
        return {
          format: 'high_court_reporter',
          year: parseInt(match[1], 10),
          volume: match[2],
          courtIndicator: match[3],
          reporter: `ILR ${match[3]}`,
          page: match[4],
        };
      } else {
        return {
          format: 'high_court_reporter',
          year: parseInt(match[5], 10),
          volume: match[6],
          reporter: match[7],
          courtIndicator: match[7],
          page: match[8],
        };
      }
    },
  },
];

/**
 * Heuristic to detect associated case name in preceding text.
 * Looks for pattern: "Party A v. Party B" or "Party A vs. Party B" or "In re Party"
 */
function findAssociatedCaseName(textBeforeCitation: string): string | undefined {
  // Take last 200 characters before citation
  const window = textBeforeCitation.slice(-200);

  // Look for "X v. Y" or "X vs. Y" or "In Re ...", ignoring leading punctuation/articles
  // E.g., "Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225"
  const vMatches = [
    // Standard "X v. Y" or "X vs. Y"
    /(?:([A-Z][A-Za-z0-9\s.,'&-]+?)\s+(?:v\.|vs\.?|versus)\s+([A-Z][A-Za-z0-9\s.,'&-]+?))(?:\s*,\s*|\s*\()?\s*$/i,
    // "In re X"
    /(?:In\s+re:?\s+([A-Z][A-Za-z0-9\s.,'&-]+?))(?:\s*,\s*|\s*\()?\s*$/i,
  ];

  for (const regex of vMatches) {
    const match = window.match(regex);
    if (match) {
      let rawName = match[0].replace(/[\(\),;]+$/, '').trim();
      // Clean up common introductory words like "In", "In the matter of", "stated in", "judgment in"
      rawName = rawName.replace(/^(?:in the matter of|in re|as held in|held in|reported in|see|decided in|judgment of|matter of|in)\s+/i, '');
      const normalized = normalizeCaseName(rawName);
      if (normalized.length >= 3 && normalized.length <= 120) {
        return normalized;
      }
    }
  }

  return undefined;
}

/**
 * Extract all supported citations from an arbitrary legal document text.
 * Preserves original text, start and end offsets, detected format, structured components,
 * and associated case names.
 */
export function extractCitations(inputText: string): ExtractedCitation[] {
  if (!inputText || typeof inputText !== 'string') {
    return [];
  }

  const results: ExtractedCitation[] = [];
  const coveredRanges: Array<[number, number]> = [];

  // Helper to check range overlap
  const isOverlapping = (start: number, end: number) => {
    return coveredRanges.some(([rStart, rEnd]) => {
      return (start >= rStart && start < rEnd) || (end > rStart && end <= rEnd) || (start <= rStart && end >= rEnd);
    });
  };

  // Run each pattern
  for (const pattern of CITATION_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(inputText)) !== null) {
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;

      if (isOverlapping(startOffset, endOffset)) {
        continue;
      }

      const originalText = match[0];
      const parsedPartial = pattern.extract(match, inputText);
      const textBefore = inputText.substring(0, startOffset);
      const associatedCaseName = findAssociatedCaseName(textBefore);

      const normResult = normalizeCitation(originalText);
      const warnings: string[] = [...normResult.warnings];

      if (!parsedPartial.year) {
        warnings.push('Citation is missing a clear decision/reporter year');
      }

      if (!parsedPartial.page && !parsedPartial.caseNumber) {
        warnings.push('Citation is missing a page or case number');
      }

      const citation: ExtractedCitation = {
        id: `cit-${startOffset}-${endOffset}`,
        originalText,
        normalizedText: normResult.normalized,
        canonicalKey: normResult.canonicalKey,
        format: parsedPartial.format || pattern.format,
        startOffset,
        endOffset,
        year: parsedPartial.year,
        volume: parsedPartial.volume,
        reporter: parsedPartial.reporter,
        page: parsedPartial.page,
        courtIndicator: parsedPartial.courtIndicator,
        caseNumber: parsedPartial.caseNumber,
        associatedCaseName,
        warnings,
      };

      results.push(citation);
      coveredRanges.push([startOffset, endOffset]);
    }
  }

  // Also detect potential ambiguous legal citations (e.g. malformed citations like "1999 SCC 45" without volume,
  // or "AIR SC 123" without year) to return as unsupported/ambiguous candidates instead of silently dropping them.
  const ambiguousRegex = /\b(\d{4})\s+([A-Z]{2,6})\s+(\d+)\b/g;
  let ambMatch: RegExpExecArray | null;

  while ((ambMatch = ambiguousRegex.exec(inputText)) !== null) {
    const startOffset = ambMatch.index;
    const endOffset = startOffset + ambMatch[0].length;

    if (!isOverlapping(startOffset, endOffset)) {
      const originalText = ambMatch[0];
      const normResult = normalizeCitation(originalText);
      const textBefore = inputText.substring(0, startOffset);
      const associatedCaseName = findAssociatedCaseName(textBefore);

      results.push({
        id: `cit-${startOffset}-${endOffset}`,
        originalText,
        normalizedText: normResult.normalized,
        canonicalKey: normResult.canonicalKey,
        format: 'unsupported',
        startOffset,
        endOffset,
        year: parseInt(ambMatch[1], 10),
        reporter: ambMatch[2],
        page: ambMatch[3],
        associatedCaseName,
        warnings: ['Unrecognized or ambiguous citation format; requires manual verification'],
      });
      coveredRanges.push([startOffset, endOffset]);
    }
  }

  // Sort by appearance in text
  return results.sort((a, b) => a.startOffset - b.startOffset);
}
