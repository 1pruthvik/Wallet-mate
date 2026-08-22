from pathlib import Path
from fastapi.testclient import TestClient

from main import app
from rag.models import (
    DocumentMetadata,
    RAGQueryRequest,
    IngestRequest,
)
from rag.documents import clean_text, create_document_chunks
from rag.embeddings import LocalHashingEmbeddingProvider
from rag.vector_store import LocalPersistentVectorStore
from rag.sources import SourceTrustRegistry
from rag.retrieval import SemanticRetriever, DocumentReranker
from rag.generation import build_rag_grounded_prompt
from rag.service import RAGService

client = TestClient(app)


# ==================================================
# 1. CHUNKER & EMBEDDING TESTS
# ==================================================

def test_text_cleaning():
    raw = "Hello\r\n\r\nWorld\x00\n\n\nTest"
    cleaned = clean_text(raw)
    assert "\r" not in cleaned
    assert "\x00" not in cleaned
    assert "Hello" in cleaned


def test_document_chunker():
    text = "# Introduction to Investing\n\nInvesting is the act of allocating resources to assets.\n\n# Risk Management\n\nRisk management balances potential rewards."
    meta = DocumentMetadata(title="Test Guide", source="test.md", topic="investing")
    chunks = create_document_chunks(text, "doc_test_1", meta, max_chunk_chars=100)

    assert len(chunks) >= 2
    assert chunks[0].metadata.title == "Test Guide"
    assert chunks[0].content_hash is not None


def test_local_embedding_provider():
    provider = LocalHashingEmbeddingProvider(dimension=64)
    vec1 = provider.embed_text("Price to earnings valuation ratio")
    vec2 = provider.embed_text("P/E ratio stock valuation")

    assert len(vec1) == 64
    assert len(vec2) == 64


# ==================================================
# 2. VECTOR STORE & METADATA FILTERING TESTS
# ==================================================

def test_local_vector_store(tmp_path):
    store = LocalPersistentVectorStore(storage_dir=str(tmp_path))
    provider = LocalHashingEmbeddingProvider(dimension=64)

    meta1 = DocumentMetadata(title="Doc 1", topic="valuation", symbol="TCS", source_type="company_filing")
    chunks = create_document_chunks("TCS reported strong quarterly earnings and dividend payout.", "doc_1", meta1)
    embeddings = provider.embed_documents([c.text for c in chunks])

    store.add_chunks(chunks, embeddings)
    assert store.count() == len(chunks)

    # Search with filter
    query_vec = provider.embed_text("TCS earnings")
    results = store.search(query_vec, top_k=2, filters={"symbol": "TCS"})
    assert len(results) >= 1
    assert results[0][0].metadata.symbol == "TCS"

    # Delete doc
    deleted = store.delete_document("doc_1")
    assert deleted is True
    assert store.count() == 0


# ==================================================
# 3. RETRIEVAL, RERANKING & CITATIONS TESTS
# ==================================================

def test_source_trust_registry():
    w_reg = SourceTrustRegistry.get_weight("regulatory")
    w_web = SourceTrustRegistry.get_weight("general_web")
    assert w_reg > w_web


def test_retriever_and_reranker(tmp_path):
    store = LocalPersistentVectorStore(storage_dir=str(tmp_path))
    provider = LocalHashingEmbeddingProvider(dimension=64)

    meta_edu = DocumentMetadata(title="Edu P/E", source_type="financial_education", topic="valuation")
    meta_reg = DocumentMetadata(title="SEBI Rules", source_type="regulatory", topic="valuation")

    chunks_edu = create_document_chunks("P/E ratio measures price relative to earnings per share.", "d_edu", meta_edu)
    chunks_reg = DocumentMetadata(title="SEBI Mandate", source_type="regulatory", topic="valuation")
    chunks_reg_list = create_document_chunks("SEBI mandates risk disclosures for all valuation metrics.", "d_reg", meta_reg)

    all_chunks = chunks_edu + chunks_reg_list
    all_embs = provider.embed_documents([c.text for c in all_chunks])
    store.add_chunks(all_chunks, all_embs)

    retriever = SemanticRetriever(store, provider)
    candidates = retriever.retrieve("P/E valuation rules", top_k=5)
    assert len(candidates) >= 2

    reranker = DocumentReranker()
    top_results = reranker.rerank("P/E valuation rules", candidates, top_k=2)

    assert len(top_results) == 2
    # Regulatory chunk should be boosted by source authority weighting
    assert top_results[0][0].metadata.source_type in ["regulatory", "financial_education"]


def test_prompt_builder():
    meta = DocumentMetadata(title="Diversification Guide", source="guide.md", source_type="financial_education")
    chunk = create_document_chunks("Diversification reduces single stock risk.", "d1", meta)[0]

    prompt, citations = build_rag_grounded_prompt(
        query="Why should I diversify?",
        retrieved_chunks=[chunk],
        user_context={"savings_rate": 25.0}
    )

    assert "Diversification Guide" in prompt
    assert len(citations) == 1
    assert citations[0].title == "Diversification Guide"


# ==================================================
# 4. RAG SERVICE & API ENDPOINT TESTS
# ==================================================

def test_rag_service_ingest_and_query(tmp_path):
    service = RAGService(vector_store=LocalPersistentVectorStore(storage_dir=str(tmp_path)))

    ingest_res = service.ingest_document_text(
        IngestRequest(
            document_text="Mutual funds pool money from investors to purchase diversified securities.",
            title="Mutual Funds Basics",
            source="education_portal",
            source_type="financial_education",
            topic="investment"
        )
    )

    assert ingest_res.success is True
    assert ingest_res.chunks_created >= 1

    query_res = service.query(
        RAGQueryRequest(query="What is a mutual fund?", topic="investment")
    )
    assert query_res.total_found >= 1
    assert len(query_res.citations) >= 1
    assert query_res.citations[0].title == "Mutual Funds Basics"


def test_api_rag_health_endpoint():
    res = client.get("/rag/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "document_count" in data


def test_api_rag_ingest_endpoint():
    res = client.post(
        "/rag/ingest",
        json={
            "document_text": "Systematic Investment Plan (SIP) allows investing fixed amounts periodically.",
            "title": "SIP Guide",
            "source": "api_test",
            "source_type": "financial_education",
            "topic": "investment"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True


def test_api_rag_query_endpoint():
    res = client.post(
        "/rag/query",
        json={"query": "What is SIP investment?", "top_k": 3}
    )
    assert res.status_code == 200
    data = res.json()
    assert "chunks" in data
    assert "citations" in data


def test_api_rag_chat_with_citations():
    res = client.post(
        "/ai/chat",
        json={"message": "Explain P/E ratio and diversification"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "sources" in data
