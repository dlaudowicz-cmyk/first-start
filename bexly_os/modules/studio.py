"""Studio-Modul — das Produktionssystem fuer KI-Film (im Geist von Cuelist.ai).

Kern-Idee in drei Schritten:

  1. CINEFORGE  — eine Sequenz/ein Beat wird von der Bexly-KI in einzelne Shots
                  zerlegt, jeder mit Kamera, Komposition, Licht, Pacing und einem
                  generierfertigen Prompt. Markenbewusst (kennt Figuren & Canon).
  2. SHOTLIST   — alle Shots eines Projekts werden strukturiert verwaltet und
                  persistiert (Status: planned -> generated -> approved).
  3. ROUTING    — jeder Shot wird an den passenden Provider (Bild/Video) geroutet;
                  das Modul liefert fertige "Generierungs-Jobs".

Die eigentliche Bild-/Video-Erzeugung erledigt ein angebundener Generator
(z. B. Higgsfield/Seedance). Dieses Modul plant, strukturiert und trackt.

Datenmodell, Parser und Export funktionieren ohne API-Key; nur ``cineforge()``
braucht die Bexly-KI (und damit anthropic) — sie wird lazy geladen.

Beispiel:
    from bexly_os.modules.studio import Studio
    s = Studio("being-bexly")
    s.cineforge("Cal wird in die Kommandozentrale gesaugt ...", scene="Erste Verbindung")
    print(s.export_markdown())
    jobs = s.generation_jobs("planned")
"""

import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path

STUDIO_DIR = Path(__file__).resolve().parent.parent.parent / ".bexly" / "studio"

# Felder, die CineForge pro Shot liefert.
SHOT_FIELDS = ("beat", "action", "camera", "composition", "lighting", "pacing", "prompt")

ROLE = """\
Du bist der KI-Kameramann/Regisseur ("CineForge") der Marke Bexly. Du zerlegst
eine Szene oder Sequenz in einzelne, klar abgegrenzte SHOTS. Jeder Beat ist ein
eigener Shot. Du kennst Figuren, Welt und Tonalitaet aus dem Markenkern und
haeltst dich strikt daran (kindgerecht, warmherzig, humorvoll).

Antworte AUSSCHLIESSLICH mit einem JSON-Array. Jedes Element ist ein Shot mit
exakt diesen Schluesseln:
  "beat"        : kurzer Name des Beats
  "action"      : was im Shot passiert (1-2 Saetze)
  "camera"      : Kameraeinstellung & -bewegung (z. B. "Low-Angle, langsamer Push-in")
  "composition" : Bildaufbau (Vorder-/Hintergrund, Position der Figuren)
  "lighting"    : Lichtstimmung
  "pacing"      : Dauer/Rhythmus (z. B. "3s, baut Spannung auf")
  "prompt"      : ein generierfertiger Bild-/Video-Prompt (Englisch ok), der
                  Stil, Figur(en), Kamera, Licht und Stimmung buendelt
Keine Erklaerungen, kein Text ausserhalb des JSON-Arrays."""


@dataclass
class Shot:
    number: int
    scene: str = ""
    beat: str = ""
    action: str = ""
    camera: str = ""
    composition: str = ""
    lighting: str = ""
    pacing: str = ""
    prompt: str = ""
    medium: str = "image"          # "image" oder "video"
    status: str = "planned"        # planned -> generated -> approved
    output: str = ""               # URL/Pfad des erzeugten Assets

    def as_dict(self) -> dict:
        return asdict(self)


