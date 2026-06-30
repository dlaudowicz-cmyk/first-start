"""Configuration: paths, model, and prompts for Friday."""

import os

# Where conversation memory is persisted across sessions.
MEMORY_FILE = os.path.expanduser(
    os.environ.get("FRIDAY_MEMORY_FILE", "~/.friday_memory.json")
)

# Model used for completions. Override with FRIDAY_MODEL.
MODEL = os.environ.get("FRIDAY_MODEL", "claude-opus-4-7")

# Maximum tokens per response.
MAX_TOKENS = int(os.environ.get("FRIDAY_MAX_TOKENS", "4096"))

SYSTEM_PROMPT = """You are Friday, a helpful personal AI assistant. You are direct, knowledgeable, and concise.
You remember everything said across all conversations and use it to give better answers over time."""

COMMANDS = """\
Commands:
  /forget   — clear all memory and start fresh
  /memory   — show how many messages are stored
  quit      — exit"""
