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
You are the AI Financial Intelligence Engine & Money Mentor for FinMitra.
Answer the user's inquiry using strictly the retrieved knowledge and structured context below.

STRICT GROUNDING & ANTI-HALLUCINATION RULES:
1. Use ONLY the supplied numerical prediction values and facts below.
2. Do NOT invent stock prices, future returns, news, or financial metrics.
3. Do NOT guarantee future investment returns or make certain market claims.
4. Clearly cite sources using [Source N] tags when referencing retrieved knowledge.
5. If retrieved documents are insufficient, explicitly state that limited information was found.

---
USER FINANCIAL SUMMARY:
{safe_json_dumps(user_context, indent=2)}

ML PREDICTION / SCORING:
{safe_json_dumps(ml_prediction, indent=2)}

RETRIEVED KNOWLEDGE BASE:
{docs_text}

USER INQUIRY:
{query}
"""
    return prompt, citations

