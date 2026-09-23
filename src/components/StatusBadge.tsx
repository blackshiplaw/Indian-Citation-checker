/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle, FileQuestion, Info } from 'lucide-react';
import { VerificationStatus } from '../engine/models/citationTypes.ts';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'VERIFIED MATCH':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded px-2 py-0.5 ${isSm ? 'text-xs' : 'text-xs'}`}>
          <CheckCircle2 className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-emerald-600 flex-shrink-0`} />
          <span className="tracking-wide">VERIFIED MATCH</span>
        </span>
      );

    case 'PARTIAL MATCH':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded px-2 py-0.5 ${isSm ? 'text-xs' : 'text-xs'}`}>
          <AlertTriangle className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-600 flex-shrink-0`} />
          <span className="tracking-wide">PARTIAL MATCH</span>
        </span>
      );

    case 'AMBIGUOUS MATCH':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-indigo-800 bg-indigo-50 border border-indigo-200/80 rounded px-2 py-0.5 ${isSm ? 'text-xs' : 'text-xs'}`}>
          <HelpCircle className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-indigo-600 flex-shrink-0`} />
          <span className="tracking-wide">AMBIGUOUS MATCH</span>
        </span>
      );

    case 'NOT FOUND IN DATASET':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-rose-800 bg-rose-50 border border-rose-200/80 rounded px-2 py-0.5 ${isSm ? 'text-xs' : 'text-xs'}`}>
          <XCircle className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-rose-600 flex-shrink-0`} />
          <span className="tracking-wide">NOT FOUND IN DATASET</span>
        </span>
      );

    case 'UNSUPPORTED FORMAT':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-purple-800 bg-purple-50 border border-purple-200/80 rounded px-2 py-0.5 ${isSm ? 'text-xs' : 'text-xs'}`}>
          <FileQuestion className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-purple-600 flex-shrink-0`} />
          <span className="tracking-wide">UNSUPPORTED FORMAT</span>
        </span>
      );

    case 'UNVERIFIED':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 border border-slate-200/80 rounded px-2 py-0.5 ${isSm ? 'text-xs' : 'text-xs'}`}>
          <Info className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-slate-500 flex-shrink-0`} />
          <span className="tracking-wide">UNVERIFIED</span>
        </span>
      );
  }
};
