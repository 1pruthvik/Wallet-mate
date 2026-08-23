import re
from typing import Optional

from rag.models import DocumentChunk
from rag.embeddings.provider import EmbeddingProvider
from rag.vector_store.base import VectorStore


class SemanticRetriever:
    """
    Hybrid semantic and keyword-aware document retriever.
    """

    def __init__(
        self,
        vector_store: VectorStore,
        embedding_provider: EmbeddingProvider
    ):
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[dict] = None
    ) -> list[tuple[DocumentChunk, float]]:
        if not query or not query.strip():
            return []

        query_vector = self.embedding_provider.embed_text(query)
        candidates = self.vector_store.search(
            query_embedding=query_vector,
            top_k=top_k * 3,  # Retrieve expanded candidate set for reranking
            filters=filters
        )

        # Keyword matching boost for company symbols, terms, and exact phrases
        query_words = set(re.findall(r"\w+", query.lower()))
        boosted_candidates = []

        for chunk, sim in candidates:
            score = sim
            text_words = set(re.findall(r"\w+", chunk.text.lower()))

            # Keyword overlap boost
            overlap = query_words.intersection(text_words)
            if overlap:
                score += 0.05 * len(overlap)

            # Symbol match boost
            if filters and "symbol" in filters and filters["symbol"]:
                sym = str(filters["symbol"]).lower()
                if sym in chunk.text.lower() or (chunk.metadata.symbol and chunk.metadata.symbol.lower() == sym):
                    score += 0.20

            boosted_candidates.append((chunk, score))

        boosted_candidates.sort(key=lambda x: x[1], reverse=True)
        return boosted_candidates[:top_k]
