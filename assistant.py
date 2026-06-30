#!/usr/bin/env python3
"""Friday — a personal AI assistant powered by Claude with two-tier memory.

Working memory: the recent turns of the current conversation (JSON buffer).
Knowledge vault: durable facts distilled into Obsidian-format Markdown notes,
retrieved on demand so Friday's memory grows without re-sending every old turn.
"""

import json
import os
import re
from datetime import datetime

import anthropic

import vault

client = anthropic.Anthropic()

MODEL = "claude-opus-4-7"
MEMORY_FILE = os.path.expanduser("~/.assistant_memory.json")

# How many recent messages to keep in the API context. Older history lives in
# the knowledge vault instead of being replayed verbatim every turn.
WORKING_WINDOW = 12

SYSTEM_PROMPT = """You are Friday, a helpful personal AI assistant. You are direct, knowledgeable, and concise.
You keep durable facts in a knowledge vault and recall the relevant ones to give better answers over time."""

COMMANDS = """\
Commands:
  /remember        — distill durable facts from this session into the vault
  /recall <query>  — show vault notes matching a query
  /notes           — list everything in the vault
  /forget          — clear working memory (the vault is kept)
  /memory          — show how many messages are buffered
  quit             — exit"""

EXTRACT_PROMPT = """You maintain Friday's long-term knowledge vault.

Read the conversation below and extract only durable facts worth remembering \
across future sessions — stable preferences, personal details, ongoing projects, \
decisions, commitments. Skip small talk and anything ephemeral.

Output one block per note, using this EXACT format and nothing else:

<note title="Short Descriptive Title" tags="tag1, tag2">
Markdown body. Use [[Wikilinks]] to connect related note titles.
</note>

If there is nothing worth remembering, output exactly: NOTHING"""

_NOTE_RE = re.compile(
    r'<note\s+title="(?P<title>[^"]+)"(?:\s+tags="(?P<tags>[^"]*)")?\s*>'
    r"(?P<body>.*?)</note>",
    re.DOTALL,
)


def load_memory() -> list:
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_memory(messages: list) -> None:
    with open(MEMORY_FILE, "w") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)


def forget_memory() -> None:
    if os.path.exists(MEMORY_FILE):
        os.remove(MEMORY_FILE)


def _transcript(messages: list) -> str:
    return "\n\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)


def remember(messages: list) -> int:
    """Distill the conversation into vault notes. Returns the number saved."""
    if not messages:
        return 0

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=EXTRACT_PROMPT,
        messages=[{"role": "user", "content": _transcript(messages)}],
    )
    text = "".join(block.text for block in response.content if block.type == "text")

    saved = 0
    for match in _NOTE_RE.finditer(text):
        tags = [t.strip() for t in (match.group("tags") or "").split(",") if t.strip()]
        vault.save_note(match.group("title").strip(), match.group("body"), tags)
        saved += 1
    return saved


def chat():
    messages = load_memory()
    count = len(messages) // 2
    if count:
        print(f"Working memory: {count} recent exchange{'s' if count != 1 else ''} buffered.")
    else:
        print("Starting fresh — no working memory found.")
    note_count = len(vault.list_notes())
    if note_count:
        print(f"Knowledge vault: {note_count} note{'s' if note_count != 1 else ''} at {vault.VAULT_DIR}")
    print(COMMANDS)
    print()

    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            _shutdown(messages)
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "bye"):
            _shutdown(messages)
            break

        if user_input.lower() == "/forget":
            forget_memory()
            messages = []
            print("Working memory cleared. (Vault kept.)\n")
            continue

        if user_input.lower() == "/memory":
            exchanges = len(messages) // 2
            print(f"Buffered: {exchanges} exchange{'s' if exchanges != 1 else ''} ({len(messages)} messages)\n")
            continue

        if user_input.lower() == "/notes":
            notes = vault.list_notes()
            if notes:
                for path in notes:
                    print(f"  - {os.path.basename(path)}")
            else:
                print("  (vault is empty)")
            print()
            continue

        if user_input.lower() == "/remember":
            saved = remember(messages)
            print(f"Saved {saved} note{'s' if saved != 1 else ''} to the vault.\n")
            continue

        if user_input.lower().startswith("/recall"):
            query = user_input[len("/recall"):].strip()
            hits = vault.retrieve_context(query) if query else ""
            print(hits if hits else "  (no matching notes)")
            print()
            continue

        messages.append({"role": "user", "content": user_input})

        recalled = vault.retrieve_context(user_input)
        system = SYSTEM_PROMPT
        if recalled:
            system = f"{SYSTEM_PROMPT}\n\nRelevant notes from your knowledge vault:\n\n{recalled}"

        print("Assistant: ", end="", flush=True)
        response_text = ""

        with client.messages.stream(
            model=MODEL,
            max_tokens=4096,
            thinking={"type": "adaptive"},
            system=system,
            messages=messages[-WORKING_WINDOW:],
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
                response_text += text

        print()
        messages.append({"role": "assistant", "content": response_text})
        save_memory(messages)


def _shutdown(messages: list) -> None:
    save_memory(messages)
    saved = remember(messages)
    if saved:
        print(f"\nMemory saved. Distilled {saved} note{'s' if saved != 1 else ''} into the vault. Goodbye!")
    else:
        print("\nMemory saved. Goodbye!")


if __name__ == "__main__":
    chat()
