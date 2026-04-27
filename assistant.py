#!/usr/bin/env python3
"""Personal AI assistant powered by Claude."""

import anthropic

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a helpful personal AI assistant. You are direct, knowledgeable, and concise.
You remember everything said in this conversation and use it to give better answers over time."""

def chat():
    messages = []
    print("Your AI assistant is ready. Type 'quit' or press Ctrl+C to exit.\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit", "bye"):
            print("Goodbye!")
            break

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

        print()  # newline after response
        messages.append({"role": "assistant", "content": response_text})

if __name__ == "__main__":
    chat()
