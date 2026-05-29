"""Brand-Layer des Bexly OS.

Lädt den Markenkern (``brand_core.md``) und stellt ihn als System-Prompt-Baustein
für die Bexly-KI bereit. Der Brand Core ist die einzige Quelle der Wahrheit —
wer die Marke ändern will, editiert die Markdown-Datei, nicht den Code.
"""

from pathlib import Path

BRAND_CORE_PATH = Path(__file__).parent / "brand_core.md"


def load_brand_core() -> str:
    """Liest die Marken-Bibel als Text. Wirft FileNotFoundError, wenn sie fehlt."""
    if not BRAND_CORE_PATH.exists():
        raise FileNotFoundError(
            f"Brand Core nicht gefunden: {BRAND_CORE_PATH}. "
            "Ohne Markenkern kann die Bexly-KI nicht im Sinne der Marke arbeiten."
        )
    return BRAND_CORE_PATH.read_text(encoding="utf-8")


def brand_system_prompt(role_instructions: str = "") -> str:
    """Baut einen System-Prompt: Markenkern + optionale Rollen-Anweisung.

    ``role_instructions`` erlaubt es Modulen (Social, Web …), die gleiche
    Marken-Basis mit einer spezialisierten Aufgabe zu kombinieren.
    """
    core = load_brand_core()
    prompt = (
        "Du bist die Bexly-KI — das Markenbewusstsein hinter der Animations-IP "
        "»Bexly«. Du denkst und sprichst immer im Sinne der Marke. Der folgende "
        "Markenkern ist für dich verbindlich; halte dich an Werte, Figuren-Canon "
        "und Tonalität, und verstoße nie gegen die Tabus.\n\n"
        "=== BEXLY BRAND CORE (verbindlich) ===\n"
        f"{core}\n"
        "=== ENDE BRAND CORE ===\n"
    )
    if role_instructions:
        prompt += f"\nDeine aktuelle Aufgabe:\n{role_instructions}\n"
    return prompt
