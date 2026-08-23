import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional

from rag.config import RAG_VECTOR_STORE_PATH, RAG_TOP_K, RAG_RERANK_TOP_K, RAG_EMBEDDING_MODEL
from rag.models import (
    DocumentChunk,
    DocumentMetadata,
    SourceCitation,
    RAGQueryRequest,
    RAGQueryResult,
    IngestRequest,
    IngestResponse,
    RAGHealthResponse,
)
from rag.documents import load_raw_document, create_document_chunks
from rag.embeddings import LocalHashingEmbeddingProvider, EmbeddingProvider
from rag.vector_store import LocalPersistentVectorStore, VectorStore
from rag.retrieval import SemanticRetriever, DocumentReranker


class RAGService:
    """
    Main FinMitra RAG Orchestration Service.
    Handles ingestion, chunking, embedding, persistent storage, retrieval, reranking, and source citations.
    """

    def __init__(
        self,
        vector_store: Optional[VectorStore] = None,
        embedding_provider: Optional[EmbeddingProvider] = None,
    ):
        self.embedding_provider = embedding_provider or LocalHashingEmbeddingProvider()
        self.vector_store = vector_store or LocalPersistentVectorStore(storage_dir=RAG_VECTOR_STORE_PATH)
        self.retriever = SemanticRetriever(
            vector_store=self.vector_store,
            embedding_provider=self.embedding_provider
        )
        self.reranker = DocumentReranker()

    def ingest_document_text(self, request: IngestRequest) -> IngestResponse:
        """
        Ingest text string into RAG vector store with metadata and content hashing.
        """
        if not request.document_text or not request.document_text.strip():
            return IngestResponse(
                success=False,
                document_id="",
                chunks_created=0,
                message="Document text is empty"
            )

        doc_id = "doc_" + hashlib.md5(f"{request.title}_{request.source}".encode("utf-8")).hexdigest()[:12]

        metadata = DocumentMetadata(
            title=request.title,
            source=request.source,
            source_type=request.source_type,
            topic=request.topic,
            company=request.company,
            symbol=request.symbol,
            created_at=datetime.now().isoformat()
        )

        chunks = create_document_chunks(
            text=request.document_text,
            document_id=doc_id,
            base_metadata=metadata
        )

        if not chunks:
            return IngestResponse(
                success=False,
                document_id=doc_id,
                chunks_created=0,
                message="No text chunks generated from document"
            )

        chunk_texts = [c.text for c in chunks]
        embeddings = self.embedding_provider.embed_documents(chunk_texts)
        added_count = self.vector_store.add_chunks(chunks, embeddings)

        return IngestResponse(
            success=True,
            document_id=doc_id,
            chunks_created=added_count,
            message=f"Successfully ingested {added_count} chunks for document '{request.title}'"
        )

    def ingest_file(
        self,
        file_path: str | Path,
        title: Optional[str] = None,
        source_type: str = "financial_education",
        topic: Optional[str] = "general",
        company: Optional[str] = None,
        symbol: Optional[str] = None
    ) -> IngestResponse:
        """
        Ingest document file (TXT, Markdown, PDF, HTML) into RAG vector store.
        """
        path = Path(file_path)
        raw_text, _ = load_raw_document(path)

        doc_title = title or path.stem.replace("_", " ").title()
        request = IngestRequest(
            document_text=raw_text,
            title=doc_title,
            source=str(path.name),
            source_type=source_type,
            topic=topic,
            company=company,
            symbol=symbol
        )

        return self.ingest_document_text(request)

    def query(self, request: RAGQueryRequest) -> RAGQueryResult:
        """
        Execute semantic + keyword retrieval and reranking for a query.
        """
        filters = {}
        if request.topic:
            filters["topic"] = request.topic
        if request.symbol:
            filters["symbol"] = request.symbol
        if request.company:
            filters["company"] = request.company
        if request.source_type:
            filters["source_type"] = request.source_type

        # 1. Retrieve initial candidate chunks
        initial_candidates = self.retriever.retrieve(
            query=request.query,
            top_k=request.top_k * 2,
            filters=filters if filters else None
        )

        # 2. Rerank candidates by relevance score + source trust priority
        reranked = self.reranker.rerank(
            query=request.query,
            candidates=initial_candidates,
            top_k=request.top_k
        )

        final_chunks = [item[0] for item in reranked]

        # 3. Format citations
        citations = []
        for chunk in final_chunks:
            meta = chunk.metadata
            citations.append(
                SourceCitation(
                    title=meta.title,
                    source=meta.source,
                    document_id=chunk.document_id,
                    source_type=meta.source_type,
                    page_number=meta.page_number,
                    topic=meta.topic
                )
            )

        return RAGQueryResult(
            query=request.query,
            chunks=final_chunks,
            citations=citations,
            total_found=len(final_chunks)
        )

    def get_health(self) -> RAGHealthResponse:
        """
        Return operational status of RAG vector store and database counts.
        """
        total_chunks = self.vector_store.count()
        return RAGHealthResponse(
            status="healthy",
            vector_store="LocalPersistentVectorStore",
            document_count=total_chunks,
            chunk_count=total_chunks,
            embedding_model=RAG_EMBEDDING_MODEL
        )
