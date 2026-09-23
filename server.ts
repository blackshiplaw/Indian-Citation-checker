/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractCitations } from './src/engine/extraction/citationExtractor.ts';
import { PropositionChecker } from './src/engine/proposition/propositionChecker.ts';
import { datasetAdapter } from './src/engine/retrieval/datasetAdapter.ts';
import { CitationVerifier } from './src/engine/verification/citationVerifier.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const verifier = new CitationVerifier(datasetAdapter);
const propChecker = new PropositionChecker(datasetAdapter);

// API Endpoints
// Health check
app.get('/api/v1/health', (_req, res) => {
  const coverage = datasetAdapter.getCoverageInfo();
  res.json({
    status: 'healthy',
    service: 'Indian Legal Citation Checker',
    version: '1.0.0',
    datasetStatus: 'connected',
    totalCasesIndexed: coverage.totalCasesIndexed,
    totalChunksIndexed: coverage.totalChunksIndexed,
    upstreamCorpus: coverage.sourceProvider,
    timestamp: new Date().toISOString(),
  });
});

// Dataset Coverage and Supported Formats
app.get('/api/v1/coverage', (_req, res) => {
  res.json(datasetAdapter.getCoverageInfo());
});

// List all indexed cases
app.get('/api/v1/cases', (_req, res) => {
  const records = datasetAdapter.getAllRecords().map((r) => ({
    caseId: r.caseId,
    caseName: r.caseName,
    court: r.court,
    year: r.year,
    decisionDate: r.decisionDate,
    citations: r.citations,
    docketNumber: r.docketNumber,
    bench: r.bench,
    sourceUrl: r.sourceUrl,
    chunksCount: r.chunks.length,
    keyPassages: r.keyPassages,
  }));
  res.json({ total: records.length, cases: records });
});

// Get case by ID
app.get('/api/v1/cases/:case_id', (req, res) => {
  const record = datasetAdapter.searchByCaseId(req.params.case_id);
  if (!record) {
    return res.status(404).json({ error: `Judgment with ID '${req.params.case_id}' not found in active corpus.` });
  }
  res.json(record);
});

// Extract citations from text
app.post('/api/v1/extract', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Field "text" must be a non-empty string.' });
  }

  const citations = extractCitations(text);
  res.json({
    total: citations.length,
    citations,
  });
});

// Verify provided extracted citations
app.post('/api/v1/verify', async (req, res) => {
  const { citations, enableLive } = req.body;
  if (!Array.isArray(citations)) {
    return res.status(400).json({ error: 'Field "citations" must be an array of citation objects.' });
  }

  const results = await verifier.verifyMultipleAsync(citations, enableLive !== false);
  res.json({
    total: results.length,
    results,
  });
});

// Verify complete document in one step with live primary legal resolver fallback
app.post('/api/v1/verify-document', async (req, res) => {
  const { text, enableLive } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Field "text" must be a non-empty string.' });
  }

  const extracted = extractCitations(text);
  const results = await verifier.verifyMultipleAsync(extracted, enableLive !== false);

  res.json({
    extractedCount: extracted.length,
    results,
  });
});

// Ingest custom records / chunks from Open India Law or user datasets
app.post('/api/v1/ingest', (req, res) => {
  const { records, chunks } = req.body;

  if (Array.isArray(records)) {
    const added = datasetAdapter.ingestCustomRecords(records);
    return res.json({
      status: 'success',
      added,
      totalCases: datasetAdapter.getAllRecords().length,
    });
  }

  if (Array.isArray(chunks)) {
    const record = datasetAdapter.reconstructCaseFromChunks(chunks);
    if (record) {
      datasetAdapter.addRecord(record);
      return res.json({
        status: 'success',
        added: 1,
        reconstructedCase: record.caseName,
        totalCases: datasetAdapter.getAllRecords().length,
      });
    }
    return res.status(400).json({ error: 'Could not reconstruct valid judgment from provided chunks.' });
  }

  return res.status(400).json({ error: 'Either "records" array or "chunks" array must be supplied.' });
});

// Optional proposition checking
app.post('/api/v1/check-proposition', async (req, res) => {
  const { proposition, citationOrCaseId } = req.body;
  if (!proposition || !citationOrCaseId) {
    return res.status(400).json({ error: 'Fields "proposition" and "citationOrCaseId" are required.' });
  }

  try {
    const evaluation = await propChecker.checkProposition(proposition, citationOrCaseId);
    res.json(evaluation);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Proposition analysis failed' });
  }
});

// In production or development, attach Vite / Static Handler
async function setupApp() {
  if (process.env.NODE_ENV === 'production') {
    // Serve dist static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Indian Legal Citation Checker server running on port ${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
