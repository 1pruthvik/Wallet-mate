import os
import json
import logging
from typing import Optional, Any

from ai.base import AIProvider
from ai.mock_provider import MockAIProvider
from rag.models import DocumentChunk, SourceCitation
from rag.generation.prompt_builder import build_rag_grounded_prompt

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    """
    Google Gemini Generative AI Provider using official google-genai SDK.
    Uses environment variable GEMINI_API_KEY for authorization.
    Target model: gemini-3.6-flash.
    Falls back gracefully to MockAIProvider if key is missing or call fails.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        self._fallback = MockAIProvider()
        self._client = None

        try:
            from google import genai
            if self.api_key:
                self._client = genai.Client(api_key=self.api_key)
            else:
                try:
                    self._client = genai.Client()
                    self.api_key = os.getenv("GEMINI_API_KEY")
                except Exception as e_cfg:
                    logger.warning("Configuration Error: GEMINI_API_KEY is not configured in environment.")
                    self._client = None
        except Exception as e_init:
            logger.warning(self._sanitize_log_message(f"Could not initialize Google GenAI SDK: {str(e_init)}"))
            self._client = None

    def _sanitize_log_message(self, msg: str) -> str:
        """Strip any sensitive API key references from log outputs and exception messages."""
        if self.api_key and isinstance(self.api_key, str) and len(self.api_key) > 4:
            msg = msg.replace(self.api_key, "[REDACTED_API_KEY]")
        return msg

    def _generate_text(self, prompt: str) -> str:
        """
        Internal text generation using google-genai Client.
        Does not expose API keys in exceptions or logs.
        Handles rate limits (429), server errors (5xx/503), client errors (4xx), and network failures.
        """
        if not self._client:
            raise RuntimeError("Configuration Error: Gemini client is not initialized or GEMINI_API_KEY is missing.")

        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            if response and hasattr(response, "text") and response.text:
                return response.text.strip()
            return ""
        except Exception as e:
            err_msg = str(e)
            sanitized_err = self._sanitize_log_message(err_msg)
            
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                logger.warning(f"Gemini API rate limit exceeded (429): {sanitized_err}")
            elif "503" in err_msg or "500" in err_msg or "UNAVAILABLE" in err_msg:
                logger.warning(f"Gemini service temporarily unavailable (5xx/503): {sanitized_err}")
            elif "400" in err_msg or "403" in err_msg or "INVALID_ARGUMENT" in err_msg:
                logger.warning(f"Gemini client API error (4xx): {sanitized_err}")
            else:
                logger.warning(f"Gemini network or service error: {sanitized_err}")
            
            raise RuntimeError(f"Gemini API generation failed: {sanitized_err}") from e

    def generate_explanation(
        self,
        user_profile: Optional[dict] = None,
        market_prediction: Optional[dict] = None,
        investment_score: Optional[dict] = None,
        question: Optional[str] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        if not self.api_key or not self._client:
            logger.info("Missing GEMINI_API_KEY or uninitialized client; serving fallback explanation.")
            return self._fallback.generate_explanation(
                user_profile, market_prediction, investment_score, question, rag_chunks
            )

        prompt, citations = build_rag_grounded_prompt(
            query=question or "Explain this investment candidate based on quantitative scores.",
            retrieved_chunks=rag_chunks or [],
            user_context=user_profile,
            ml_prediction=market_prediction
        )

        try:
            text = self._generate_text(prompt)

            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            try:
                parsed = json.loads(text)
                if isinstance(parsed, dict):
                    parsed["sources"] = [c.model_dump() for c in citations]
                    return parsed
            except Exception:
                pass

            symbol = (market_prediction or {}).get("symbol", "the asset")
            score = (investment_score or {}).get("investment_score", "N/A")
            return {
                "summary": text or f"FinMitra AI evaluated {symbol} with Investment Score {score}/100.",
                "why_it_matters": "Grounded explanation derived from market metrics and risk scoring engine.",
                "key_factors": [
                    "Quantitative ML market model output",
                    "User investment capacity and surplus analysis",
                    "Retrieved knowledge base documentation"
                ],
                "risks": [
                    "Market volatility and non-deterministic future returns"
                ],
                "uncertainty": "ML predictions are probabilistic indicators, not financial guarantees.",
                "educational_note": "Always maintain an emergency reserve prior to allocating investment funds.",
                "sources": [c.model_dump() for c in citations]
            }
        except Exception as e:
            logger.warning(f"Gemini explanation request failed cleanly ({type(e).__name__}); falling back to MockAIProvider.")
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
            logger.info("Missing GEMINI_API_KEY or uninitialized client; serving fallback chat response.")
            return self._fallback.chat(message, financial_context, rag_chunks)

        prompt, citations = build_rag_grounded_prompt(
            query=message,
            retrieved_chunks=rag_chunks or [],
            user_context=financial_context
        )

        try:
            answer = self._generate_text(prompt)
            return {
                "answer": answer,
                "sources": [c.model_dump() for c in citations],
                "confidence_note": "Response grounded in retrieved financial knowledge base.",
                "disclaimer": (
                    "FinMitra Investment Intelligence provides probabilistic research insights. "
                    "It does not guarantee future financial returns or execute automatic trades."
                )
            }
        except Exception as e:
            logger.warning(f"Gemini chat request failed cleanly ({type(e).__name__}); falling back to MockAIProvider.")
            return self._fallback.chat(message, financial_context, rag_chunks)

