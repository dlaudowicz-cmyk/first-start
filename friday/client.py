"""Thin wrapper around the Anthropic streaming API."""

import anthropic

from .config import MAX_TOKENS, MODEL, SYSTEM_PROMPT

_client = anthropic.Anthropic()


def stream_reply(messages: list) -> str:
    """Stream a reply for the given message history.

    Prints tokens to stdout as they arrive and returns the full text.
    """
    response_text = ""
    with _client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
            response_text += text
    return response_text
