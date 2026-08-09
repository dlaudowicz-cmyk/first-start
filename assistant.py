#!/usr/bin/env python3
"""Personal AI assistant powered by Claude with infinite memory and a resource vault."""

import anthropic
import json
import os
from datetime import datetime
from pathlib import Path

client = anthropic.Anthropic()

MEMORY_FILE = os.path.expanduser("~/.assistant_memory.json")
VAULT_FILE = Path(__file__).resolve().parent / "vault.json"

MODEL = "claude-opus-4-7"
EFFORT_LEVELS = ("low", "medium", "high", "xhigh", "max")

BASE_SYSTEM_PROMPT = """You are a helpful personal AI assistant. You are direct, knowledgeable, and concise.
You remember everything said across all conversations and use it to give better answers over time."""

VAULT_PROMPT = """The user keeps a personal resource vault. These are the entries in it:

{index}

When a request matches one of these, name the entry and the category it lives in so the user can open it \
with /vault. Never invent vault entries or links that are not listed above."""


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


# --- vault ------------------------------------------------------------------


def load_vault() -> dict:
    try:
        with open(VAULT_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, IOError):
        return {"title": "Resource Vault", "categories": []}


def save_vault(vault: dict) -> None:
    with open(VAULT_FILE, "w") as f:
        json.dump(vault, f, indent=2, ensure_ascii=False)
        f.write("\n")


def vault_entries(vault: dict):
    """Yield (category_name, entry) for every entry in the vault."""
    for category in vault.get("categories", []):
        for entry in category.get("entries", []):
            yield category["name"], entry


def search_vault(vault: dict, query: str) -> list:
    words = query.lower().split()
    hits = []
    for category, entry in vault_entries(vault):
        haystack = " ".join(
            [
                entry.get("title", ""),
                entry.get("description", ""),
                entry.get("type", ""),
                entry.get("source", ""),
                category,
            ]
        ).lower()
        if all(word in haystack for word in words):
            hits.append((category, entry))
    return hits


def format_entry(category: str, entry: dict) -> str:
    location = entry.get("url") or f"{entry.get('source', 'no link recorded')} (link not recorded)"
    return (
        f"  {entry['title']}  [{entry.get('type', 'Resource')}]\n"
        f"    {entry.get('description', '')}\n"
        f"    {category} — {location}"
    )


def build_system_prompt(vault: dict) -> str:
    lines = []
    for category in vault.get("categories", []):
        titles = ", ".join(e["title"] for e in category.get("entries", []))
        if titles:
            lines.append(f"- {category['name']}: {titles}")
    if not lines:
        return BASE_SYSTEM_PROMPT
    return BASE_SYSTEM_PROMPT + "\n\n" + VAULT_PROMPT.format(index="\n".join(lines))


# --- commands ---------------------------------------------------------------


class Session:
    def __init__(self):
        self.messages = load_memory()
        self.vault = load_vault()
        self.effort = "high"
        self.running = True

    @property
    def system_prompt(self) -> str:
        return build_system_prompt(self.vault)


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


def cmd_vault(session: Session, arg: str) -> None:
    if arg == "add":
        vault_add(session)
        return

    if not arg:
        categories = session.vault.get("categories", [])
        if not categories:
            print("Vault is empty. Add an entry with /vault add\n")
            return
        total = sum(len(c.get("entries", [])) for c in categories)
        print(f"{session.vault.get('title', 'Vault')} — {total} entries")
        for category in categories:
            print(f"\n  {category['name']}")
            for entry in category.get("entries", []):
                print(f"    - {entry['title']}  [{entry.get('type', 'Resource')}]")
        print("\nSearch with /vault <query>, add with /vault add\n")
        return

    hits = search_vault(session.vault, arg)
    if not hits:
        print(f"No vault entries match '{arg}'.\n")
        return
    plural = "es" if len(hits) != 1 else ""
    print(f"{len(hits)} match{plural} for '{arg}':\n")
    for category, entry in hits:
        print(format_entry(category, entry))
        print()


def vault_add(session: Session) -> None:
    categories = session.vault.setdefault("categories", [])
    try:
        title = input("  Title: ").strip()
        if not title:
            print("  Cancelled — a title is required.\n")
            return

        print("  Category:")
        for i, category in enumerate(categories, 1):
            print(f"    {i}. {category['name']}")
        choice = input("  Number, or a name for a new category: ").strip()

        if choice.isdigit() and 1 <= int(choice) <= len(categories):
            target = categories[int(choice) - 1]
        elif choice:
            target = {"name": choice, "entries": []}
            categories.append(target)
        else:
            print("  Cancelled — a category is required.\n")
            return

        entry = {
            "title": title,
            "type": input("  Type (Prompt / Guide / Link / Link Pack / Cheat Sheet): ").strip()
            or "Resource",
            "description": input("  Description: ").strip(),
            "url": input("  URL (blank if you don't have it yet): ").strip() or None,
        }
    except (KeyboardInterrupt, EOFError):
        print("\n  Cancelled.\n")
        return

    if entry["url"]:
        entry["source"] = entry["url"].split("//")[-1].split("/")[0]
    target.setdefault("entries", []).append(entry)
    session.vault["updated"] = datetime.now().strftime("%Y-%m-%d")
    save_vault(session.vault)
    print(f"  Added '{title}' to {target['name']}. Run build_vault.py to refresh the page.\n")


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
    "/vault": (cmd_vault, "[query|add]", "browse, search, or add to your resource vault"),
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

    vault_count = sum(1 for _ in vault_entries(session.vault))
    if vault_count:
        print(f"Vault loaded: {vault_count} resources across "
              f"{len(session.vault.get('categories', []))} categories.")

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

        with client.messages.stream(
            model=MODEL,
            max_tokens=4096,
            thinking={"type": "adaptive"},
            output_config={"effort": session.effort},
            system=session.system_prompt,
            messages=session.messages,
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
                response_text += text

        print()
        session.messages.append({"role": "assistant", "content": response_text})
        save_memory(session.messages)

    save_memory(session.messages)
    print("Memory saved. Goodbye!")


if __name__ == "__main__":
    chat()
