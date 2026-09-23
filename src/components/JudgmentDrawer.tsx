/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ExternalLink, Copy, Check, BookOpen, UserCheck, Calendar, FileText } from 'lucide-react';
import { JudgmentRecord } from '../engine/models/citationTypes.ts';

interface JudgmentDrawerProps {
  judgment: JudgmentRecord | null;
  onClose: () => void;
}

export const JudgmentDrawer: React.FC<JudgmentDrawerProps> = ({ judgment, onClose }) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!judgment) return null;

  const handleCopyLink = () => {
    if (judgment.sourceUrl) {
      navigator.clipboard.writeText(judgment.sourceUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
              <span>{judgment.caseId}</span>
              <span>·</span>
              <span>{judgment.court}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 font-legal-serif leading-snug">
              {judgment.caseName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
              <span className="text-slate-400 uppercase tracking-wider block font-medium mb-1">Decision Date</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{judgment.decisionDate || 'Not specified'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
              <span className="text-slate-400 uppercase tracking-wider block font-medium mb-1">Docket / Petition No.</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>{judgment.docketNumber || 'Unrecorded in snapshot'}</span>
              </div>
            </div>
          </div>

          {/* Parallel Citations */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
              Recognized & Parallel Citations
            </h3>
            <div className="flex flex-wrap gap-2">
              {judgment.citations.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-legal-mono bg-slate-100 text-slate-800 border border-slate-200 rounded"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Bench */}
          {judgment.bench && judgment.bench.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                Coram / Bench ({judgment.bench.length} Judges)
              </h3>
              <div className="p-3 bg-slate-50 rounded border border-slate-200/80 text-xs text-slate-700 space-y-1">
                {judgment.bench.map((j, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{j}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Source Link Banner */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-amber-900 tracking-wide block">
                  Official Primary Source Link
                </span>
                <p className="text-xs text-slate-600 mt-0.5 truncate max-w-sm sm:max-w-md">
                  {judgment.sourceUrl || 'Official link unavailable in current snapshot.'}
                </p>
              </div>
              {judgment.sourceUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded text-xs flex items-center gap-1 shadow-2xs"
                    title="Copy Source Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={judgment.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Judgment Chunks (Open India Law Reconstructed Text) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Judgment Passages ({judgment.chunks.length} Chunk{judgment.chunks.length > 1 ? 's' : ''})
              </h3>
              <span className="text-xs text-slate-400">Open India Law Parquet Schema</span>
            </div>

            <div className="space-y-3">
              {judgment.chunks.map((chunk, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-200/60 font-mono">
                    <span className="font-semibold text-slate-700">
                      {chunk.heading || `Excerpt Section ${chunk.chunkIndex + 1}`}
                    </span>
                    <span>Chunk {chunk.chunkIndex + 1} of {chunk.totalChunks}</span>
                  </div>
                  <p className="font-legal-serif text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                    "{chunk.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Corpus: Open India Law (CC BY 4.0)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
