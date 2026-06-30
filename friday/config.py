"""Configuration: paths, model, and prompts for Friday."""

import os

# Where conversation memory is persisted across sessions.
MEMORY_FILE = os.path.expanduser(
    os.environ.get("FRIDAY_MEMORY_FILE", "~/.friday_memory.json")
)

# Which backend to use: "anthropic" (default) or "ollama" (local, no key).
PROVIDER = os.environ.get("FRIDAY_PROVIDER", "anthropic").lower()

# Model used for completions. Override with FRIDAY_MODEL.
MODEL = os.environ.get("FRIDAY_MODEL", "claude-opus-4-8")

# Maximum tokens per response.
MAX_TOKENS = int(os.environ.get("FRIDAY_MAX_TOKENS", "4096"))

# Ollama settings (only used when PROVIDER == "ollama").
OLLAMA_HOST = os.environ.get("FRIDAY_OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("FRIDAY_OLLAMA_MODEL", "llama3.1")

SYSTEM_PROMPT = """You are Friday, a helpful personal AI assistant. You are direct, knowledgeable, and concise.
You remember everything said across all conversations and use it to give better answers over time."""

COMMANDS = """\
Commands:
  /forget   — clear all memory and start fresh
  /memory   — show how many messages are stored
  quit      — exit"""
