from abc import ABC, abstractmethod
from typing import Optional, Any
from rag.models import DocumentChunk, SourceCitation


class AIProvider(ABC):
    """
    Abstract Interface for Generative AI Providers (Gemini / Mock).
    Supports RAG Grounded Context & Source Citations.
    """

    @abstractmethod
    def generate_explanation(
        self,
        user_profile: Optional[dict] = None,
        market_prediction: Optional[dict] = None,
        investment_score: Optional[dict] = None,
        question: Optional[str] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        pass

    @abstractmethod
    def chat(
        self,
        message: str,
        financial_context: Optional[dict] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        pass
