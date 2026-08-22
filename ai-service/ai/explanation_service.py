from typing import Optional, Any

from ai.base import AIProvider
from ai.mock_provider import MockAIProvider
from ai.gemini_provider import GeminiProvider
from rag.models import DocumentChunk


class AIExplanationService:
    """
    Service for generating structured AI explanations and handling financial chat with RAG context.
    Uses GeminiProvider when configured, otherwise defaults seamlessly to MockAIProvider.
    """

    def __init__(self, provider: Optional[AIProvider] = None):
        if provider:
            self.provider = provider
        else:
            self.provider = GeminiProvider()

    def explain_investment_candidate(
        self,
        user_profile: Optional[dict] = None,
        market_prediction: Optional[dict] = None,
        investment_score: Optional[dict] = None,
        question: Optional[str] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        return self.provider.generate_explanation(
            user_profile=user_profile,
            market_prediction=market_prediction,
            investment_score=investment_score,
            question=question,
            rag_chunks=rag_chunks
        )

    def answer_financial_chat(
        self,
        message: str,
        financial_context: Optional[dict] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        return self.provider.chat(
            message=message,
            financial_context=financial_context,
            rag_chunks=rag_chunks
        )
