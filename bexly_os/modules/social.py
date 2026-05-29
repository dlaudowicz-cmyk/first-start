"""Social-Media-Modul (Beispiel).

Zeigt, wie ein Modul die Bexly-KI mit einer spezialisierten Rollen-Anweisung
nutzt — der Markenkern (Werte, Figuren, Tonalität, Tabus) wird automatisch
mitgeladen. Gedächtnisfrei (eigener Pfad), damit Marketing-Calls den Chat-
Verlauf nicht "vollschreiben".

    from bexly_os.modules.social import SocialModule
    posts = SocialModule().captions("Teaser: Cal trifft zum ersten Mal Bexly", n=3)
"""

from pathlib import Path

from ..core import BexlyKI

ROLE = """\
Du bist der Social-Media-Texter der Marke Bexly. Du schreibst kurze, kindgerechte
und familientaugliche Posts, die neugierig machen und die Werte der Marke
(Freundschaft, Frieden, Akzeptanz, Mut) transportieren. Halte dich strikt an die
Tonalität und die Tabus aus dem Markenkern. Plattform-Standard ist Instagram/
TikTok-Caption-Länge, sofern nichts anderes gesagt wird."""


class SocialModule:
    def __init__(self):
        # Eigener, flüchtiger Gedächtnispfad — trennt Marketing von Chat.
        self.ki = BexlyKI(
            role_instructions=ROLE,
            memory_path=Path(__file__).resolve().parent.parent.parent / ".bexly" / "social_memory.json",
        )

    def captions(self, brief: str, n: int = 3) -> str:
        """Generiert n Caption-Vorschläge zu einem Brief."""
        return self.ki.ask(
            f"Erstelle {n} Caption-Vorschläge für folgenden Brief: {brief}\n"
            "Nummeriere sie und schlage je 3–5 passende Hashtags vor."
        )
