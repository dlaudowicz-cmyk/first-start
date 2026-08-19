# Being Bexly — Projektarbeitsplatz

Arbeitsrepo für die Animations-IP **»Being Bexly«** (RED SUN FILMS) und die
KI-Produktionspipeline von **Pushlabs**.

> **⚠️ Status: pausiert** — bis die Verträge mit Red Sun Films stehen.
> **→ Einstieg: [`HANDOVER.md`](HANDOVER.md), dann [`strategy/MASTERPLAN.md`](strategy/MASTERPLAN.md)**

---

## Was hier liegt

| Ordner | Inhalt |
|---|---|
| **`strategy/`** | Masterplan, Kostenmodell, Marktvergleich, Term Sheet, One-Pager |
| **`productions/`** | Produktionsstandards (Kamera/Blocking), Element-IDs & Rezepte, Shotlists, 3D-Druck |
| **`bexly_os/`** | Markenbewusste KI: Marken-Bibel + Engine + Module |
| **`ip_studio/`** | Werkzeug für eine **eigene** IP (getrennt von Bexly) |
| **`tools/`** | Kostenrechner |

---

## Bexly OS starten

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...        # Pflicht
export FIRECRAWL_API_KEY=fc-...     # nur für das Research-Modul
python bexly.py
```

Die KI lädt automatisch den Markenkern und merkt sich den Verlauf (lokal unter
`.bexly/`, nicht im Git). Befehle: `/brand`, `/memory`, `/forget`, `quit`.

**Markenwissen wird immer in `bexly_os/brand/brand_core.md` gepflegt — nie im Code.**

### Module
```python
from bexly_os.modules.studio import Studio      # Szene → Shotlist → Generierungs-Jobs
from bexly_os.modules.social import SocialModule # Captions
from bexly_os.modules.research import ResearchModule  # Web-Recherche (Firecrawl)
```

Jeder Shot enthält verbindlich: **Blocking** (Screen Direction, 180°-Regel),
**Kamera-Bewegungsstil**, **Locomotion je Figur**, Licht, Pacing, Stimmung.
Vokabular: [`productions/CAMERA_AND_BLOCKING.md`](productions/CAMERA_AND_BLOCKING.md)

---

## Kosten nachrechnen

```bash
python3 tools/kostenrechner.py
```

Verifizierte Stückkosten und Annahmen sind dort einstellbar; Herleitung in
[`strategy/kostenmodell.md`](strategy/kostenmodell.md).

---

## Eigene IP

`ip_studio/` ist bewusst IP-unabhängig und **getrennt von Being Bexly** zu
verwenden (eigenes Repo, eigene Historie, eigene Referenz-Elemente):

```bash
python3 ip_studio/scaffold.py new "Titel"
```

Anleitung: [`ip_studio/PLAYBOOK.md`](ip_studio/PLAYBOOK.md)
