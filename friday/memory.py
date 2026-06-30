"""Persistent conversation memory for Friday."""

import json
import os

from .config import MEMORY_FILE


def load_memory() -> list:
    """Return the stored message history, or an empty list if none exists."""
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_memory(messages: list) -> None:
    """Persist the message history to disk."""
    with open(MEMORY_FILE, "w") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)


def forget_memory() -> None:
    """Delete the stored memory file if it exists."""
    if os.path.exists(MEMORY_FILE):
        os.remove(MEMORY_FILE)
