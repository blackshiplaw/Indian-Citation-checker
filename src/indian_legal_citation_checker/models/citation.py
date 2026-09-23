"""
Pydantic data models for Indian Legal Citation Checker.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ExtractedCitationModel(BaseModel):
    id: str
    original_text: str = Field(..., alias="originalText")
    normalized_text: str = Field(..., alias="normalizedText")
    canonical_key: str = Field(..., alias="canonicalKey")
    format: str
    start_offset: int = Field(..., alias="startOffset")
    end_offset: int = Field(..., alias="endOffset")
    year: Optional[int] = None
    volume: Optional[str] = None
    reporter: Optional[str] = None
    page: Optional[str] = None
    court_indicator: Optional[str] = Field(None, alias="courtIndicator")
    case_number: Optional[str] = Field(None, alias="caseNumber")
    associated_case_name: Optional[str] = Field(None, alias="associatedCaseName")
    warnings: List[str] = []

    class Config:
        populate_by_name = True

class JudgmentChunkModel(BaseModel):
    chunk_index: int = Field(..., alias="chunkIndex")
    total_chunks: int = Field(..., alias="totalChunks")
    text: str
    heading: Optional[str] = None
    source_url: Optional[str] = Field(None, alias="sourceUrl")

    class Config:
        populate_by_name = True

class JudgmentRecordModel(BaseModel):
    case_id: str = Field(..., alias="caseId")
    case_name: str = Field(..., alias="caseName")
    court: str
    decision_date: str = Field(..., alias="decisionDate")
    year: int
    citations: List[str]
    docket_number: Optional[str] = Field(None, alias="docketNumber")
    bench: Optional[List[str]] = None
    source_url: str = Field(..., alias="sourceUrl")
    is_official_source: bool = Field(True, alias="isOfficialSource")
    chunks: List[JudgmentChunkModel] = []
    key_passages: Optional[List[str]] = Field(None, alias="keyPassages")

    class Config:
        populate_by_name = True

class VerificationResultModel(BaseModel):
    citation_supplied: str = Field(..., alias="citationSupplied")
    normalized_citation: str = Field(..., alias="normalizedCitation")
    extracted_details: ExtractedCitationModel = Field(..., alias="extractedDetails")
    status: str
    explanation: str
    match_method: Optional[str] = Field(None, alias="matchMethod")
    matched_fields: List[str] = Field(default_factory=list, alias="matchedFields")
    differed_fields: List[str] = Field(default_factory=list, alias="differedFields")
    missing_fields: List[str] = Field(default_factory=list, alias="missingFields")
    matched_judgment: Optional[Dict[str, Any]] = Field(None, alias="matchedJudgment")
    candidate_judgments: Optional[List[Dict[str, Any]]] = Field(None, alias="candidateJudgments")

    class Config:
        populate_by_name = True

class ExtractRequest(BaseModel):
    text: str

class VerifyRequest(BaseModel):
    citations: List[ExtractedCitationModel]

class DocumentVerifyRequest(BaseModel):
    text: str

class PropositionRequest(BaseModel):
    proposition: str
    citation_or_case_id: str
