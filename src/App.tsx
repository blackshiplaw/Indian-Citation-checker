/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ActiveTab, Navbar } from './components/Navbar.tsx';
import { CitationCheckerTab } from './components/CitationCheckerTab.tsx';
import { BatchVerificationTab } from './components/BatchVerificationTab.tsx';
import { PropositionCheckerTab } from './components/PropositionCheckerTab.tsx';
import { CoverageTab } from './components/CoverageTab.tsx';
import { MethodologyTab } from './components/MethodologyTab.tsx';
import { JudgmentDrawer } from './components/JudgmentDrawer.tsx';
import { JudgmentRecord } from './engine/models/citationTypes.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('checker');
  const [selectedJudgment, setSelectedJudgment] = useState<JudgmentRecord | null>(null);
  const [corpusCount, setCorpusCount] = useState<number>(11);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.totalCasesIndexed) {
          setCorpusCount(data.totalCasesIndexed);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        corpusCount={corpusCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'checker' && (
          <CitationCheckerTab onSelectJudgment={(record) => setSelectedJudgment(record)} />
        )}

        {activeTab === 'batch' && (
          <BatchVerificationTab onSelectJudgment={(record) => setSelectedJudgment(record)} />
        )}

        {activeTab === 'proposition' && <PropositionCheckerTab />}

        {activeTab === 'coverage' && (
          <CoverageTab onSelectJudgment={(record) => setSelectedJudgment(record)} />
        )}

        {activeTab === 'methodology' && <MethodologyTab />}
      </main>

      {/* Slide-over Judgment Drawer */}
      <JudgmentDrawer
        judgment={selectedJudgment}
        onClose={() => setSelectedJudgment(null)}
      />

      {/* Institutional LegalTech Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-slate-700">
              Indian Legal Citation Checker · Open Source LegalTech
            </p>
            <p className="text-slate-400">
              Primary Corpus: Open India Law (CC BY 4.0) by Vaquill AI. Software under Apache-2.0.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setActiveTab('methodology')}
              className="hover:text-slate-900 hover:underline"
            >
              Methodology
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('coverage')}
              className="hover:text-slate-900 hover:underline"
            >
              Dataset Scope
            </button>
            <span>·</span>
            <a
              href="https://github.com/Vaquill-AI/open-india-law"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              Corpus GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
