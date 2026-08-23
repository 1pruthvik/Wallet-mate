import re
import hashlib
from typing import Optional

from rag.models import DocumentChunk, DocumentMetadata


def create_document_chunks(
    text: str,
    document_id: str,
    base_metadata: DocumentMetadata,
    max_chunk_chars: int = 600,
    overlap_chars: int = 100
) -> list[DocumentChunk]:
    """
    Split text into structural, paragraph/section-aware chunks with metadata and content hashing.
    Preserves section titles and headings.
    """
    paragraphs = re.split(r"\n\n+", text)
    chunks = []
    current_chunk = ""
    current_section = base_metadata.section or "General"
    chunk_index = 0

    for para in paragraphs:
        para_stripped = para.strip()
        if not para_stripped:
            continue

        # Check if paragraph is a heading (e.g. # Heading or SECTION:)
        if para_stripped.startswith("#") or para_stripped.isupper() and len(para_stripped) < 60:
            current_section = para_stripped.lstrip("#").strip()

        if len(current_chunk) + len(para_stripped) > max_chunk_chars and len(current_chunk) > 50:
            # Emit chunk
            chunk_id = f"{document_id}_chunk_{chunk_index}"
            chunk_hash = hashlib.md5(f"{document_id}_{current_chunk}".encode("utf-8")).hexdigest()

            meta = base_metadata.model_copy()
            meta.section = current_section

            chunks.append(
                DocumentChunk(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    text=current_chunk.strip(),
                    metadata=meta,
                    content_hash=chunk_hash
                )
            )

            chunk_index += 1
            # Keep overlap
            overlap = current_chunk[-overlap_chars:] if len(current_chunk) > overlap_chars else ""
            current_chunk = overlap + "\n\n" + para_stripped
        else:
            current_chunk = (current_chunk + "\n\n" + para_stripped).strip()

    if current_chunk.strip():
        chunk_id = f"{document_id}_chunk_{chunk_index}"
        chunk_hash = hashlib.md5(f"{document_id}_{current_chunk}".encode("utf-8")).hexdigest()
        meta = base_metadata.model_copy()
        meta.section = current_section

        chunks.append(
            DocumentChunk(
                chunk_id=chunk_id,
                document_id=document_id,
                text=current_chunk.strip(),
                metadata=meta,
                content_hash=chunk_hash
            )
        )

    return chunks
