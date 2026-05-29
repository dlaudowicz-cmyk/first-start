"""Interaktive Kommandozeile für die Bexly-KI.

Start:  python -m bexly_os.cli   (oder: python bexly.py)
"""

from .core import BexlyKI

BANNER = r"""
  ____  _______  ___   __   __    ___  ____
 | __ )| ____\ \/ / |  \ \ / /   / _ \/ ___|
 |  _ \|  _|  \  /| |   \ V /   | | | \___ \
 | |_) | |___ /  \| |___ | |    | |_| |___) |
 |____/|_____/_/\_\_____||_|     \___/|____/
        Bexly OS — die markenbewusste KI
"""

COMMANDS = """\
Befehle:
  /forget   — Gedächtnis löschen und neu starten
  /memory   — anzeigen, wie viel gespeichert ist
  /brand    — den geladenen Markenkern anzeigen
  quit      — beenden"""


def main() -> None:
    print(BANNER)
    ki = BexlyKI()

    if ki.exchange_count:
        print(f"Gedächtnis geladen: {ki.exchange_count} frühere Austausche gemerkt.")
    else:
        print("Frischer Start — noch kein Gedächtnis vorhanden.")
    print(COMMANDS)
    print()

    while True:
        try:
            user_input = input("Du: ").strip()
        except (KeyboardInterrupt, EOFError):
            ki.save_memory()
            print("\nGedächtnis gespeichert. Bis bald!")
            break

        if not user_input:
            continue

        low = user_input.lower()
        if low in ("quit", "exit", "bye", "/quit"):
            ki.save_memory()
            print("Gedächtnis gespeichert. Bis bald!")
            break
        if low == "/forget":
            ki.forget()
            print("Gedächtnis gelöscht.\n")
            continue
        if low == "/memory":
            print(f"Gespeichert: {ki.exchange_count} Austausche ({len(ki.messages)} Nachrichten)\n")
            continue
        if low == "/brand":
            from .brand import load_brand_core
            print("\n" + load_brand_core() + "\n")
            continue

        print("Bexly-KI: ", end="", flush=True)
        for chunk in ki.stream(user_input):
            print(chunk, end="", flush=True)
        print("\n")


if __name__ == "__main__":
    main()
