"""Research-Modul — bringt das Web in die Bexly-KI.

Bindet Firecrawl (https://firecrawl.dev) an, um Webseiten in saubere, LLM-fertige
Texte zu verwandeln, und reicht das Ergebnis an die Bexly-KI weiter. So kann das
OS markengerecht recherchieren: Trends, Referenzseiten, Konkurrenz-Content.

Voraussetzungen:
    pip install firecrawl-py
    export FIRECRAWL_API_KEY=fc-...        # Firecrawl Cloud API-Key
    export ANTHROPIC_API_KEY=...           # fuer die Bexly-KI

Beispiel:
    from bexly_os.modules.research import ResearchModule
    r = ResearchModule()
    print(r.summarize_url("https://example.com"))
    print(r.web_insights("Trends Kinder-Animations-IP 2026"))
"""

import os
from pathlib import Path

from ..core import BexlyKI

ROLE = """\
Du bist die Research-Analystin der Marke Bexly. Du bekommst rohe Web-Inhalte und
wertest sie aus der Perspektive der Marke aus: Was ist relevant für Bexly
(Animations-IP für Kinder 6–11 & Familien)? Welche Chancen, Trends oder
Learnings ergeben sich? Fasse präzise zusammen, trenne Fakten von Spekulation
und leite konkrete, markengerechte Handlungsideen ab. Halte dich an Tonalität
und Tabus aus dem Markenkern."""


class ResearchModule:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("FIRECRAWL_API_KEY")
        self._client = None  # lazy: erst bei Bedarf verbinden
        self.ki = BexlyKI(
            role_instructions=ROLE,
            memory_path=Path(__file__).resolve().parent.parent.parent / ".bexly" / "research_memory.json",
        )

    # --- Firecrawl ---------------------------------------------------------
    @property
    def client(self):
        """Verbindet sich (lazy) mit Firecrawl. Klare Fehler, wenn etwas fehlt."""
        if self._client is None:
            if not self.api_key:
                raise RuntimeError(
                    "FIRECRAWL_API_KEY fehlt. Setze die Umgebungsvariable oder "
                    "uebergib api_key=... an ResearchModule()."
                )
            try:
                from firecrawl import Firecrawl
            except ImportError as e:
                raise ImportError(
                    "firecrawl-py ist nicht installiert. Bitte 'pip install firecrawl-py'."
                ) from e
            self._client = Firecrawl(api_key=self.api_key)
        return self._client

    def scrape(self, url: str) -> str:
        """Holt eine Seite als Markdown-Text."""
        doc = self.client.scrape(url, formats=["markdown"])
        # SDK liefert ein Document-Objekt oder dict — beide Wege abdecken.
        markdown = getattr(doc, "markdown", None)
        if markdown is None and isinstance(doc, dict):
            markdown = doc.get("markdown") or doc.get("data", {}).get("markdown")
        return markdown or ""

    def search(self, query: str, limit: int = 5) -> list[dict]:
        """Sucht im Web und gibt Treffer (Titel/URL/Inhalt) zurueck."""
        res = self.client.search(query, limit=limit)
        # Ergebnisform je nach SDK-Version normalisieren.
        if hasattr(res, "web"):
            return list(res.web or [])
        if isinstance(res, dict):
            return res.get("web") or res.get("data") or []
        return res or []

    # --- Research + Bexly-KI ----------------------------------------------
    def summarize_url(self, url: str) -> str:
        """Scrapet eine URL und laesst die Bexly-KI sie markengerecht auswerten."""
        content = self.scrape(url)
        if not content.strip():
            return f"Keine Inhalte von {url} erhalten."
        # Sehr lange Seiten beschneiden, um Tokens zu sparen.
        snippet = content[:12000]
        return self.ki.ask(
            f"Hier ist der Inhalt von {url}:\n\n{snippet}\n\n"
            "Werte ihn für Bexly aus: Worum geht es, was ist relevant, welche "
            "Handlungsideen ergeben sich?"
        )

    def web_insights(self, topic: str, limit: int = 5) -> str:
        """Sucht zu einem Thema im Web und liefert eine Bexly-Analyse."""
        hits = self.search(topic, limit=limit)
        if not hits:
            return f"Keine Web-Treffer zu: {topic}"
        lines = []
        for h in hits:
            title = (h.get("title") if isinstance(h, dict) else getattr(h, "title", "")) or ""
            url = (h.get("url") if isinstance(h, dict) else getattr(h, "url", "")) or ""
            desc = (h.get("description") if isinstance(h, dict) else getattr(h, "description", "")) or ""
            lines.append(f"- {title} ({url}): {desc}")
        digest = "\n".join(lines)
        return self.ki.ask(
            f"Ich habe zum Thema '{topic}' folgende Web-Treffer gesammelt:\n\n"
            f"{digest}\n\n"
            "Fasse die wichtigsten Erkenntnisse für Bexly zusammen und leite "
            "konkrete Ideen ab."
        )
