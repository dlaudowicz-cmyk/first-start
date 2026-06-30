"""Interactive chat loop for Friday."""

from .client import stream_reply
from .config import COMMANDS
from .memory import forget_memory, load_memory, save_memory


def chat() -> None:
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
