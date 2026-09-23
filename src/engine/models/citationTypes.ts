/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CitationFormat =
  | 'scc'
  | 'scc_online'
  | 'air'
  | 'scr'
  | 'neutral_insc'
  | 'neutral_high_court'
  | 'high_court_reporter'
  | 'scale'
  | 'jt'
  | 'unsupported';

export type VerificationStatus =
  | 'VERIFIED MATCH'
  | 'PARTIAL MATCH'
  | 'AMBIGUOUS MATCH'
  | 'NOT FOUND IN DATASET'
  | 'UNVERIFIED'
  | 'UNSUPPORTED FORMAT';

export interface ExtractedCitation {
  id: string;
  originalText: string;
  normalizedText: string;
  canonicalKey: string;
  format: CitationFormat;
  startOffset: number;
  endOffset: number;
  year?: number;
  volume?: string;
  reporter?: string;
  page?: string;
  courtIndicator?: string;
  caseNumber?: string;
  associatedCaseName?: string;
  warnings: string[];
}

export interface JudgmentChunk {
  chunkIndex: number;
  totalChunks: number;
  text: string;
  heading?: string;
  sourceUrl?: string;
}

export interface JudgmentRecord {
  caseId: string;
  caseName: string;
  petitioner?: string;
  respondent?: string;
  court: string;
  decisionDate: string; // YYYY-MM-DD
  year: number;
  citations: string[]; // Primary & parallel citations
  normalizedCitations: string[];
  docketNumber?: string;
  bench?: string[];
  docType: 'judgment' | 'order';
  sourceUrl: string; // Official URL (e.g. sci.gov.in, e-courts)
  isOfficialSource: boolean;
  chunks: JudgmentChunk[];
  keyPassages?: string[];
  headnotes?: string;
}

export interface VerificationResult {
  citationSupplied: string;
  normalizedCitation: string;
  extractedDetails: ExtractedCitation;
  status: VerificationStatus;
  explanation: string;
  matchMethod?:
    | 'exact_citation'
    | 'normalized_citation'
    | 'case_id'
    | 'case_name_and_citation'
    | 'case_name_court_and_date'
    | 'fuzzy_case_name'
    | 'none';
  matchedFields: string[];
  differedFields: string[];
  missingFields: string[];
  matchedJudgment?: {
    caseId: string;
    caseName: string;
    court: string;
    decisionDate: string;
    year: number;
    citations: string[];
    docketNumber?: string;
    bench?: string[];
    sourceUrl: string;
    isOfficialSource: boolean;
    chunksCount: number;
  };
  candidateJudgments?: Array<{
    caseId: string;
    caseName: string;
    court: string;
    decisionDate: string;
    citations: string[];
    sourceUrl: string;
    similarityScore: number;
    heuristicExplanation: string;
  }>;
}

export type PropositionSupportLabel =
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'QUALIFIES'
  | 'INSUFFICIENT EVIDENCE'
  | 'NOT ASSESSED';

export interface PropositionEvaluation {
  proposition: string;
  targetCitationOrCase: string;
  label: PropositionSupportLabel;
  confidenceNotes: string;
  relevantPassages: Array<{
    chunkIndex: number;
    excerpt: string;
    sourceRef: string;
  }>;
  disclaimer: string;
}

export interface DatasetCoverageInfo {
  corpusName: string;
  sourceProvider: string;
  license: string;
  repositoryUrl: string;
  totalCasesIndexed: number;
  totalChunksIndexed: number;
  courtCoverage: string[];
  dateRange: {
    startYear: number;
    endYear: number;
  };
  supportedReporters: string[];
  limitations: string[];
}
