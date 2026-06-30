# Friday

A personal AI assistant with infinite memory, powered by Claude. Friday streams
replies, holds multi-turn conversations, and remembers everything across
sessions.

## Project layout

```
.
├── friday/             # the assistant package
│   ├── __init__.py     # public API (`chat`, `__version__`)
│   ├── __main__.py     # `python -m friday`
│   ├── cli.py          # interactive chat loop
│   ├── client.py       # Anthropic streaming wrapper
│   ├── config.py       # model, paths, prompts (env-overridable)
│   └── memory.py       # load / save / forget persisted history
├── tests/              # pytest suite
├── assistant.py        # backwards-compatible entry point
├── pyproject.toml      # packaging + `friday` console script
└── requirements.txt
```

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...   # required — get one at https://console.anthropic.com/settings/keys
```

Friday checks for credentials on startup and exits with a clear message if
`ANTHROPIC_API_KEY` (or `ANTHROPIC_AUTH_TOKEN`) is missing.

## Run

```bash
python -m friday        # recommended
# or
python assistant.py     # backwards-compatible
# or, after `pip install -e .`
friday
```

## Run locally without an API key (Ollama)

Friday can use a local model via [Ollama](https://ollama.com) — no API key, no
cost, fully offline:

```bash
ollama serve            # start Ollama (if not already running)
ollama pull llama3.1    # download a model once

export FRIDAY_PROVIDER=ollama
python -m friday
```

Pick a different local model with `FRIDAY_OLLAMA_MODEL` (e.g. `mistral`,
`qwen2.5`) and point at a remote Ollama host with `FRIDAY_OLLAMA_HOST`.

## Commands

| Command   | Description                          |
| --------- | ------------------------------------ |
| `/forget` | Clear all memory and start fresh     |
| `/memory` | Show how many messages are stored    |
| `quit`    | Exit (memory is saved automatically) |

## Configuration

Friday reads these environment variables (all optional):

| Variable              | Default                  | Description                                 |
| --------------------- | ------------------------ | ------------------------------------------- |
| `FRIDAY_PROVIDER`     | `anthropic`              | Backend: `anthropic` or `ollama`            |
| `FRIDAY_MODEL`        | `claude-opus-4-7`        | Anthropic model used for completions        |
| `FRIDAY_MAX_TOKENS`   | `4096`                   | Max tokens per response                     |
| `FRIDAY_MEMORY_FILE`  | `~/.friday_memory.json`  | Where memory is persisted                   |
| `FRIDAY_OLLAMA_MODEL` | `llama3.1`               | Local model name (when provider is ollama)  |
| `FRIDAY_OLLAMA_HOST`  | `http://localhost:11434` | Ollama server URL (when provider is ollama) |

## Tests

```bash
pip install pytest
pytest
```
