"""Model backends for Friday. Dispatches on config.PROVIDER.

- "anthropic": Claude via the Anthropic SDK (requires an API key).
- "ollama":    a local model via the Ollama HTTP API (no key, offline).
"""

import json

from . import config


def stream_reply(messages: list) -> str:
    """Stream a reply for the given message history.

    Prints tokens to stdout as they arrive and returns the full text.
    """
    if config.PROVIDER == "ollama":
        return _stream_ollama(messages)
    if config.PROVIDER == "anthropic":
        return _stream_anthropic(messages)
    raise ValueError(
        f"Unknown FRIDAY_PROVIDER {config.PROVIDER!r}; use 'anthropic' or 'ollama'."
    )


def _stream_anthropic(messages: list) -> str:
    import anthropic

    client = anthropic.Anthropic()
    response_text = ""
    with client.messages.stream(
        model=config.MODEL,
        max_tokens=config.MAX_TOKENS,
        thinking={"type": "adaptive"},
        system=config.SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
            response_text += text
    return response_text


def _stream_ollama(messages: list) -> str:
    import httpx

    payload = {
        "model": config.OLLAMA_MODEL,
        "messages": [{"role": "system", "content": config.SYSTEM_PROMPT}] + messages,
        "stream": True,
        "options": {"num_predict": config.MAX_TOKENS},
    }

    response_text = ""
    url = f"{config.OLLAMA_HOST.rstrip('/')}/api/chat"
    try:
        with httpx.stream("POST", url, json=payload, timeout=None) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                if chunk.get("error"):
                    raise RuntimeError(chunk["error"])
                text = chunk.get("message", {}).get("content", "")
                if text:
                    print(text, end="", flush=True)
                    response_text += text
                if chunk.get("done"):
                    break
    except httpx.ConnectError as e:
        raise RuntimeError(
            f"Could not reach Ollama at {config.OLLAMA_HOST}. "
            "Is it running? Try `ollama serve` and `ollama pull "
            f"{config.OLLAMA_MODEL}`."
        ) from e
    return response_text
