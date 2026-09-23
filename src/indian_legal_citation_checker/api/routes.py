"""
FastAPI application routes for Indian Legal Citation Checker.
"""

from fastapi import APIRouter, HTTPException
from ..extraction.citation_extractor import extract_citations
from ..verification.citation_verifier import CitationVerifier
from ..retrieval.dataset_adapter import dataset_adapter
from ..models.citation import (
    ExtractRequest,
    VerifyRequest,
    DocumentVerifyRequest,
    PropositionRequest
)

router = APIRouter(prefix="/api/v1")
verifier = CitationVerifier(dataset_adapter)

@router.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Indian Legal Citation Checker",
        "datasetStatus": "connected",
        "totalCasesIndexed": len(dataset_adapter.records)
    }

@router.get("/coverage")
def coverage():
    return {
        "corpusName": "Open India Law (Vaquill AI)",
        "license": "CC BY 4.0",
        "totalCasesIndexed": len(dataset_adapter.records)
    }

@router.get("/cases/{case_id}")
def get_case(case_id: str):
    rec = dataset_adapter.search_by_case_id(case_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Case not found")
    return rec

@router.post("/extract")
def extract(req: ExtractRequest):
    citations = extract_citations(req.text)
    return {"total": len(citations), "citations": citations}

@router.post("/verify")
def verify(req: VerifyRequest):
    citations_dict = [c.model_dump(by_alias=True) for c in req.citations]
    results = [verifier.verify(c) for c in citations_dict]
    return {"total": len(results), "results": results}

@router.post("/verify-document")
def verify_document(req: DocumentVerifyRequest):
    citations = extract_citations(req.text)
    results = [verifier.verify(c) for c in citations]
    return {"extractedCount": len(citations), "results": results}
