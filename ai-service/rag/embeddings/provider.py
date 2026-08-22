import re
import hashlib
import numpy as np
from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """
    Abstract Interface for RAG Embedding Models.
    Pluggable for SentenceTransformers, BGE, OpenAI, or Local Hashing.
    """

    @abstractmethod
    def embed_text(self, text: str) -> list[float]:
        pass

    @abstractmethod
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        pass


class LocalHashingEmbeddingProvider(EmbeddingProvider):
    """
    Zero-dependency, fast, deterministic local hashing embedding provider.
    Requires no internet connection or PyTorch. Normalized 64-dimensional feature vector.
    """

    def __init__(self, dimension: int = 64):
        self.dimension = dimension

    def _tokenize(self, text: str) -> list[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = cleaned.split()
        # Add character 3-grams for financial term matching
        ngrams = [cleaned[i:i+3] for i in range(len(cleaned)-2)]
        return tokens + ngrams

    def embed_text(self, text: str) -> list[float]:
        tokens = self._tokenize(text)
        vec = np.zeros(self.dimension, dtype=np.float32)

        if not tokens:
            return vec.tolist()

        for token in tokens:
            # Deterministic hash to bucket
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            val = 1.0 if (h % 2 == 0) else -1.0
            vec[idx] += val

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm

        return vec.tolist()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self.embed_text(t) for t in texts]
