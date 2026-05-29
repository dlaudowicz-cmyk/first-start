"""Bexly-KI — die Kern-Engine des Bexly OS.

Eine schlanke Hülle um Claude, die (1) den Markenkern als System-Prompt lädt
und (2) ein dauerhaftes Gedächtnis über Sessions hinweg führt. Alle Module
(Social, Web, Quests …) bauen auf dieser Engine auf.
"""

import json
import os
from pathlib import Path

import anthropic

from .brand import brand_system_prompt

# Aktuelles Default-Modell; per Umgebungsvariable überschreibbar.
DEFAULT_MODEL = os.environ.get("BEXLY_MODEL", "claude-opus-4-8")

# Gedächtnis liegt projektlokal unter .bexly/ (per .gitignore ausgeschlossen).
DEFAULT_MEMORY_PATH = Path(
    os.environ.get("BEXLY_MEMORY", Path(__file__).resolve().parent.parent / ".bexly" / "memory.json")
)


class BexlyKI:
    """Die markenbewusste KI. Kennt den Brand Core, erinnert sich an alles."""

    def __init__(
        self,
        role_instructions: str = "",
        memory_path: Path | None = None,
        model: str = DEFAULT_MODEL,
        max_tokens: int = 4096,
    ):
        self.client = anthropic.Anthropic()
        self.model = model
        self.max_tokens = max_tokens
        self.system_prompt = brand_system_prompt(role_instructions)
        self.memory_path = Path(memory_path) if memory_path else DEFAULT_MEMORY_PATH
        self.messages = self._load_memory()

    # --- Gedächtnis -------------------------------------------------------
    def _load_memory(self) -> list:
        if self.memory_path.exists():
            try:
                return json.loads(self.memory_path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                return []
        return []

    def save_memory(self) -> None:
        self.memory_path.parent.mkdir(parents=True, exist_ok=True)
        self.memory_path.write_text(
            json.dumps(self.messages, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    def forget(self) -> None:
        self.messages = []
        if self.memory_path.exists():
            self.memory_path.unlink()

    @property
    def exchange_count(self) -> int:
        return len(self.messages) // 2

    # --- Konversation -----------------------------------------------------
    def ask(self, user_input: str) -> str:
        """Eine Runde ohne Streaming. Gibt die vollständige Antwort zurück."""
        self.messages.append({"role": "user", "content": user_input})
        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=self.system_prompt,
            messages=self.messages,
        )
        text = "".join(block.text for block in response.content if block.type == "text")
        self.messages.append({"role": "assistant", "content": text})
        self.save_memory()
        return text

    def stream(self, user_input: str):
        """Eine Runde mit Streaming. Liefert Text-Chunks und speichert am Ende."""
        self.messages.append({"role": "user", "content": user_input})
        text = ""
        with self.client.messages.stream(
            model=self.model,
            max_tokens=self.max_tokens,
            thinking={"type": "adaptive"},
            system=self.system_prompt,
            messages=self.messages,
        ) as s:
            for chunk in s.text_stream:
                text += chunk
                yield chunk
        self.messages.append({"role": "assistant", "content": text})
        self.save_memory()
