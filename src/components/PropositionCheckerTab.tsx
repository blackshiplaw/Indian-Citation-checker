/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, XCircle, AlertTriangle, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PropositionEvaluation, PropositionSupportLabel } from '../engine/models/citationTypes.ts';

const PROPOSITION_PRESETS = [
  {
    title: 'Right to Privacy under Article 21',
    proposition: 'The right to privacy is protected as an intrinsic fundamental right under Article 21 and Part III of the Constitution.',
    target: '(2017) 10 SCC 1',
    labelHint: 'Puttaswamy (2017)',
  },
  {
    title: 'Basic Structure Doctrine',
    proposition: 'Parliament has unlimited constituent powers to amend or abrogate any provision of the Constitution without any implied limitations.',
    target: '(1973) 4 SCC 225',
    labelHint: 'Kesavananda Bharati (1973)',
  },
  {
    title: 'Unconstitutionality of Section 66A IT Act',
    proposition: 'Section 66A of the Information Technology Act is unconstitutional because it arbitrarily penalizes free speech and discussion on the internet.',
    target: '(2015) 5 SCC 1',
    labelHint: 'Shreya Singhal (2015)',
  },
  {
    title: 'Procedural Fairness in Personal Liberty',
    proposition: 'Procedure established by law under Article 21 cannot be arbitrary or oppressive; it must be just, fair and reasonable.',
    target: '(1978) 1 SCC 248',
    labelHint: 'Maneka Gandhi (1978)',
  },
];

export const PropositionCheckerTab: React.FC = () => {
  const [proposition, setProposition] = useState(PROPOSITION_PRESETS[0].proposition);
  const [citationOrCase, setCitationOrCase] = useState(PROPOSITION_PRESETS[0].target);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<PropositionEvaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!proposition.trim() || !citationOrCase.trim()) {
      setErrorMsg('Both the legal proposition and target citation/judgment must be provided.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setEvaluation(null);

    try {
      const response = await fetch('/api/v1/check-proposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposition,
          citationOrCaseId: citationOrCase,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: PropositionEvaluation = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      setErrorMsg(`Proposition analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getLabelBadge = (label: PropositionSupportLabel) => {
    switch (label) {
      case 'SUPPORTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-semibold text-xs tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>SUPPORTS</span>
          </span>
        );
      case 'CONTRADICTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded font-semibold text-xs tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>CONTRADICTS</span>
          </span>
        );
      case 'QUALIFIES':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded font-semibold text-xs tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>QUALIFIES</span>
          </span>
        );
      case 'INSUFFICIENT EVIDENCE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold text-xs tracking-wider">
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span>INSUFFICIENT EVIDENCE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs">
        <div className="flex items-start justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Optional Semantic Feature
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 font-legal-serif mb-2">
              Proposition Support Checker
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Test whether a legal assertion is supported, contradicted, or qualified by authentic passages in the cited judgment. This feature retrieves indexed judgment chunks and performs strict textual analysis.
            </p>
          </div>
        </div>

        {/* Preset Selectors */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mb-2 block">
            Select Example Proposition:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROPOSITION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProposition(preset.proposition);
                  setCitationOrCase(preset.target);
                  setEvaluation(null);
                }}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 rounded transition-colors text-xs space-y-1"
              >
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>{preset.title}</span>
                  <span className="text-slate-400 font-mono text-2xs">{preset.labelHint}</span>
                </div>
                <p className="text-slate-600 line-clamp-1 italic">"{preset.proposition}"</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-4">
        <div>
          <label htmlFor="legal-prop-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            1. Legal Proposition to Test
          </label>
          <textarea
            id="legal-prop-input"
            value={proposition}
            onChange={(e) => setProposition(e.target.value)}
            rows={3}
            placeholder="e.g. 'The power of Parliament to amend the Constitution is subject to the basic structure doctrine.'"
            className="w-full text-sm font-legal-serif p-3 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none leading-relaxed text-slate-800 bg-white"
          />
        </div>

        <div>
          <label htmlFor="citation-case-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            2. Target Citation or Case Name in Corpus
          </label>
          <input
            id="citation-case-input"
            type="text"
            value={citationOrCase}
            onChange={(e) => setCitationOrCase(e.target.value)}
            placeholder="e.g. '(1973) 4 SCC 225' or 'Kesavananda Bharati'"
            className="w-full text-xs font-legal-mono p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 bg-white"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Retrieves authentic chunks from Open India Law corpus before evaluation.
          </p>

          <button
            onClick={handleEvaluate}
            disabled={isLoading || !proposition.trim() || !citationOrCase.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Evaluating Passages...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Analyze Proposition</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Results Box */}
      {evaluation && (
        <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                Judgment Examined
              </span>
              <h3 className="text-base font-semibold text-slate-900 font-legal-serif">
                {evaluation.targetCitationOrCase}
              </h3>
            </div>
            <div>{getLabelBadge(evaluation.label)}</div>
          </div>

          {/* Reasoning */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Analysis & Textual Justification
            </span>
            <p className="text-sm text-slate-800 leading-relaxed font-legal-serif">
              {evaluation.confidenceNotes}
            </p>
          </div>

          {/* Relevant Passages */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3">
              Retrieved Judgment Passages ({evaluation.relevantPassages.length})
            </span>

            {evaluation.relevantPassages.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No direct textual passages found in available chunks.</p>
            ) : (
              <div className="space-y-3">
                {evaluation.relevantPassages.map((p, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="text-slate-400 font-mono text-2xs mb-1.5 pb-1 border-b border-slate-200/60">
                      {p.sourceRef}
                    </div>
                    <blockquote className="font-legal-serif text-slate-800 text-sm leading-relaxed italic border-l-2 border-slate-300 pl-3">
                      "{p.excerpt}"
                    </blockquote>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transparency Disclaimer */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-xs text-amber-900 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold mb-0.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Automated Research Aid Notice</span>
            </div>
            {evaluation.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
