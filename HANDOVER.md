# Bexly OS — Übergabedokument

> Stand: 2026-07-08 · Repo: `dlaudowicz-cmyk/first-start` · Branch:
> `claude/bexly-os-ai-9RgQb`
> Dieses Dokument gibt den kompletten Projektstand weiter — Vision, Marke,
> Code, Produktion, Tools und offene Punkte. Es ist so geschrieben, dass eine
> neue Person **oder eine neue KI-Session** sofort weiterarbeiten kann.

---

## 1. Was ist das Projekt?

**Bexly** ist eine Animations-IP (»Being Bexly«), die zu einer Marke für Kinder
& Familien ausgebaut wird. **Bexly OS** ist das „Betriebssystem" dahinter: eine
markenbewusste KI, die den gesamten Markenkern kennt und als Gehirn für alle
Aktivitäten dient (Content, Social, Web, Film-Produktion, Quests …).

- **Ausgangswerk:** Animationsfilm »Being Bexly« (früher »Being Baxter«)
- **Produktion:** RED SUN FILMS GMBH, Grünwald · Idee/Konzept: Rainer Matsutani ·
  Drehbuch: Rainer Matsutani & Sandro Lang
- **Strategie:** „KI-First-IP" — erst Reichweite über Buch, Hörspiel, kurze
  Clips & Food-Partnerschaften aufbauen, dann der große Film.
- **Logline:** Drei Feldmäuse entdecken, dass die Menschheit von
  schokoladensüchtigen Aliens infiltriert wurde – und bekämpfen im Körper eines
  Roboterjungen die Invasion.

---

## 2. Repository-Struktur

```
bexly_os/
├── brand/
│   ├── brand_core.md     ← DIE MARKEN-BIBEL (einzige Quelle der Wahrheit)
│   └── __init__.py       ← lädt den Markenkern in den System-Prompt
├── core.py               ← BexlyKI: Engine (Claude + Markenkern + Gedächtnis)
├── cli.py                ← interaktiver Chat mit der Bexly-KI
└── modules/
    ├── studio.py         ← KI-Film-Produktion (CineForge-Shotlist)  ← Cuelist.ai-artig
    ├── social.py         ← Social-Media-Captions
    └── research.py       ← Web-Recherche via Firecrawl
bexly.py                  ← Einstiegspunkt (python bexly.py)
productions/
└── scene01_the-chase.md  ← fertige Seedance-Shotlist (Szene 01)
requirements.txt          ← anthropic, firecrawl-py (optional)
README.md                 ← Nutzer-/Entwickler-Doku
assistant.py              ← Alt-Prototyp (Vorläufer, kann bleiben)
```

**Wichtig:** Das Repo wird in Cloud-Sessions frisch geklont und der Container ist
flüchtig. **Nur was committet & gepusht ist, bleibt erhalten.** Gedächtnis der
KI liegt lokal unter `.bexly/` (gitignored, nicht dauerhaft).

---

## 3. Code-Stand (was funktioniert)

| Komponente | Status | Beschreibung |
|-----------|--------|--------------|
| **Brand Core** | ✅ | `brand_core.md` — Werte, Figuren-Canon, Welt, Tonalität, Tabus |
| **Bexly-KI (core)** | ✅ | Lädt Markenkern als System-Prompt, dauerhaftes Gedächtnis, Streaming |
| **CLI** | ✅ | `python bexly.py` — Chat mit `/brand`, `/memory`, `/forget` |
| **Studio-Modul** | ✅ | Szene → Shotlist (Kamera/Licht/Pacing/Prompt), Tracking, Routing an Generatoren |
| **Social-Modul** | ✅ | Captions/Content-Ideen |
| **Research-Modul** | ✅ | Web-Recherche via Firecrawl (Cloud-API) |
| **Web-Modul** | ⬜ geplant | Landingpage & Website-Texte |
| **Quest-System** | ⬜ geplant | Gamification (noch zu definieren) |

**Setup / Start:**
```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...        # Pflicht
export FIRECRAWL_API_KEY=fc-...     # nur für Research-Modul
python bexly.py
```
Verifiziert: Code kompiliert; Markenkern lädt; Studio-Datenmodell/Parser/Export
laufen ohne API-Key (Engine wird lazy geladen). Live-KI-Calls brauchen den
API-Key (in der Build-Umgebung nicht getestet, da kein Key/`anthropic`).

---

## 4. Marken-Canon (in dieser Session festgelegt)

Diese Fakten sind in `brand_core.md` verankert:

