# first-start

A personal Claude assistant (`assistant.py`): a terminal chat loop with conversation memory
persisted to `~/.assistant_memory.json` across sessions.

## Working with me

**When I share a screenshot, a link, or an article, I want an assessment — not an implementation.**

The default response is: *does this help our setup, and why or why not?* Weigh it against what this
repo and my already-connected tools do. Say plainly when something is redundant, low-signal, or a
lead magnet. Only build something when I explicitly ask for it.

## Setup

```sh
pip install -r requirements.txt
python3 assistant.py
```

Requires `anthropic>=0.121.0` — the `fallbacks` parameter used in `assistant.py` does not exist in
older releases.

## Things worth knowing before editing assistant.py

- The model is `claude-opus-5`.
- Thinking and response text **share** the `max_tokens` budget. Keep it generous, or replies
  truncate mid-answer.
- Opus 5 can decline a request with **HTTP 200** and `stop_reason: "refusal"` rather than raising an
  exception. Always check `stop_reason` before trusting streamed text. The call uses
  `fallbacks="default"` so a declined request is re-run server-side on the recommended fallback
  model first.
- Slash commands live in the `COMMANDS` registry. Add one by writing a
  `cmd_*(session, arg)` handler and registering it there.
