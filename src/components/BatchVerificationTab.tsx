/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Filter,
  Search,
  ExternalLink,
  BookOpen,
  Layers,
  FileSpreadsheet,
  FileCode,
  RotateCcw
} from 'lucide-react';
import { JudgmentRecord, VerificationResult } from '../engine/models/citationTypes.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface BatchVerificationTabProps {
  onSelectJudgment: (record: JudgmentRecord) => void;
}

const DEFAULT_BATCH_INPUT = `(1973) 4 SCC 225
(2017) 10 SCC 1
(1978) 1 SCC 248
(2015) 5 SCC 1
AIR 1980 SC 1789
(1997) 6 SCC 241
2018 SCC OnLine Del 12215
(2015) 3 Bom CR 120
2023 INSC 920
(2040) 100 SCC 9999`;

export const BatchVerificationTab: React.FC<BatchVerificationTabProps> = ({ onSelectJudgment }) => {
  const [batchText, setBatchText] = useState(DEFAULT_BATCH_INPUT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<VerificationResult[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRunBatch = async () => {
    if (!batchText.trim()) return;

    setIsProcessing(true);
    setResults(null);

    try {
      const response = await fetch('/api/v1/verify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: batchText }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Batch error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (!results || results.length === 0) return;

    const headers = [
      'Citation Supplied',
      'Normalized Citation',
      'Status',
      'Case Name',
      'Court',
      'Decision Date',
      'Match Method',
      'Source URL',
      'Explanation',
    ];

    const rows = results.map((r) => [
      `"${r.citationSupplied.replace(/"/g, '""')}"`,
      `"${r.normalizedCitation.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${(r.matchedJudgment?.caseName || '').replace(/"/g, '""')}"`,
      `"${(r.matchedJudgment?.court || '').replace(/"/g, '""')}"`,
      `"${r.matchedJudgment?.decisionDate || ''}"`,
      `"${r.matchMethod || ''}"`,
      `"${r.matchedJudgment?.sourceUrl || ''}"`,
      `"${r.explanation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citation_verification_batch_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!results || results.length === 0) return;
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citation_verification_batch_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredResults = results
    ? results.filter((r) => {
        const matchesFilter = statusFilter === 'ALL' || r.status === statusFilter;
        const matchesQuery =
          !searchQuery.trim() ||
          r.citationSupplied.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.matchedJudgment?.caseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.matchedJudgment?.court?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesQuery;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 block mb-1">
          High-Throughput Verification
        </span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 font-legal-serif mb-2">
          Batch Citation Verification
        </h2>
        <p className="text-sm text-slate-600 max-w-3xl">
          Paste multiple citations (one per line or separated in text) to verify them simultaneously. Filter by verification status and export audit-ready CSV or JSON reports.
        </p>
      </div>

      {/* Batch Input Card */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="batch-citation-input" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            List of Citations
          </label>
          <button
            onClick={() => setBatchText('')}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset List</span>
          </button>
        </div>

        <textarea
          id="batch-citation-input"
          value={batchText}
          onChange={(e) => setBatchText(e.target.value)}
          rows={6}
          placeholder="Enter one citation per line..."
          className="w-full text-xs font-legal-mono p-3 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none leading-relaxed text-slate-800 bg-white"
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {batchText.split('\n').filter((l) => l.trim().length > 0).length} citation line(s) entered
          </span>

          <button
            onClick={handleRunBatch}
            disabled={isProcessing || !batchText.trim()}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Verify All Citations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Table Section */}
      {results && (
        <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden space-y-0">
          {/* Table Controls */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search citation or case name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            {/* Filter and Exports */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded text-xs">
                {['ALL', 'VERIFIED MATCH', 'PARTIAL MATCH', 'NOT FOUND IN DATASET'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded text-2xs font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st.replace(' MATCH', '').replace(' IN DATASET', '')}
                  </button>
                ))}
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 flex items-center gap-1 shadow-2xs"
                  title="Export to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 flex items-center gap-1 shadow-2xs"
                  title="Export to JSON"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Citation Supplied</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Candidate Case Name</th>
                  <th className="py-3 px-4">Court / Date</th>
                  <th className="py-3 px-4">Match Method</th>
                  <th className="py-3 px-4">Source Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No citations match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((row, idx) => {
                    const matched = row.matchedJudgment;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-legal-mono font-medium text-slate-900 whitespace-nowrap">
                          {row.citationSupplied}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={row.status} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          {matched ? (
                            <button
                              onClick={() => {
                                fetch(`/api/v1/cases/${matched.caseId}`)
                                  .then((r) => r.json())
                                  .then((d) => onSelectJudgment(d))
                                  .catch(() => {});
                              }}
                              className="text-left font-legal-serif font-medium text-slate-900 hover:text-blue-700 hover:underline max-w-xs truncate block"
                            >
                              {matched.caseName}
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">No record located</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {matched ? (
                            <div>
                              <span>{matched.court}</span>
                              {matched.decisionDate && (
                                <span className="text-slate-400 block text-2xs">({matched.decisionDate})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-2xs">
                          {row.matchMethod || 'none'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {matched?.sourceUrl ? (
                            <a
                              href={matched.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
                            >
                              <span>Official PDF</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredResults.length} of {results.length} citations</span>
            <span>Open India Law Corpus Snapshot</span>
          </div>
        </div>
      )}
    </div>
  );
};
