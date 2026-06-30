#!/usr/bin/env python3
"""Obsidian-format knowledge vault: Friday's durable long-term memory.

Notes are plain Markdown files with YAML frontmatter, so the vault can be
opened directly in Obsidian (graph view, backlinks, search) or edited by hand.
Retrieval is simple keyword scoring — good enough to start, swappable for
embeddings later.
"""

import glob
import os
import re
from datetime import datetime

VAULT_DIR = os.path.expanduser("~/friday-vault")

# Words this short carry little signal for keyword retrieval.
_MIN_TERM_LEN = 3


def _slugify(title: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", title.lower()).strip()
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug or "note"


def ensure_vault() -> None:
    os.makedirs(VAULT_DIR, exist_ok=True)


def list_notes() -> list:
    return sorted(glob.glob(os.path.join(VAULT_DIR, "*.md")))


def save_note(title: str, body: str, tags=None) -> str:
    """Write (or overwrite) a note. Title determines the filename, so re-saving
    the same title updates that note in place rather than duplicating it."""
    ensure_vault()
    path = os.path.join(VAULT_DIR, f"{_slugify(title)}.md")
    updated = datetime.now().strftime("%Y-%m-%d %H:%M")
    tag_line = ", ".join(tags) if tags else ""

    front = [
        "---",
        f"title: {title}",
        f"tags: [{tag_line}]",
        f"updated: {updated}",
        "---",
        "",
        f"# {title}",
        "",
        body.strip(),
        "",
    ]
    with open(path, "w") as f:
        f.write("\n".join(front))
    return path


def read_note(path: str) -> str:
    with open(path, "r") as f:
        return f.read()


def search_notes(query: str, limit: int = 3) -> list:
    """Return paths of the notes most relevant to `query`, by keyword overlap."""
    terms = [t for t in re.findall(r"\w+", query.lower()) if len(t) >= _MIN_TERM_LEN]
    if not terms:
        return []

    scored = []
    for path in list_notes():
        text = read_note(path).lower()
        score = sum(text.count(term) for term in terms)
        if score:
            scored.append((score, path))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [path for _, path in scored[:limit]]


def retrieve_context(query: str, limit: int = 3) -> str:
    """Markdown bundle of the notes relevant to `query`, ready to drop into the
    system prompt. Empty string when nothing matches."""
    notes = search_notes(query, limit)
    if not notes:
        return ""
    return "\n\n".join(read_note(path).strip() for path in notes)
