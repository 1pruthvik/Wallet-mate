import os
import re
from pathlib import Path
from typing import Optional


def load_raw_document(file_path: str | Path) -> tuple[str, str]:
    """
    Load raw document text and format type from file path.
    Supports TXT, Markdown (.md), HTML (.html/.htm), and PDF (.pdf).
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Document file not found: {file_path}")

    ext = path.suffix.lower()

    if ext in [".txt", ".md", ".markdown"]:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        format_type = "markdown" if ext in [".md", ".markdown"] else "txt"
        return clean_text(text), format_type

    elif ext in [".html", ".htm"]:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            raw_html = f.read()
        # Remove script/style tags & strip basic tags
        text = re.sub(r"<(script|style).*?>.*?</\1>", "", raw_html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        return clean_text(text), "html"

    elif ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(str(path))
            pages = [page.extract_text() or "" for page in reader.pages]
            text = "\n\n".join(pages)
            return clean_text(text), "pdf"
        except Exception:
            # Fallback simple text read if pypdf is unavailable
            with open(path, "rb") as f:
                content = f.read().decode("ascii", errors="ignore")
            return clean_text(content), "pdf"

    else:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        return clean_text(text), "txt"


def clean_text(text: str) -> str:
    """
    Normalize whitespace, line endings, and null bytes.
    """
    text = text.replace("\x00", "")
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
