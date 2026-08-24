import json
from datetime import date, datetime
from typing import Optional, Any

from rag.models import DocumentChunk, SourceCitation


def safe_json_dumps(data: Optional[dict[str, Any]], indent: int = 2) -> str:
    """
    Safely serialize dictionary context to JSON for prompt construction.
    Converts datetime/date objects to ISO-8601 strings and handles numpy or non-standard types.
    """
    if not data:
        return "{}"

    def default_serializer(obj: Any) -> Any:
        if isinstance(obj, (datetime, date)) or hasattr(obj, "isoformat"):
            return obj.isoformat()
        if hasattr(obj, "item"):
            return obj.item()
        return str(obj)

    return json.dumps(data, indent=indent, default=default_serializer)


def build_rag_grounded_prompt(
    query: str,
    retrieved_chunks: list[DocumentChunk],
    user_context: Optional[dict] = None,
    ml_prediction: Optional[dict] = None
) -> tuple[str, list[SourceCitation]]:
    """
    Construct a grounded, anti-hallucination prompt for Gemini AI combining:
    1. User Financial Summary
    2. ML Model Output
    3. Retrieved Knowledge Base Context
    Returns the prompt string and list of SourceCitations.
    """
    citations = []
    formatted_docs = []

    for idx, chunk in enumerate(retrieved_chunks, 1):
        meta = chunk.metadata
        cit = SourceCitation(
            title=meta.title,
            source=meta.source,
            document_id=chunk.document_id,
            source_type=meta.source_type,
            page_number=meta.page_number,
            topic=meta.topic
        )
        citations.append(cit)

        doc_str = (
            f"[Source {idx}]: {meta.title} (Type: {meta.source_type}, Source: {meta.source})\n"
            f"{chunk.text}"
        )
        formatted_docs.append(doc_str)

    docs_text = "\n\n".join(formatted_docs) if formatted_docs else "No relevant documents retrieved."

    prompt = f"""
You are FinMitra AI, an intelligent, conversational financial advisor, wealth coach, and personal money mentor powered by Google Gemini.
You have comprehensive expertise in personal finance, mutual funds, SIPs, stock market investing, trading strategies, budgeting (50/30/20 rule), emergency funds, tax saving, retirement planning, debt management, and general economics.

Answer the user's inquiry thoroughly, accurately, and naturally.

GUIDELINES:
1. Answer ANY user prompt directly, clearly, and comprehensively with practical examples and structure (use clean markdown, bullet points, and steps).
2. If USER FINANCIAL SUMMARY is provided with real cashflow numbers (income, expenses, savings rate, health score), personalize your recommendations directly to their exact financial situation.
3. If relevant RETRIEVED KNOWLEDGE is provided below, incorporate it seamlessly. If none or limited documents are retrieved, use your extensive general financial and life knowledge to answer the question completely and helpfuly. Never refuse to answer due to missing retrieved documents.
4. Maintain a supportive, empowering, and professional tone.
5. MARKET DATA RULE: When answering market-data questions, never invent a current market price. Use the provided market-data tool. If the tool returns STALE, DELAYED, HISTORICAL, or UNAVAILABLE data, clearly state that status. If tool says LIVE, state 'Latest live quote...'. If DELAYED, state 'Latest available delayed quote...'. If UNAVAILABLE, state 'Live market data is currently unavailable.' Never pretend delayed/cached data is LIVE.

---
USER FINANCIAL PROFILE & CASHFLOW CONTEXT:
{safe_json_dumps(user_context, indent=2)}

ML QUANT / PREDICTION CONTEXT:
{safe_json_dumps(ml_prediction, indent=2)}

REFERENCE KNOWLEDGE CONTEXT:
{docs_text}

USER INQUIRY:
{query}
"""
    return prompt, citations

