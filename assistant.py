#!/usr/bin/env python3
"""Personal AI assistant powered by Claude with semantic long-term memory.

Instead of replaying the entire conversation history on every turn, the
assistant embeds each past exchange and, for a new question, retrieves only
the most relevant ones (plus the few most recent for continuity). This keeps
the context window small while the memory grows without bound.
"""

import anthropic
import json
import os

client = anthropic.Anthropic()

MEMORY_FILE = os.path.expanduser("~/.assistant_memory.json")
EMBED_FILE = os.path.expanduser("~/.assistant_embeddings.npy")

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# How many past exchanges to feed the model each turn.
N_RECENT = 3      # most recent exchanges, for conversational continuity
TOP_K = 4         # max semantically relevant older exchanges to retrieve
MIN_SIM = 0.25    # cosine-similarity floor; below this an exchange is not relevant

SYSTEM_PROMPT = """You are a helpful personal AI assistant. You are direct, knowledgeable, and concise.
You remember everything said across all conversations and use it to give better answers over time."""

COMMANDS = """\
Commands:
  /forget   — clear all memory and start fresh
  /memory   — show how many messages are stored
  quit      — exit"""


# ---------------------------------------------------------------------------
# Embedding backend (loaded lazily; degrades gracefully if unavailable)
# ---------------------------------------------------------------------------

_embedder = None
_embed_available = None


def _get_embedder():
    """Load the sentence-transformers model once, lazily."""
    global _embedder, _embed_available
    if _embed_available is not None:
        return _embedder
    try:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer(EMBED_MODEL)
        _embed_available = True
    except Exception as e:  # missing deps, no network on first download, etc.
        print(f"(Semantic memory disabled: {e})")
        _embedder = None
        _embed_available = False
    return _embedder


def embed_texts(texts: list):
    """Return an (n, d) float32 numpy array of normalized embeddings, or None."""
    model = _get_embedder()
    if model is None or not texts:
        return None
    import numpy as np
    vecs = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return np.asarray(vecs, dtype="float32")


# ---------------------------------------------------------------------------
# Memory persistence
# ---------------------------------------------------------------------------

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
    for path in (MEMORY_FILE, EMBED_FILE):
        if os.path.exists(path):
            os.remove(path)


def exchanges(messages: list) -> list:
    """Group the flat message list into (index, user_text, assistant_text) pairs."""
    pairs = []
    for i in range(0, len(messages) - 1, 2):
        u, a = messages[i], messages[i + 1]
        if u.get("role") == "user" and a.get("role") == "assistant":
            pairs.append((i, u["content"], a["content"]))
    return pairs


# ---------------------------------------------------------------------------
# Embedding cache: one vector per completed exchange, kept in sync with memory
# ---------------------------------------------------------------------------

def load_embeddings(num_exchanges: int):
    """Load cached embeddings if they match the current number of exchanges."""
    if not os.path.exists(EMBED_FILE):
        return None
    try:
        import numpy as np
        arr = np.load(EMBED_FILE)
        if arr.shape[0] == num_exchanges:
            return arr
    except Exception:
        pass
    return None


def sync_embeddings(messages: list, cache):
    """Ensure we have an embedding for every completed exchange.

    Only the missing (newest) exchanges are embedded, so steady-state cost is
    a single embedding per turn.
    """
    pairs = exchanges(messages)
    if not pairs:
        return None
    if not _embed_available and _get_embedder() is None:
        return None

    import numpy as np
    have = 0 if cache is None else cache.shape[0]
    if have == len(pairs):
        return cache

    new_texts = [f"User: {u}\nAssistant: {a}" for (_, u, a) in pairs[have:]]
    new_vecs = embed_texts(new_texts)
    if new_vecs is None:
        return cache

    combined = new_vecs if cache is None else np.vstack([cache, new_vecs])
    try:
        np.save(EMBED_FILE, combined)
    except Exception:
        pass
    return combined


# ---------------------------------------------------------------------------
# Context construction
# ---------------------------------------------------------------------------

def build_context(messages: list, cache, query: str) -> list:
    """Select which past messages to send: recent + semantically relevant."""
    pairs = exchanges(messages)
    if not pairs:
        return []

    n = len(pairs)
    recent_idx = set(range(max(0, n - N_RECENT), n))
    selected = set(recent_idx)

    if cache is not None and cache.shape[0] == n:
        q = embed_texts([query])
        if q is not None:
            import numpy as np
            scores = cache @ q[0]            # cosine sim (vectors are normalized)
            older = [i for i in range(n) if i not in recent_idx]
            older.sort(key=lambda i: scores[i], reverse=True)
            for i in older[:TOP_K]:
                if scores[i] >= MIN_SIM:     # skip exchanges that aren't relevant
                    selected.add(i)

    context = []
    for i in sorted(selected):           # chronological order
        _, u, a = pairs[i]
        context.append({"role": "user", "content": u})
        context.append({"role": "assistant", "content": a})
    return context


# ---------------------------------------------------------------------------
# Chat loop
# ---------------------------------------------------------------------------

def chat():
    messages = load_memory()
    cache = load_embeddings(len(exchanges(messages)))
    cache = sync_embeddings(messages, cache)

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
            cache = None
            print("Memory cleared.\n")
            continue

        if user_input.lower() == "/memory":
            ex = len(messages) // 2
            cached = 0 if cache is None else cache.shape[0]
            print(f"Stored: {ex} exchange{'s' if ex != 1 else ''} "
                  f"({len(messages)} messages, {cached} embedded)\n")
            continue

        # Build a compact context from memory, then add the new question.
        context = build_context(messages, cache, user_input)
        context.append({"role": "user", "content": user_input})

        print("Assistant: ", end="", flush=True)
        response_text = ""

        with client.messages.stream(
            model="claude-opus-4-7",
            max_tokens=4096,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            messages=context,
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
                response_text += text

        print()
        messages.append({"role": "user", "content": user_input})
        messages.append({"role": "assistant", "content": response_text})
        save_memory(messages)
        cache = sync_embeddings(messages, cache)


if __name__ == "__main__":
    chat()
