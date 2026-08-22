import os
import json
import logging
from typing import Optional, Any

from ai.base import AIProvider
from ai.mock_provider import MockAIProvider
from rag.models import DocumentChunk, SourceCitation
from rag.generation import build_rag_grounded_prompt

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    """
    Google Gemini Generative AI Provider with RAG Grounded Context & Citation support.
    Uses environment variable GEMINI_API_KEY for authorization.
    Falls back gracefully to MockAIProvider if key is unconfigured or call fails.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self._fallback = MockAIProvider()
        self._client = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel("gemini-1.5-flash")
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI SDK ({e}). Will fallback to MockAIProvider.")

    def generate_explanation(
        self,
        user_profile: Optional[dict] = None,
        market_prediction: Optional[dict] = None,
        investment_score: Optional[dict] = None,
        question: Optional[str] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        if not self.api_key or not self._client:
            return self._fallback.generate_explanation(
                user_profile, market_prediction, investment_score, question, rag_chunks
            )

        prompt, citations = build_rag_grounded_prompt(
            query=question or "Explain this investment candidate",
            retrieved_chunks=rag_chunks or [],
            user_context=user_profile,
            ml_prediction=market_prediction
        )

        try:
            response = self._client.generate_content(prompt)
            text = response.text.strip()

            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            parsed = json.loads(text)
            parsed["sources"] = [c.model_dump() for c in citations]
            return parsed
        except Exception as e:
            logger.warning(f"Gemini API call failed ({e}), using MockAIProvider fallback.")
            return self._fallback.generate_explanation(
                user_profile, market_prediction, investment_score, question, rag_chunks
            )

    def chat(
        self,
        message: str,
        financial_context: Optional[dict] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        if not self.api_key or not self._client:
            return self._fallback.chat(message, financial_context, rag_chunks)

        prompt, citations = build_rag_grounded_prompt(
            query=message,
            retrieved_chunks=rag_chunks or [],
            user_context=financial_context
        )

        try:
            response = self._client.generate_content(prompt)
            return {
                "answer": response.text.strip(),
                "sources": [c.model_dump() for c in citations],
                "confidence_note": "Response grounded in retrieved financial knowledge base.",
                "disclaimer": (
                    "FinMitra Investment Intelligence provides probabilistic research insights. "
                    "It does not guarantee future financial returns or execute automatic trades."
                )
            }
        except Exception as e:
            logger.warning(f"Gemini Chat call failed ({e}), using MockAIProvider fallback.")
            return self._fallback.chat(message, financial_context, rag_chunks)
