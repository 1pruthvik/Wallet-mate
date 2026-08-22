from abc import ABC, abstractmethod
from typing import Optional

from rag.models import DocumentChunk


class VectorStore(ABC):
    """
    Abstract Vector Store Interface.
    Pluggable for ChromaDB, Pinecone, Weaviate, Qdrant, pgvector, or Local Store.
    """

    @abstractmethod
    def add_chunks(
        self,
        chunks: list[DocumentChunk],
        embeddings: list[list[float]]
    ) -> int:
        pass

    @abstractmethod
    def delete_document(self, document_id: str) -> bool:
        pass

    @abstractmethod
    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
        filters: Optional[dict] = None
    ) -> list[tuple[DocumentChunk, float]]:
        pass

    @abstractmethod
    def count(self) -> int:
        pass

    @abstractmethod
    def persist(self) -> None:
        pass
