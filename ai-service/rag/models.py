from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    title: str = "Untitled Document"
    section: Optional[str] = "General"
    source: str = "internal"
    source_type: Literal[
        "regulatory",
        "government",
        "exchange",
        "company_filing",
        "financial_education",
        "research",
        "user_document",
        "general_web"
    ] = "financial_education"
    publication_date: Optional[str] = None
    page_number: Optional[int] = None
    company: Optional[str] = None
    symbol: Optional[str] = None
    topic: Optional[str] = "general"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    text: str
    metadata: DocumentMetadata
    content_hash: str


class SourceCitation(BaseModel):
    title: str
    source: str
    document_id: str
    source_type: str
    page_number: Optional[int] = None
    topic: Optional[str] = None


class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)
    topic: Optional[str] = None
    symbol: Optional[str] = None
    company: Optional[str] = None
    source_type: Optional[str] = None


class RAGQueryResult(BaseModel):
    query: str
    chunks: list[DocumentChunk]
    citations: list[SourceCitation]
    total_found: int


class IngestRequest(BaseModel):
    document_text: str
    title: str
    source: str = "custom_upload"
    source_type: Literal[
        "regulatory",
        "government",
        "exchange",
        "company_filing",
        "financial_education",
        "research",
        "user_document",
        "general_web"
    ] = "financial_education"
    topic: Optional[str] = "general"
    company: Optional[str] = None
    symbol: Optional[str] = None


class IngestResponse(BaseModel):
    success: bool
    document_id: str
    chunks_created: int
    message: str


class RAGHealthResponse(BaseModel):
    status: str
    vector_store: str
    document_count: int
    chunk_count: int
    embedding_model: str
