/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers, BookCheck, HelpCircle, XCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge.tsx';

export const MethodologyTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 block mb-1">
          Verification Principles & Transparency
        </span>
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 font-legal-serif mb-2">
          Verification Methodology & Limitations
        </h2>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          The Indian Legal Citation Checker distinguishes strictly between finding a citation, verifying metadata consistency, and assessing substantive legal authority. The system operates transparently and never invents missing metadata.
        </p>
      </div>

      {/* 5 Distinct Verification Principles */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
          Core Verification Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <span className="font-semibold text-slate-900 text-sm block mb-1">
              A. Citation Existence
            </span>
            <p className="text-slate-600 leading-relaxed">
              Confirms whether a judgment matching the citation string exists within the configured Open India Law dataset snapshot.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <span className="font-semibold text-slate-900 text-sm block mb-1">
              B. Citation Identity
            </span>
            <p className="text-slate-600 leading-relaxed">
              Verifies whether the citation uniquely identifies the same legal proceedings as the candidate record, accounting for parallel reporters.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <span className="font-semibold text-slate-900 text-sm block mb-1">
              C. Metadata Consistency
            </span>
            <p className="text-slate-600 leading-relaxed">
              Checks that the party names, pronouncing court, decision date, and reporter volume agree without contradiction or temporal impossibility.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <span className="font-semibold text-slate-900 text-sm block mb-1">
              D. Source Availability
            </span>
            <p className="text-slate-600 leading-relaxed">
              Verifies the presence of a direct, official government publisher link (e.g. <code>sci.gov.in</code> or High Court portals).
            </p>
          </div>
        </div>

        {/* Proposition note */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900 leading-relaxed">
          <strong>E. Proposition Support vs. Citation Existence:</strong> A citation existing in the corpus does NOT establish that the judgment supports a specific legal proposition, nor does it establish that the judgment remains good law. Proposition evaluation is handled as a separate, optional research feature.
        </div>
      </div>

      {/* Evidence Hierarchy */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
          Evidence Ranking Hierarchy
        </h3>
        <p className="text-xs text-slate-600">
          The matching engine ranks candidate judgments using the strongest available evidence in descending order:
        </p>

        <div className="space-y-2 text-xs">
          {[
            { rank: 'Rank 1', name: 'Exact Citation Match', desc: 'Exact match against primary or recognized parallel citation fields in the corpus.' },
            { rank: 'Rank 2', name: 'Case Identifier Match', desc: 'Exact match against verified case deduplication key (e.g. SC-1973-13364).' },
            { rank: 'Rank 3', name: 'Normalized Citation Match', desc: 'Match after standardizing punctuation, reporter abbreviations, and spacing variations.' },
            { rank: 'Rank 4', name: 'Case Name and Citation Combination', desc: 'Corroboration between extracted party names and citation text.' },
            { rank: 'Rank 5', name: 'Case Name, Court, and Date Combination', desc: 'Corroboration across party names, court jurisdiction, and decision year.' },
            { rank: 'Rank 6', name: 'Fuzzy Token-Set Heuristic', desc: 'Fallback heuristic identifying candidate names with token overlap; reported transparently as a heuristic score.' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-200/80">
              <span className="font-mono font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-2xs flex-shrink-0">
                {item.rank}
              </span>
              <div>
                <strong className="text-slate-900 block">{item.name}</strong>
                <span className="text-slate-600">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Status Explanations */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800">
          Verification Status Classification
        </h3>

        <div className="space-y-3 text-xs">
          {[
            {
              status: 'VERIFIED MATCH' as const,
              desc: 'Supplied citation matches a judgment record with exact or unambiguous normalized matching and consistent metadata.',
            },
            {
              status: 'PARTIAL MATCH' as const,
              desc: 'Some fields match (e.g. party name or citation), but metadata fields conflict (e.g. year mismatch) or parallel citation is unrecorded.',
            },
            {
              status: 'AMBIGUOUS MATCH' as const,
              desc: 'Multiple candidate judgments in the corpus remain plausible with comparable heuristic scores; requires human review.',
            },
            {
              status: 'NOT FOUND IN DATASET' as const,
              desc: 'No matching record was located in the configured dataset. This must not be interpreted as proof that the judgment does not exist in law.',
            },
            {
              status: 'UNVERIFIED' as const,
              desc: 'Weak candidate match without sufficient corroborating metadata.',
            },
            {
              status: 'UNSUPPORTED FORMAT' as const,
              desc: 'The input resembles a legal reference but does not conform to recognized Indian reporter patterns.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex-shrink-0">
                <StatusBadge status={item.status} />
              </div>
              <p className="text-slate-600 flex-1 sm:pl-4">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Known Limitations Notice */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-2xs space-y-3 text-xs text-slate-600 leading-relaxed">
        <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>Operational Limitations & Scope</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          <li><strong>Not Legal Advice:</strong> This application is a technical research aid and does not substitute for independent professional legal judgment.</li>
          <li><strong>Precedential Good Law:</strong> The system does not assess whether a decision has been superseded, overruled, distinguished, or reversed.</li>
          <li><strong>No Trial Courts:</strong> District and subordinate trial courts are not included in the upstream Open India Law corpus.</li>
          <li><strong>Memory Safety:</strong> In browser mode, queries run against indexed metadata rather than loading the complete 32.5M chunks into browser memory.</li>
        </ul>
      </div>
    </div>
  );
};
