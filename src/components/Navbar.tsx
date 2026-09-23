/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, BookOpen, Layers, CheckSquare, Sparkles, Database, ShieldAlert } from 'lucide-react';

export type ActiveTab = 'checker' | 'batch' | 'proposition' | 'coverage' | 'methodology';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  corpusCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, corpusCount }) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'checker', label: 'Citation Checker', icon: Scale },
    { id: 'batch', label: 'Batch Verification', icon: Layers },
    { id: 'proposition', label: 'Proposition Checking', icon: Sparkles },
    { id: 'coverage', label: 'Corpus Coverage', icon: Database },
    { id: 'methodology', label: 'Methodology & Limitations', icon: ShieldAlert },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Provenance */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-amber-400 shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 font-legal-title">
                  Indian Legal Citation Checker
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Open India Law Corpus by Vaquill AI · CC BY 4.0
              </p>
            </div>
          </div>

          {/* Corpus status notice */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Corpus Adapter Connected</span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-700">{corpusCount} Landmark Cases Indexed</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
