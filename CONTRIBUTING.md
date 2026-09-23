# Contributing to Indian Legal Citation Checker

Thank you for your interest in contributing to this open-source legal technology utility!

## Development Guidelines
1. **Deterministic Citations**: Always prefer deterministic regex and standard legal patterns over probabilistic approaches for citation extraction.
2. **Open India Law Schema**: Preserve compatibility with the Open India Law chunk and case schema.
3. **No Fabrication**: Never invent fake citations or mock legal conclusions.
4. **Tests**: Add unit tests for every newly supported reporter or legal journal format in `tests/`.

## Running Tests
```bash
# Python tests
pytest

# TypeScript verification
npm run lint
```
