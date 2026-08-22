from typing import Optional, Any

from ai.base import AIProvider
from rag.models import DocumentChunk, SourceCitation


class MockAIProvider(AIProvider):
    """
    Deterministic Mock AI Provider for testing and offline environments.
    Requires no API keys or internet connection.
    Supports RAG context grounding & source citation generation.
    """

    def generate_explanation(
        self,
        user_profile: Optional[dict] = None,
        market_prediction: Optional[dict] = None,
        investment_score: Optional[dict] = None,
        question: Optional[str] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        symbol = (market_prediction or {}).get("symbol", "the asset")
        score = (investment_score or {}).get("investment_score", "N/A")
        readiness = (user_profile or {}).get("investment_readiness", "READY")

        citations = []
        if rag_chunks:
            for chunk in rag_chunks:
                citations.append(
                    SourceCitation(
                        title=chunk.metadata.title,
                        source=chunk.metadata.source,
                        document_id=chunk.document_id,
                        source_type=chunk.metadata.source_type,
                        page_number=chunk.metadata.page_number,
                        topic=chunk.metadata.topic
                    ).model_dump()
                )

        return {
            "summary": f"FinMitra AI evaluated {symbol} with an Investment Score of {score}/100.",
            "why_it_matters": f"Your investment readiness status is currently '{readiness}'.",
            "key_factors": [
                "Quantitative ML time-series model prediction",
                "User financial capacity and investable surplus analysis",
                "Retrieved RAG knowledge base context"
            ],
            "risks": [
                "Market volatility and macroeconomic shifts",
                "Model confidence is probabilistic and non-guaranteed"
            ],
            "uncertainty": "Predictions carry inherent market uncertainty and are for research purposes.",
            "educational_note": "Diversifying across asset classes mitigates single-stock market risk.",
            "sources": citations
        }

    def chat(
        self,
        message: str,
        financial_context: Optional[dict] = None,
        rag_chunks: Optional[list[DocumentChunk]] = None
    ) -> dict[str, Any]:
        clean_msg = message.lower()
        citations = []

        if rag_chunks:
            for chunk in rag_chunks:
                citations.append(
                    SourceCitation(
                        title=chunk.metadata.title,
                        source=chunk.metadata.source,
                        document_id=chunk.document_id,
                        source_type=chunk.metadata.source_type,
                        page_number=chunk.metadata.page_number,
                        topic=chunk.metadata.topic
                    ).model_dump()
                )

        if "budget" in clean_msg or "spending" in clean_msg:
            answer = "Based on your financial report, monitoring recurring subscriptions and keeping spending within budget limits protects your investable surplus."
        elif "invest" in clean_msg or "stock" in clean_msg:
            answer = "FinMitra recommends evaluating investment candidates against your personal risk profile and ensuring an emergency reserve before committing funds."
        else:
            answer = f"FinMitra AI Money Mentor is ready to help you analyze your financial health, spending patterns, and risk-aware investment opportunities."

        return {
            "answer": answer,
            "sources": citations,
            "confidence_note": "Grounding response strictly in verified financial knowledge base.",
            "disclaimer": (
                "FinMitra Investment Intelligence provides probabilistic research insights. "
                "It does not guarantee future financial returns or execute automatic trades."
            )
        }
