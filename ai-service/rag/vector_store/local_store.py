import os
import json
import logging
import numpy as np
from pathlib import Path
from typing import Optional

from rag.models import DocumentChunk
from rag.vector_store.base import VectorStore

logger = logging.getLogger(__name__)


def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


class LocalPersistentVectorStore(VectorStore):
    """
    Lightweight, persistent, local JSON vector store.
    Supports cosine similarity, content hash deduplication, and strict metadata filtering.
    """

    def __init__(self, storage_dir: str = "./data/vectorstore"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.file_path = self.storage_dir / "chunks_db.json"

        self.chunks: dict[str, DocumentChunk] = {}
        self.embeddings: dict[str, list[float]] = {}
        self.hashes: set[str] = set()

        self._load()

    def _load(self):
        if not self.file_path.exists():
            return
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            for item in data.get("records", []):
                chunk = DocumentChunk.model_validate(item["chunk"])
                emb = item["embedding"]
                self.chunks[chunk.chunk_id] = chunk
                self.embeddings[chunk.chunk_id] = emb
                self.hashes.add(chunk.content_hash)
            logger.info(f"Loaded {len(self.chunks)} chunks into LocalPersistentVectorStore")
        except Exception as e:
            logger.warning(f"Could not load vector store file ({e}). Starting fresh.")

    def persist(self) -> None:
        records = []
        for cid, chunk in self.chunks.items():
            records.append({
                "chunk": chunk.model_dump(),
                "embedding": self.embeddings[cid]
            })
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump({"records": records}, f, indent=2)

    def add_chunks(
        self,
        chunks: list[DocumentChunk],
        embeddings: list[list[float]]
    ) -> int:
        added = 0
        for chunk, emb in zip(chunks, embeddings):
            if chunk.content_hash in self.hashes:
                continue
            self.chunks[chunk.chunk_id] = chunk
            self.embeddings[chunk.chunk_id] = emb
            self.hashes.add(chunk.content_hash)
            added += 1

        if added > 0:
            self.persist()
        return added

    def delete_document(self, document_id: str) -> bool:
        to_delete = [
            cid for cid, chunk in self.chunks.items()
            if chunk.document_id == document_id
        ]
        if not to_delete:
            return False

        for cid in to_delete:
            chunk = self.chunks.pop(cid)
            self.embeddings.pop(cid, None)
            self.hashes.discard(chunk.content_hash)

        self.persist()
        return True

    def _matches_filter(self, chunk: DocumentChunk, filters: Optional[dict]) -> bool:
        if not filters:
            return True

        meta = chunk.metadata
        for key, val in filters.items():
            if val is None:
                continue
            val_clean = str(val).upper().strip()

            if key == "topic" and meta.topic and str(meta.topic).upper() != val_clean:
                return False
            if key == "symbol" and meta.symbol and str(meta.symbol).upper() != val_clean:
                return False
            if key == "company" and meta.company and str(meta.company).upper() != val_clean:
                return False
            if key == "source_type" and meta.source_type and str(meta.source_type).upper() != val_clean:
                return False

        return True

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
        filters: Optional[dict] = None
    ) -> list[tuple[DocumentChunk, float]]:
        results = []

        for cid, chunk in self.chunks.items():
            if not self._matches_filter(chunk, filters):
                continue

            emb = self.embeddings[cid]
            sim = cosine_similarity(query_embedding, emb)
            results.append((chunk, sim))

        # Sort by similarity descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    def count(self) -> int:
        return len(self.chunks)
