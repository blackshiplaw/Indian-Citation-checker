/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NormalizedCitationResult {
  original: string;
  normalized: string;
  canonicalKey: string;
  warnings: string[];
}

/**
 * Standardize whitespace, punctuation, reporter abbreviations, and generate canonical lookup keys.
 */
export function normalizeCitation(rawCitation: string): NormalizedCitationResult {
  const warnings: string[] = [];
  if (!rawCitation || typeof rawCitation !== 'string') {
    return {
      original: rawCitation || '',
      normalized: '',
      canonicalKey: '',
      warnings: ['Empty or non-string citation provided'],
    };
  }

  const original = rawCitation.trim();

  // 1. Collapse multiple whitespaces
  let cleaned = original.replace(/\s+/g, ' ');

  // 2. Normalize brackets: replace square or curly brackets around years with standard parentheses
  // e.g., "[1973] 4 SCR 541" -> "(1973) 4 SCR 541"
  cleaned = cleaned.replace(/\[\s*(\d{4})\s*\]/g, '($1)');
  cleaned = cleaned.replace(/\{\s*(\d{4})\s*\}/g, '($1)');

  // 3. Normalize spaces inside parentheses: "( 1973 )" -> "(1973)"
  cleaned = cleaned.replace(/\(\s*([^\)]+?)\s*\)/g, '($1)');

  // 4. Normalize common reporter abbreviations and remove unnecessary periods
  // "S.C.C." -> "SCC", "A.I.R." -> "AIR", "S.C.R." -> "SCR", "I.L.R." -> "ILR", "J.T." -> "JT"
  cleaned = cleaned.replace(/\bS\.?\s*C\.?\s*C\.?(?=\s|[0-9]|$)/gi, 'SCC');
  cleaned = cleaned.replace(/\bA\.?\s*I\.?\s*R\.?(?=\s|$)/gi, 'AIR');
  cleaned = cleaned.replace(/\bS\.?\s*C\.?\s*R\.?(?=\s|$)/gi, 'SCR');
  cleaned = cleaned.replace(/\bI\.?\s*L\.?\s*R\.?(?=\s|$)/gi, 'ILR');
  cleaned = cleaned.replace(/\bJ\.?\s*T\.?(?=\s|$)/gi, 'JT');
  cleaned = cleaned.replace(/\bS\.?\s*C\.?\s*A\.?\s*L\.?\s*E\.?(?=\s|$)/gi, 'Scale');

  // Normalize "SCC OnLine" casing variations: "scc online", "SCC ONLINE", etc.
  cleaned = cleaned.replace(/\bSCC\s+Online\b/gi, 'SCC OnLine');

  // Normalize Neutral Citation INSC: "INSC"
  cleaned = cleaned.replace(/\bI\.?\s*N\.?\s*S\.?\s*C\.?(?=\s|$)/gi, 'INSC');

  // Normalize standard court indicators for AIR:
  // "AIR 1973 S.C." -> "AIR 1973 SC"
  cleaned = cleaned.replace(/\bAIR\s+(\d{4})\s+S\.?\s*C\.?(?=\s|$|[0-9])/gi, 'AIR $1 SC');
  cleaned = cleaned.replace(/\bAIR\s+(\d{4})\s+Del(?:hi)?\.?(?=\s|$|[0-9])/gi, 'AIR $1 Del');
  cleaned = cleaned.replace(/\bAIR\s+(\d{4})\s+Bom(?:bay)?\.?(?=\s|$|[0-9])/gi, 'AIR $1 Bom');
  cleaned = cleaned.replace(/\bAIR\s+(\d{4})\s+Cal(?:cutta)?\.?(?=\s|$|[0-9])/gi, 'AIR $1 Cal');
  cleaned = cleaned.replace(/\bAIR\s+(\d{4})\s+Mad(?:ras)?\.?(?=\s|$|[0-9])/gi, 'AIR $1 Mad');

  // 5. Build Canonical Key for index lookups
  // Lowercase, only alphanumeric separated by single hyphens
  const canonicalKey = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    original,
    normalized: cleaned,
    canonicalKey,
    warnings,
  };
}

/**
 * Clean and normalize a party or case name string.
 * Strips honorary titles like 'Dr.', 'Hon'ble', trims whitespace, standardizes 'vs' to 'v.'.
 */
export function normalizeCaseName(rawName: string): string {
  if (!rawName) return '';
  return rawName
    .replace(/\s+/g, ' ')
    .replace(/\bDr\.?\s*/gi, '')
    .replace(/\bShri\s*/gi, '')
    .replace(/\bSmt\.?\s*/gi, '')
    .replace(/\bHon(?:'|\b)?ble\s*/gi, '')
    .replace(/\b(?:vs\.?|versus|v\.)\s*/gi, 'v. ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;.]+|[\s,;.]+$/g, '')
    .trim();
}
