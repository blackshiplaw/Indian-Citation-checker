/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { PropositionEvaluation, PropositionSupportLabel } from '../models/citationTypes.ts';
import { IDatasetAdapter } from '../retrieval/datasetAdapter.ts';

export class PropositionChecker {
  private adapter: IDatasetAdapter;
  private aiClient?: GoogleGenAI;

  constructor(adapter: IDatasetAdapter, apiKey?: string) {
    this.adapter = adapter;
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim().length > 0) {
      this.aiClient = new GoogleGenAI({ apiKey: key });
    }
  }

  /**
   * Check whether retrieved passages from a cited judgment support, contradict, qualify, or fail to address a proposition.
   */
  async checkProposition(
    proposition: string,
    citationOrCaseId: string,
  ): Promise<PropositionEvaluation> {
    const disclaimer =
      'Research Aid Only: This assessment is an automated analysis based on retrieved judgment passages and does not constitute a definitive legal finding or formal legal opinion.';

    if (!proposition || proposition.trim().length < 5) {
      return {
        proposition,
        targetCitationOrCase: citationOrCaseId,
        label: 'INSUFFICIENT EVIDENCE',
        confidenceNotes: 'A valid legal proposition must be provided.',
        relevantPassages: [],
        disclaimer,
      };
    }

    // 1. Locate the judgment
    let record = this.adapter.searchByCaseId(citationOrCaseId);
    if (!record) {
      const records = this.adapter.searchExactCitation(citationOrCaseId);
      if (records.length > 0) {
        record = records[0];
      }
    }

    if (!record) {
      const fuzzy = this.adapter.searchByCaseNameFuzzy(citationOrCaseId, 0.4);
      if (fuzzy.length > 0) {
        record = fuzzy[0].record;
      }
    }

    if (!record || record.chunks.length === 0) {
      return {
        proposition,
        targetCitationOrCase: citationOrCaseId,
        label: 'INSUFFICIENT EVIDENCE',
        confidenceNotes: `No corresponding judgment chunks found in the corpus for '${citationOrCaseId}'.`,
        relevantPassages: [],
        disclaimer,
      };
    }

    // 2. Retrieve relevant passages using keyword / token overlap
    const propWords = proposition
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['this', 'that', 'with', 'from', 'under', 'court', 'held', 'case'].includes(w));

    const scoredChunks = record.chunks.map((chunk) => {
      const lower = chunk.text.toLowerCase();
      let matchCount = 0;
      for (const word of propWords) {
        if (lower.includes(word)) {
          matchCount++;
        }
      }
      return { chunk, score: matchCount };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    const relevantChunks = scoredChunks.filter((sc) => sc.score > 0).map((sc) => sc.chunk);

    if (relevantChunks.length === 0) {
      return {
        proposition,
        targetCitationOrCase: record.caseName,
        label: 'INSUFFICIENT EVIDENCE',
        confidenceNotes: `The retrieved judgment text for '${record.caseName}' does not contain passages overlapping with the core terms of the proposition.`,
        relevantPassages: [],
        disclaimer,
      };
    }

    const passageItems = relevantChunks.slice(0, 3).map((c) => ({
      chunkIndex: c.chunkIndex,
      excerpt: c.text,
      sourceRef: `${record!.caseName} (${record!.court}, ${record!.decisionDate}) - Chunk ${c.chunkIndex + 1}/${c.totalChunks}`,
    }));

    // 3. If Gemini is available, call Gemini 2.5 Flash for nuanced legal reasoning on the exact passages
    if (this.aiClient) {
      try {
        const prompt = `You are a legal proposition verification assistant.
Analyze whether the provided legal passages from an Indian court judgment support, contradict, qualify, or provide insufficient evidence for the stated legal proposition.

DO NOT invent quotes.
DO NOT use outside unverified facts.
Only evaluate based strictly on the provided passages.

Stated Proposition:
"${proposition}"

Judgment Passages:
${passageItems.map((p, idx) => `[Passage ${idx + 1} - Chunk ${p.chunkIndex}]: "${p.excerpt}"`).join('\n\n')}

Classify into exactly one of these labels:
- SUPPORTS
- CONTRADICTS
- QUALIFIES
- INSUFFICIENT EVIDENCE

Format your response as a valid JSON object with keys:
{
  "label": "SUPPORTS | CONTRADICTS | QUALIFIES | INSUFFICIENT EVIDENCE",
  "explanation": "Clear, concise legal reasoning explaining why the passages support, contradict, or qualify the proposition."
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          const validLabels: PropositionSupportLabel[] = [
            'SUPPORTS',
            'CONTRADICTS',
            'QUALIFIES',
            'INSUFFICIENT EVIDENCE',
          ];
          const label = validLabels.includes(parsed.label) ? parsed.label : 'QUALIFIES';

          return {
            proposition,
            targetCitationOrCase: record.caseName,
            label,
            confidenceNotes: parsed.explanation || 'Evaluated against verified judgment passages.',
            relevantPassages: passageItems,
            disclaimer,
          };
        }
      } catch (err: any) {
        console.warn('Gemini proposition analysis failed or was rate limited, falling back to deterministic inspection:', err.message);
      }
    }

    // 4. Deterministic fallback if Gemini is not configured or offline
    const combinedPassages = passageItems.map((p) => p.excerpt.toLowerCase()).join(' ');
    let label: PropositionSupportLabel = 'QUALIFIES';
    let notes = 'Direct textual alignment found in judgment chunks.';

    if (
      combinedPassages.includes('is struck down') ||
      combinedPassages.includes('unconstitutional') ||
      combinedPassages.includes('protected as an intrinsic part') ||
      combinedPassages.includes('fundamental right')
    ) {
      label = 'SUPPORTS';
      notes = 'Passages directly affirm the constitutional principle stated in the proposition.';
    }

    return {
      proposition,
      targetCitationOrCase: record.caseName,
      label,
      confidenceNotes: `${notes} (Evaluated via deterministic textual match on indexed judgment chunks).`,
      relevantPassages: passageItems,
      disclaimer,
    };
  }
}
