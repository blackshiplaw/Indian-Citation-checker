/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  ClipboardPaste,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
  Filter,
  Sparkles,
  ArrowRight,
  Globe2,
  Database
} from 'lucide-react';
import { ExtractedCitation, JudgmentRecord, VerificationResult, VerificationStatus } from '../engine/models/citationTypes.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface CitationCheckerTabProps {
  onSelectJudgment: (record: JudgmentRecord) => void;
}

const PRESET_EXAMPLES = [
  {
    title: 'Landmark Constitution Bench (Master Index)',
    description: 'Kesavananda Bharati, Maneka Gandhi, Puttaswamy Privacy, Shreya Singhal',
    text: `In Kesavananda Bharati Sripadagalvaru v. State of Kerala, (1973) 4 SCC 225, also reported in AIR 1973 SC 1461, the 13-judge Constitution Bench articulated the basic structure doctrine.

Subsequently, in Maneka Gandhi v. Union of India, (1978) 1 SCC 248, the Supreme Court held that the procedure under Article 21 must be just, fair and reasonable.

This standard was reaffirmed in Justice K.S. Puttaswamy (Retd.) v. Union of India, (2017) 10 SCC 1, recognizing privacy as a fundamental right.

For online freedom of speech, see Shreya Singhal v. Union of India, (2015) 5 SCC 1, striking down Section 66A of the IT Act.`,
  },
  {
    title: 'Criminal & Procedural Precedents',
    description: 'Mandatory FIR in Lalita Kumari, Arrest safeguards in Arnesh Kumar, D.K. Basu',
    text: `In Lalita Kumari v. Govt. of U.P., (2014) 2 SCC 1, the Constitution Bench held that registration of an FIR under Section 154 CrPC is mandatory upon receipt of cognizable information.

Furthermore, in Arnesh Kumar v. State of Bihar, (2014) 8 SCC 273, the Supreme Court instituted mandatory check-lists under Section 41 CrPC to curb routine arrests.

This builds on the fundamental custodial safeguards formulated in D.K. Basu v. State of West Bengal, (1997) 1 SCC 416.`,
  },
  {
    title: 'Environmental & Public Law Authorities',
    description: 'Noise Pollution, Oleum Gas Leak absolute liability, Taj Trapezium',
    text: `In In Re: Noise Pollution, (2005) 5 SCC 733, the Supreme Court held that freedom from noise pollution is a facet of the right to life under Article 21.

Earlier, in M.C. Mehta v. Union of India, (1987) 1 SCC 395, the court established the doctrine of absolute liability for hazardous industrial enterprises.

Regarding the precautionary principle and heritage protection, see M.C. Mehta v. Union of India (Taj Trapezium), (1997) 2 SCC 353.`,
  },
  {
    title: 'Neutral & High Court Citations',
    description: 'Supreme Court Neutral (INSC), Delhi HC Online, Bombay HC Reporter',
    text: `Recent constitutional developments include 2023 INSC 920 regarding marriage equality petitions, and 2024 INSC 113 regarding the electoral bonds scheme.

In Delhi High Court intellectual property jurisprudence, see Christian Louboutin SAS v. Nakul Bajaj, 2018 SCC OnLine Del 12215, clarifying e-commerce intermediary safe harbour under Section 79.

For commercial revenue expenditure, refer to Godfrey Phillips India Ltd. v. Commissioner of Income Tax, (2015) 3 Bom CR 120.`,
  },
  {
    title: 'Discrepant & Unindexed Testing (Fuzzy & Heuristic)',
    description: 'Test year conflicts, OCR anomalies, and non-existent citations',
    text: `The petitioner cites Kesavananda Bharati v. State of Kerala, (1995) 4 SCC 225 [Note: Discrepant year 1995 instead of 1973 to test partial metadata matching].

The respondent also cites a fictional commercial reference: Apex Global Syndicate v. State of Nirvana, (2055) 99 SCC 12345, which does not exist anywhere in the legal registries.`,
  },
];

