#!/usr/bin/env python3
"""Personal AI assistant powered by Claude with infinite memory."""

import anthropic
import json
import os
from datetime import datetime

client = anthropic.Anthropic()

MEMORY_FILE = os.path.expanduser("~/.assistant_memory.json")

SYSTEM_PROMPT = """You are a helpful personal AI assistant. You are direct, knowledgeable, and concise.
You remember everything said across all conversations and use it to give better answers over time."""

COMMANDS = """\
Commands:
  /forget   — clear all memory and start fresh
  /memory   — show how many messages are stored
  quit      — exit"""


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


def chat():
    messages = load_memory()
    count = len(messages) // 2
    if count:
        print(f"Memory loaded: {count} previous exchange{'s' if count != 1 else ''} remembered.")
    else:
        print("Starting fresh — no previous memory found.")
    print(COMMANDS)
    print()

    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            save_memory(messages)
            print("\nMemory saved. Goodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "bye"):
            save_memory(messages)
            print("Memory saved. Goodbye!")
            break

        if user_input.lower() == "/forget":
            forget_memory()
            messages = []
            print("Memory cleared.\n")
            continue

        if user_input.lower() == "/memory":
            exchanges = len(messages) // 2
            print(f"Stored: {exchanges} exchange{'s' if exchanges != 1 else ''} ({len(messages)} messages)\n")
            continue

        messages.append({"role": "user", "content": user_input})

        print("Assistant: ", end="", flush=True)
        response_text = ""

        with client.messages.stream(
            model="claude-opus-4-7",
            max_tokens=4096,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
                response_text += text

        print()
        messages.append({"role": "assistant", "content": response_text})
        save_memory(messages)


if __name__ == "__main__":
    chat()
