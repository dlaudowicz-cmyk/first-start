# Bexly OS

Das **Betriebssystem für die Marke Bexly** — eine KI, die den gesamten
Markenkern, die IP und die Tonalität kennt und als Gehirn für alles dient, was
Bexly groß macht: Social Media, Website, Quests und mehr.

> Bexly ist eine Animations-IP (»Being Bexly«, RED SUN FILMS) für Kinder &
> Familien, die als **KI-First-IP** zu einer Marke ausgebaut wird.

## Idee

Klassisch verstreut man Markenwissen über viele Köpfe und Dokumente. Bexly OS
dreht das um: Es gibt **eine zentrale Marken-Bibel** (`bexly_os/brand/brand_core.md`)
und **eine KI-Engine**, die dieses Wissen lädt. Jedes Modul — Social, Web,
Quests — nutzt dieselbe Engine und denkt dadurch konsistent im Sinne der Marke.

```
bexly_os/
├── brand/
│   ├── brand_core.md     ← die Marken-Bibel (Werte, Figuren, Tonalität, Tabus)
│   └── __init__.py       ← lädt den Markenkern in den System-Prompt
├── core.py               ← BexlyKI: Engine (Claude + Markenkern + Gedächtnis)
├── cli.py                ← interaktiver Chat mit der Bexly-KI
└── modules/
    ├── studio.py         ← KI-Film-Produktion (CineForge-Shotlist)
    ├── social.py         ← Social-Media-Captions
    ├── research.py        ← Web-Recherche via Firecrawl
    ├── web.py            (geplant)
    └── quests.py         (geplant)
bexly.py                  ← Einstiegspunkt
```

## Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...   # API-Schlüssel
```

## Start

```bash
python bexly.py
```

Die KI lädt automatisch den Markenkern und merkt sich den Verlauf über
Sessions hinweg (lokal unter `.bexly/`, nicht im Git).

Befehle im Chat: `/brand` (Markenkern zeigen), `/memory`, `/forget`, `quit`.

### Ein Modul nutzen (Beispiel)

```python
from bexly_os.modules.social import SocialModule

print(SocialModule().captions("Teaser: Cal trifft zum ersten Mal Bexly", n=3))
```

### Film-Produktion (Studio / CineForge — im Geist von Cuelist.ai)

```python
from bexly_os.modules.studio import Studio

s = Studio("being-bexly")
s.cineforge(
    "Cal wird in die Kommandozentrale gesaugt und verbindet sich erstmals "
    "über das holografische Half-Dome mit dem Roboterkörper.",
    scene="Erste Verbindung",
)
print(s.export_markdown())          # Shotlist (Kamera/Licht/Pacing) + Prompts
jobs = s.generation_jobs("planned")  # fertige Jobs für Bild-/Video-Generator
s.update_status(1, "generated", output="https://…/shot1.png")
```

Jeder Shot enthält als **Standard**: Blocking (Screen Direction/180°-Regel),
Kamera-Einstellung **und Kamera-Bewegungsstil** (handheld, steadicam, dolly,
crane, drone …), Licht, Pacing, Stimmung, Prompt. Vokabular & Regeln:
**`productions/CAMERA_AND_BLOCKING.md`**. Fertige Szenen-Shotlists liegen unter
**`productions/`** (z. B. `productions/scene01_the-chase.md`).

### Web-Recherche (Firecrawl)

```bash
pip install firecrawl-py
export FIRECRAWL_API_KEY=fc-...
```

```python
from bexly_os.modules.research import ResearchModule

r = ResearchModule()
print(r.summarize_url("https://example.com"))         # Seite markengerecht auswerten
print(r.web_insights("Trends Kinder-Animations-IP 2026"))  # Web durchsuchen + Analyse
```

## Die Marke pflegen

Alles Markenwissen lebt in **`bexly_os/brand/brand_core.md`** — in normaler
Sprache. Neue Figuren, Markenfarben, Slogan oder Regeln einfach dort ergänzen;
die KI und alle Module ziehen die Änderung automatisch.

## Roadmap

- [x] **Brand Core** — Marken-Bibel als zentrale Wahrheit
- [x] **Bexly-KI** — Engine mit Markenwissen & Gedächtnis
- [x] **Studio** — KI-Film-Produktionssystem: Szene → Shotlist (Kamera/Licht/
  Pacing/Prompt), Tracking & Routing an Bild-/Video-Generatoren (à la Cuelist.ai)
- [x] **Social** — Captions/Content-Ideen
- [x] **Research** — Web-Recherche via Firecrawl (Trends, Referenzen)
- [ ] **Web** — Landingpage & Website-Texte
- [ ] **Quests** — Gamification-/Aufgaben-System
- [ ] Optional: Web-Dashboard als zentrale Steuerzentrale
- [ ] Anbindung an vorhandene Assets (Drive: Clips, Seedance-Videos)
```