export const CitationCheckerTab: React.FC<CitationCheckerTabProps> = ({ onSelectJudgment }) => {
  const [inputText, setInputText] = useState(PRESET_EXAMPLES[0].text);
  const [isVerifying, setIsVerifying] = useState(false);
  const [enableLive, setEnableLive] = useState(true);
  const [results, setResults] = useState<VerificationResult[] | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Please enter or paste legal text containing citations.');
      return;
    }

    setErrorMsg(null);
    setIsVerifying(true);
    setResults(null);

    try {
      const response = await fetch('/api/v1/verify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, enableLive }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err: any) {
      setErrorMsg(`Verification request failed: ${err.message}. Ensure server is running.`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResults(null);
    setErrorMsg(null);
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setInputText(clip);
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyCitation = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Filtered results
  const filteredResults = results
    ? results.filter((r) => {
        if (filterStatus === 'ALL') return true;
        return r.status === filterStatus;
      })
    : [];

  const verifiedCount = results?.filter((r) => r.status === 'VERIFIED MATCH').length || 0;
  const partialCount = results?.filter((r) => r.status === 'PARTIAL MATCH').length || 0;
  const notFoundCount = results?.filter((r) => r.status === 'NOT FOUND IN DATASET').length || 0;
  const ambiguousCount = results?.filter((r) => r.status === 'AMBIGUOUS MATCH').length || 0;

  return (
    <div className="space-y-6">
      {/* 3-Tier Multi-Engine Coverage Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded p-5 shadow-sm border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
              3-Tier Multi-Engine Connected
            </span>
            <span className="text-xs text-slate-300">· Full Indian Legal Coverage (12.8M+ Judgments)</span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            The checker combines a <strong>sub-millisecond local landmark cache</strong> with a <strong>live primary legal registry resolver</strong> and <strong>custom chunk ingestion</strong>. It will verify any valid citation across the Supreme Court and all 25 High Courts without running out of browser memory.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded border border-slate-700/80 text-xs">
          <Globe2 className="w-4 h-4 text-emerald-400" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableLive}
              onChange={(e) => setEnableLive(e.target.checked)}
              className="rounded border-slate-600 text-slate-900 focus:ring-emerald-500"
            />
            <span className="text-slate-200 font-medium">Live Registry Fallback</span>
          </label>
        </div>
      </div>

      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 block mb-1">
            Deterministic Extraction & Corpus Matching
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 font-legal-serif mb-2">
            Verify Indian Legal Citations
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Paste judgments, written submissions, or pleadings. The engine deterministically parses SCC, AIR, SCR, INSC,
            and High Court citations, correlates metadata, evaluates evidence consistency, and provides official judgment links.
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mb-2 block">
            Load Sample Legal Documents:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_EXAMPLES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  setResults(null);
                }}
                className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded transition-colors text-left font-medium"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="legal-text-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Legal Document Text
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePaste}
              className="text-xs flex items-center gap-1 text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded font-medium"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
            <button
              onClick={handleClear}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          id="legal-text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={7}
          placeholder="Paste Indian legal text containing citations (e.g. 'In Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225...')"
          className="w-full text-sm font-legal-serif p-3.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none leading-relaxed text-slate-800 bg-white placeholder:text-slate-400"
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Supports SCC, AIR, SCR, INSC, DHC, Bom CR, Scale, JT across all Indian jurisdictions</span>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying || !inputText.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying across Corpus & Registry...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify Citations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Section */}
      {results !== null && (
        <div className="space-y-4">
          {/* Results Summary Bar */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Verification Results:
              </span>
              <span className="text-xs text-slate-600">
                <strong>{results.length}</strong> citation(s) extracted
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterStatus === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({results.length})
              </button>

              <button
                onClick={() => setFilterStatus('VERIFIED MATCH')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterStatus === 'VERIFIED MATCH'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                Verified ({verifiedCount})
              </button>

              {partialCount > 0 && (
                <button
                  onClick={() => setFilterStatus('PARTIAL MATCH')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    filterStatus === 'PARTIAL MATCH'
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  Partial ({partialCount})
                </button>
              )}

              {notFoundCount > 0 && (
                <button
                  onClick={() => setFilterStatus('NOT FOUND IN DATASET')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    filterStatus === 'NOT FOUND IN DATASET'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Not Found ({notFoundCount})
                </button>
              )}

              {ambiguousCount > 0 && (
                <button
                  onClick={() => setFilterStatus('AMBIGUOUS MATCH')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    filterStatus === 'AMBIGUOUS MATCH'
                      ? 'bg-purple-800 text-white'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
                  }`}
                >
                  Ambiguous ({ambiguousCount})
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          {filteredResults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded p-8 text-center text-xs text-slate-500">
              No citations matched the selected filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((result, idx) => {
                const isExpanded = expandedCardId === idx;
                const match = result.matchedJudgment;
                const isLive = result.matchedJudgment?.caseId?.startsWith('IK-');

                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
                  >
                    {/* Header Row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={result.status} />

                          {isLive && (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                              Live Primary Registry Match
                            </span>
                          )}

                          {!isLive && match && (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Master Landmark Index
                            </span>
                          )}

                          <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {result.citationSupplied}
                          </span>

                          <button
                            onClick={() => handleCopyCitation(result.citationSupplied, idx)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                            title="Copy citation"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {result.extractedDetails.associatedCaseName && (
                          <div className="text-xs text-slate-500 italic">
                            Extracted associated party:{' '}
                            <span className="text-slate-700 font-medium">
                              {result.extractedDetails.associatedCaseName}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {match && (
                          <button
                            onClick={() => {
                              fetch(`/api/v1/cases/${match.caseId}`)
                                .then((r) => r.json())
                                .then((rec) => onSelectJudgment(rec))
                                .catch(() => {
                                  onSelectJudgment({
                                    caseId: match.caseId,
                                    caseName: match.caseName,
                                    court: match.court,
                                    decisionDate: match.decisionDate,
                                    year: match.year,
                                    citations: match.citations,
                                    sourceUrl: match.sourceUrl,
                                    isOfficialSource: match.isOfficialSource,
                                    docType: 'judgment',
                                    normalizedCitations: [],
                                    chunks: [],
                                  });
                                });
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>View Case</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : idx)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Less' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Matched Details Summary */}
                    {match && (
                      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-legal-serif font-semibold text-slate-900">
                            {match.caseName}
                          </div>
                          <div className="text-slate-500 text-2xs">
                            <span>{match.court}</span>
                            <span className="mx-1.5">·</span>
                            <span>{match.decisionDate}</span>
                            {match.bench && match.bench.length > 0 && (
                              <>
                                <span className="mx-1.5">·</span>
                                <span>Bench: {match.bench.slice(0, 2).join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {match.sourceUrl && (
                          <a
                            href={match.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            <span>{match.isOfficialSource ? 'Official Record' : 'Registry Document'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Expanded Technical Evidence Drawer */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">
                            Heuristic & Verification Explanation:
                          </span>
                          <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-200 leading-relaxed font-sans">
                            {result.explanation}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-2.5 rounded border border-slate-200">
                            <span className="text-slate-400 uppercase text-2xs font-semibold block mb-0.5">
                              Normalized Key
                            </span>
                            <code className="text-2xs font-mono text-slate-800 break-all">
                              {result.normalizedCitation || 'N/A'}
                            </code>
                          </div>

                          <div className="bg-white p-2.5 rounded border border-slate-200">
                            <span className="text-slate-400 uppercase text-2xs font-semibold block mb-0.5">
                              Match Method
                            </span>
                            <span className="text-2xs font-mono text-slate-800">
                              {result.matchMethod || 'none'}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded border border-slate-200">
                            <span className="text-slate-400 uppercase text-2xs font-semibold block mb-0.5">
                              Reporter Format
                            </span>
                            <span className="text-2xs font-mono uppercase text-slate-800">
                              {result.extractedDetails.format}
                            </span>
                          </div>
                        </div>

                        {/* Candidate list for ambiguous matches */}
                        {result.candidateJudgments && result.candidateJudgments.length > 0 && (
                          <div className="space-y-1.5 pt-2">
                            <span className="font-semibold text-slate-700 block">
                              Competing Corpus Candidates:
                            </span>
                            {result.candidateJudgments.map((cand, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2 bg-white rounded border border-slate-200 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-medium text-slate-800">{cand.caseName}</div>
                                  <div className="text-2xs text-slate-500">
                                    {cand.court} ({cand.decisionDate}) · Score: {(cand.similarityScore * 100).toFixed(0)}%
                                  </div>
                                </div>
                                <span className="text-2xs text-slate-500 font-mono">
                                  {cand.citations.join(', ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
