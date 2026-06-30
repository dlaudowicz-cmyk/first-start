"""Interactive chat loop for Friday."""

import os
import sys

from .client import stream_reply
from .config import COMMANDS
from .memory import forget_memory, load_memory, save_memory


def _check_credentials() -> None:
    """Exit early with a helpful message if no Anthropic auth is configured."""
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return
    print(
        "Error: no Anthropic credentials found.\n"
        "Set your API key before running Friday, e.g.:\n\n"
        "    export ANTHROPIC_API_KEY=sk-ant-...\n\n"
        "Get a key at https://console.anthropic.com/settings/keys",
        file=sys.stderr,
    )
    raise SystemExit(1)


def chat() -> None:
    _check_credentials()
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

        print("Friday: ", end="", flush=True)
        response_text = stream_reply(messages)

        print()
        messages.append({"role": "assistant", "content": response_text})
        save_memory(messages)
