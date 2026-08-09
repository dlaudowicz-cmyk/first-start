#!/usr/bin/env python3
"""Personal AI assistant powered by Claude with infinite memory."""

import anthropic
import json
import os
from datetime import datetime
from pathlib import Path

client = anthropic.Anthropic()

MEMORY_FILE = os.path.expanduser("~/.assistant_memory.json")

MODEL = "claude-opus-5"
# Thinking and response text share this budget, so leave room for both.
MAX_TOKENS = 16000
EFFORT_LEVELS = ("low", "medium", "high", "xhigh", "max")

SYSTEM_PROMPT = """You are a helpful personal AI assistant. You are direct and knowledgeable.
You remember everything said across all conversations and use it to give better answers over time.

Keep responses focused, brief, and concise to avoid overwhelming the person. Disclaimers and caveats
are brief, with most of the response on the main answer; when asked to explain something, give a
high-level summary unless an in-depth one is specifically requested."""


# --- memory -----------------------------------------------------------------


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


# --- commands ---------------------------------------------------------------


class Session:
    def __init__(self):
        self.messages = load_memory()
        self.effort = "high"
        self.running = True


def cmd_help(session: Session, arg: str) -> None:
    print("Commands:")
    labels = {name: f"{name} {usage}".strip() for name, (_, usage, _) in COMMANDS.items()}
    width = max(len(label) for label in labels.values()) + 2
    for name, (_, _, description) in COMMANDS.items():
        print(f"  {labels[name]:<{width}} {description}")
    print(f"  {'quit':<{width}} exit (also: exit, bye)")
    print()


def cmd_memory(session: Session, arg: str) -> None:
    exchanges = len(session.messages) // 2
    plural = "s" if exchanges != 1 else ""
    print(f"Stored: {exchanges} exchange{plural} ({len(session.messages)} messages)\n")


def cmd_forget(session: Session, arg: str) -> None:
    forget_memory()
    session.messages = []
    print("Memory cleared.\n")


def cmd_effort(session: Session, arg: str) -> None:
    if not arg:
        print(f"Effort: {session.effort} (options: {', '.join(EFFORT_LEVELS)})\n")
        return
    if arg not in EFFORT_LEVELS:
        print(f"Unknown level '{arg}'. Options: {', '.join(EFFORT_LEVELS)}\n")
        return
    session.effort = arg
    print(f"Effort set to {arg}.\n")


def cmd_export(session: Session, arg: str) -> None:
    if not session.messages:
        print("Nothing to export.\n")
        return
    path = Path(arg or f"conversation-{datetime.now():%Y%m%d-%H%M%S}.md")
    with open(path, "w") as f:
        f.write(f"# Conversation — {datetime.now():%Y-%m-%d %H:%M}\n\n")
        for message in session.messages:
            speaker = "You" if message["role"] == "user" else "Assistant"
            f.write(f"**{speaker}:** {message['content']}\n\n")
    print(f"Exported {len(session.messages)} messages to {path}\n")


def cmd_quit(session: Session, arg: str) -> None:
    session.running = False


COMMANDS = {
    "/help": (cmd_help, "", "list these commands"),
    "/memory": (cmd_memory, "", "show how many messages are stored"),
    "/forget": (cmd_forget, "", "clear all memory and start fresh"),
    "/effort": (cmd_effort, "[level]", "set reasoning effort for replies"),
    "/export": (cmd_export, "[file]", "write this conversation to a markdown file"),
    "/quit": (cmd_quit, "", "exit"),
}


def handle_command(session: Session, user_input: str) -> bool:
    """Run a slash command. Returns True if the input was a command."""
    name, _, arg = user_input.partition(" ")
    name = name.lower()
    if name not in COMMANDS:
        if name.startswith("/"):
            print(f"Unknown command '{name}'. Try /help\n")
            return True
        return False
    COMMANDS[name][0](session, arg.strip())
    return True


# --- chat loop --------------------------------------------------------------


def chat():
    session = Session()

    count = len(session.messages) // 2
    if count:
        print(f"Memory loaded: {count} previous exchange{'s' if count != 1 else ''} remembered.")
    else:
        print("Starting fresh — no previous memory found.")
    print("Type /help for commands.")
    print()

    while session.running:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print()
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "bye"):
            break

        if handle_command(session, user_input):
            continue

        session.messages.append({"role": "user", "content": user_input})

        print("Assistant: ", end="", flush=True)
        response_text = ""

        with client.beta.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            # Claude Opus 5's safety classifiers can decline a request. "default" lets the
            # API re-run it server-side on Anthropic's recommended fallback model.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            thinking={"type": "adaptive"},
            output_config={"effort": session.effort},
            system=SYSTEM_PROMPT,
            messages=session.messages,
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
                response_text += text
            final = stream.get_final_message()

        print()

        if final.stop_reason == "refusal":
            category = getattr(final.stop_details, "category", None) or "unspecified"
            print(
                f"[Declined by the safety classifiers ({category}). Anything printed above is a "
                f"partial response and was discarded, along with your message, so the rest of "
                f"the conversation stays usable.]\n"
            )
            session.messages.pop()
            continue

        if final.stop_reason == "max_tokens":
            print(f"[Truncated at the {MAX_TOKENS}-token limit — ask to continue.]\n")

        session.messages.append({"role": "assistant", "content": response_text})
        save_memory(session.messages)

    save_memory(session.messages)
    print("Memory saved. Goodbye!")


if __name__ == "__main__":
    chat()