- **Figuren:** Cal (ängstlicher, willensstarker Anführer-Maus), Liv (forsch,
  clever; früher „Becky"), Sammy (tollpatschiger Optimist) · Biff (Hofhund) ·
  **Jet Bexly** (Roboterjunge, **finaler Name**, Namensgeber der Marke) ·
  Cocosia (Gussok-Rebellin, Tochter von Präsidentin Hazela) · General Nogath
  (Antagonist) · Bauer Moe · Amy & Rob.
- **Jet Bexly:** ein **von den Gussoks gebauter Roboter**. Cal & Freunde finden
  ihn im **Keller des Bürgermeister-Hauses**. Wegen **Größe & Fell** hält der
  Roboter die Mäuse für Gussoks und **saugt sie versehentlich in die
  Kommandozentrale**. Steuerung über ein **holografisches Half-Dome
  (Halbkugel)**; **Cal verbindet sich beim ersten Besuch** darüber mit dem Körper.
- **Der Bürgermeister** wird von **General Nogath gesteuert** (Marionette/Roboter).
- **Werte:** Freundschaft, Frieden, Akzeptanz, Mut · **Zielgruppe:** 6–11 + Familien.
- **Tabus:** keine Gewalt/Angstmache, keine alten Namen (Baxter/Becky/Jet Baxter),
  Schokolade ist Story-Motiv (kein Ernährungs-Vorbild).

---

## 5. Produktions-Stand (Film)

### Szene 01 — „Die Verfolgung" → `productions/scene01_the-chase.md`
Fertige, generierfertige Shotlist. Kern der Überarbeitung: **eigener Laufstil
pro Maus**, **sichtbare Angst**, **Stimmung** und **subtile Micro-Gestures**
(Secondary Animation: Fell, Arme, Beine, Schwanz, Schnurrhaare, Ohren).

**Seedance-Workflow (Higgsfield):**
- **Model:** `seedance_2_0` · **720p** · **mode: fast** · `bitrate_mode: high`
- **10s** je Shot · **16:9** · `generate_audio: false`
- Character-Referenzen per `@`-Handle als `image_references` (`@Cal @Liv @Sammy @Biff`)
- **`genre`-Parameter** pro Shot (action/comedy/drama) = „Cinema-Look"
- 8 Shots inkl. Kamera, Licht, Stimmung, Micro-Motion; Dialog **nur aus
  Drehbuch-Canon** (Shots ohne Zeile bleiben stumm).

**Produktions-Standard (gilt für jede Szene):** Jeder Shot hat **Blocking**
(Screen Direction, 180°-Regel, Staging) und einen **Kamera-Bewegungsstil**
(handheld, steadicam, dolly, crane, drone, whip-pan, crash-zoom …). Vokabular &
Regeln in `productions/CAMERA_AND_BLOCKING.md`; im Studio-Modul fest verankert
(CineForge liefert Blocking + camera_movement automatisch).

**Erkenntnis Higgsfield-Library:** Die „Presets/Skills" dort sind virale
One-Shot-Templates (kein generischer CGI/Cinema-Skill). Der Look entsteht bei
uns über Referenzen + `genre` + Prompt (Stil-Cue „consistent 3D CGI animated
feature film look").

---

## 6. Externe Ressourcen & Tools

| Ressource | Wofür | Zugang |
|-----------|-------|--------|
| **Google Drive** | Alle Film-Assets: Drehbuch/Trailer-PDFs, Proof-of-Concept, Seedance-Videos, Premiere-Projekte, Social-Clips (`Wondering_Bexly_Social`) | Drive-MCP (User dlaudowicz@googlemail.com) |
| **Higgsfield / Seedance** | Bild- & Video-Generierung (Film-Shots) | MCP `generate_image`/`generate_video`, `models_explore`, `presets_show` |
| **Firecrawl** | Web-Recherche fürs Research-Modul | Cloud-API, Key `FIRECRAWL_API_KEY` |
| **GitHub** | Repo, PRs, CI | MCP (nur Repo `dlaudowicz-cmyk/first-start`) |

Schlüssel-Dokumente im Drive:
- `09032026.BEING BEXLY_DREHBUCH_TRAILER.pdf` — Trailer-Drehbuch
- `BeingBexleyCalSammyLiv.v3_PROD._CLEAN.pdf` — Proof of Concept (Szene 1–12)
- `2025.11.27_BEING BAXTER_PITCH_PROJEKT.pdf` — Pitch/Strategie (alter Titel)

---

## 7. Offene Punkte / To-dos

**Marke (in `brand_core.md` ergänzen, sobald festgelegt):**
- [ ] Offizielle Markenfarben (Hex), Logo-Final, Claim/Slogan
- [ ] Social-Handles, Website-Domain

**Produktion:**
- [ ] Szene 01 tatsächlich generieren (Seedance) & Assets ablegen/tracken
- [ ] Character-Referenzen (`@`-Handles) final anlegen/bestätigen
- [ ] Weitere Szenen ausarbeiten (nächste: Keller / erste Half-Dome-Verbindung)

**Bexly OS (Code):**
- [ ] Web-Modul (Landingpage-Texte)
- [ ] Quest-System definieren & bauen
- [ ] Optional: Web-Dashboard als Steuerzentrale
- [ ] Studio: Import fertiger Shotlists aus `productions/*.md` ins Trackingmodell

---

## 8. Wie geht's weiter? (für die nächste Session)

1. **Lies zuerst** `brand_core.md` (Markenkern) und dieses Dokument.
2. Der Branch ist `claude/bexly-os-ai-9RgQb` — dort committen & pushen.
3. Für Film-Prompts: Muster in `productions/scene01_the-chase.md` übernehmen
   (Seedance 720p/fast, `@`-Refs, `genre`, Laufstil + Angst + Stimmung +
   Micro-Motion, Canon-Dialoge).
4. Marken-Änderungen immer in `brand_core.md` — nie im Code.
5. Neue Deliverables committen (Container ist flüchtig!).

---

## 9. Kontakt / Rechte

- **RED SUN FILMS GMBH**, Dr.-Max-Straße 10, 82031 Grünwald · info@redsunfilms.com
- IP vollständig eigen (KI-First, rechtlich sauber — keine Fremd-Copyrights).