class Studio:
    """Produktionssystem fuer ein Film-/Animationsprojekt."""

    def __init__(self, project: str = "being-bexly"):
        self.project = project
        self.path = STUDIO_DIR / f"{project}.json"
        self.shots: list[Shot] = self._load()
        self._ki = None  # lazy: Engine erst laden, wenn CineForge laeuft

    @property
    def ki(self):
        if self._ki is None:
            from ..core import BexlyKI  # lazy -> Datenmodell braucht kein anthropic
            self._ki = BexlyKI(
                role_instructions=ROLE,
                memory_path=STUDIO_DIR / f"{self.project}.cineforge-memory.json",
            )
        return self._ki

    # --- Persistenz --------------------------------------------------------
    def _load(self) -> list[Shot]:
        if self.path.exists():
            try:
                data = json.loads(self.path.read_text(encoding="utf-8"))
                return [Shot(**s) for s in data.get("shots", [])]
            except (json.JSONDecodeError, OSError, TypeError):
                return []
        return []

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            json.dumps({"project": self.project, "shots": [s.as_dict() for s in self.shots]},
                       indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    # --- CineForge: Sequenz -> Shots --------------------------------------
    def cineforge(self, sequence: str, scene: str = "", medium: str = "image") -> list[Shot]:
        """Zerlegt eine Sequenz markenbewusst in Shots und haengt sie ans Projekt."""
        raw = self.ki.ask(
            f"Zerlege folgende Szene in Shots (Standard-Medium: {medium}):\n\n{sequence}"
        )
        shots_data = _parse_shot_json(raw)
        start = len(self.shots)
        new_shots = []
        for i, sd in enumerate(shots_data, start=start + 1):
            shot = Shot(number=i, scene=scene, medium=medium,
                        **{k: str(sd.get(k, "")) for k in SHOT_FIELDS})
            self.shots.append(shot)
            new_shots.append(shot)
        self.save()
        return new_shots

    def add_shot(self, scene: str = "", medium: str = "image", **fields) -> Shot:
        """Fuegt manuell einen Shot hinzu (fuer handgeschriebene Prompts)."""
        shot = Shot(number=len(self.shots) + 1, scene=scene, medium=medium,
                    **{k: str(fields.get(k, "")) for k in SHOT_FIELDS})
        self.shots.append(shot)
        self.save()
        return shot

    # --- Shotlist-Verwaltung ----------------------------------------------
    def get(self, number: int) -> "Shot | None":
        return next((s for s in self.shots if s.number == number), None)

    def update_status(self, number: int, status: str, output: str = "") -> None:
        shot = self.get(number)
        if not shot:
            raise KeyError(f"Shot {number} existiert nicht.")
        shot.status = status
        if output:
            shot.output = output
        self.save()

    def list_shots(self, status: str | None = None, scene: str | None = None) -> list[Shot]:
        out = self.shots
        if status:
            out = [s for s in out if s.status == status]
        if scene:
            out = [s for s in out if s.scene == scene]
        return out

    # --- Routing: Shots -> Generierungs-Jobs ------------------------------
    def generation_jobs(self, status: str = "planned") -> list[dict]:
        """Liefert fertige Jobs fuer den passenden Provider (Bild/Video)."""
        return [{
            "shot": s.number,
            "scene": s.scene,
            "medium": s.medium,
            "provider": "video" if s.medium == "video" else "image",
            "prompt": s.prompt,
            "camera": s.camera,
            "lighting": s.lighting,
        } for s in self.list_shots(status=status)]

    # --- Export ------------------------------------------------------------
    def export_markdown(self) -> str:
        """Gibt die Shotlist als lesbare Markdown-Tabelle + Prompts aus."""
        if not self.shots:
            return f"Projekt '{self.project}' hat noch keine Shots."
        lines = [
            f"# Shotlist — {self.project}", "",
            "| # | Szene | Beat | Kamera | Licht | Pacing | Medium | Status |",
            "|---|-------|------|--------|-------|--------|--------|--------|",
        ]
        for s in self.shots:
            lines.append(
                f"| {s.number} | {s.scene} | {s.beat} | {s.camera} | "
                f"{s.lighting} | {s.pacing} | {s.medium} | {s.status} |")
        lines += ["", "## Prompts", ""]
        for s in self.shots:
            lines.append(f"**Shot {s.number} — {s.beat}**\n\n> {s.prompt}\n")
        return "\n".join(lines)


def _parse_shot_json(raw: str) -> list[dict]:
    """Extrahiert das JSON-Array aus der KI-Antwort, robust gegen Code-Fences."""
    text = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    if not text.startswith("["):
        i, j = text.find("["), text.rfind("]")
        if i != -1 and j != -1:
            text = text[i : j + 1]
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []
