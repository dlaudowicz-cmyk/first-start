"""Per-project persistent memory and asset storage.

Each project lives in its own directory under ~/.supercomputer/projects/<slug>:

    memory.json    full agent conversation (survives across sessions)
    plan.json      the current plan the agent is working from
    brief.md       free-form notes / brief for the project
    manifest.json  metadata for every generated asset
    assets/        the actual generated files
"""

import json
import re
import time
from pathlib import Path

ROOT = Path.home() / ".supercomputer" / "projects"


def _slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or "project"


class Project:
    def __init__(self, name: str):
        self.name = name
        self.slug = _slug(name)
        self.dir = ROOT / self.slug
        self.assets_dir = self.dir / "assets"
        self.assets_dir.mkdir(parents=True, exist_ok=True)

    # --- conversation memory -------------------------------------------------
    @property
    def _memory_file(self) -> Path:
        return self.dir / "memory.json"

    def load_memory(self) -> list:
        if self._memory_file.exists():
            try:
                return json.loads(self._memory_file.read_text())
            except (json.JSONDecodeError, OSError):
                return []
        return []

    def save_memory(self, messages: list) -> None:
        self._memory_file.write_text(json.dumps(messages, indent=2, ensure_ascii=False))

    def reset_memory(self) -> None:
        self._memory_file.unlink(missing_ok=True)

    # --- plan ----------------------------------------------------------------
    def set_plan(self, steps: list) -> None:
        (self.dir / "plan.json").write_text(json.dumps(steps, indent=2, ensure_ascii=False))

    def get_plan(self) -> list:
        f = self.dir / "plan.json"
        if f.exists():
            try:
                return json.loads(f.read_text())
            except (json.JSONDecodeError, OSError):
                return []
        return []

    # --- brief / notes -------------------------------------------------------
    def append_note(self, text: str) -> None:
        with (self.dir / "brief.md").open("a") as f:
            f.write(text.rstrip() + "\n")

    def read_brief(self) -> str:
        f = self.dir / "brief.md"
        return f.read_text() if f.exists() else ""

    # --- assets --------------------------------------------------------------
    def _manifest(self) -> list:
        f = self.dir / "manifest.json"
        if f.exists():
            try:
                return json.loads(f.read_text())
            except (json.JSONDecodeError, OSError):
                return []
        return []

    def record_asset(self, path: Path, kind: str, prompt: str, meta: dict) -> dict:
        entry = {
            "index": len(self._manifest()) + 1,
            "file": path.name,
            "kind": kind,
            "prompt": prompt,
            "meta": meta,
            "created": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        manifest = self._manifest()
        manifest.append(entry)
        (self.dir / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
        return entry

    def list_assets(self) -> list:
        return self._manifest()


def list_projects() -> list:
    if not ROOT.exists():
        return []
    return sorted(p.name for p in ROOT.iterdir() if p.is_dir())
