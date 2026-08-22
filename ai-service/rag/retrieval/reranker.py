from rag.models import DocumentChunk
from rag.sources.registry import SourceTrustRegistry


class DocumentReranker:
    """
    Reranks initial retrieved chunks using similarity score combined with Source Trust Authority weights.
    """

    def rerank(
        self,
        query: str,
        candidates: list[tuple[DocumentChunk, float]],
        top_k: int = 3
    ) -> list[tuple[DocumentChunk, float]]:
        if not candidates:
            return []

        reranked = []
        for chunk, base_score in candidates:
            stype = chunk.metadata.source_type or "financial_education"
            weight = SourceTrustRegistry.get_weight(stype)

            # Combined rerank score = base_score * source_trust_weight
            final_score = round(base_score * weight, 4)
            reranked.append((chunk, final_score))

        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked[:top_k]
