# Szene 01 — Die Verfolgung (The Chase) · Seedance-optimiert

> Ort: Wald vor Moe's Farm, außen/Tag. Biff jagt Cal, Liv und Sammy, bis sie
> sich in einen hohlen Baumstamm retten.
> Fokus: **eigener Laufstil pro Maus** + **sichtbare Angst**.

## Setup (Higgsfield / Seedance 2.0)

- **Model:** `seedance_2_0`  ·  **Mode:** `std`  ·  **Auflösung:** `1080p` (bei
  Bedarf `4k`)  ·  **bitrate_mode:** `high` (sauberes CGI)
- **Dauer:** **10s** (jeder Shot)  ·  **aspect_ratio:** `16:9`
- **image_references:** deine Character-Refs `@Cal`, `@Liv`, `@Sammy`, `@Biff`
  (für konsistente Identität)  ·  **generate_audio:** `false` (Ton/VO separat)
- **genre:** pro Shot gesetzt (ersetzt den „Cinema-Skill" — action/comedy/drama)

> Hinweis: Ein generischer „CGI/Cinema-Skill" existiert in der Higgsfield-
> Preset-Library nicht (die Presets sind virale One-Shot-Templates). Der Look
> kommt hier aus Referenzen + genre + Prompt. „Consistent CGI animated feature
> look" steht daher als Stil-Cue mit im Prompt.

**Stil-Cue (in jedem Prompt):** *consistent 3D CGI animated feature film look,
Pixar/DreamWorks quality, cinematic lighting, shallow depth of field, 24fps.*

---

## RUN & FEAR SHEET
| Maus | Laufstil | Angst sichtbar durch |
|------|----------|----------------------|
| **@Cal** | frantisch, tief geduckt, Arme pumpen, stolpert beim Zurückblicken, Schwanz flattert | weit aufgerissene Augen, angelegte Ohren, ständiger Schulterblick |
| **@Liv** | athletisch, springt über Wurzeln, scharfe Richtungswechsel, führt an | zusammengebissener Kiefer, Augen scannen — kontrollierte Angst |
| **@Sammy** | chaotisch, hüpfend, überschlägt sich, hält Futter fest | schreiender Mund, wackelnde Wangen — comichafte Panik |

---

## SHOTS (je 10s · seedance_2_0)

### Shot 1 — Establishing: der Ausbruch
- **refs:** @Cal @Liv @Sammy @Biff · **genre:** `action`
> Three tiny field mice @Cal, @Liv and @Sammy burst from the undergrowth and
> sprint toward camera in full panic, huge farm dog @Biff thundering right behind
> kicking up dirt and leaves. Wide side-tracking shot moving with them, low golden
> morning backlight, god-rays, dust, motion blur. Consistent 3D CGI animated
> feature film look, cinematic, shallow depth of field.

### Shot 2 — @Cal (Laufstil + Angst)
- **refs:** @Cal · **genre:** `action`
> @Cal sprints low to the ground, arms pumping hard, tail streaming behind, wide
> terrified eyes and ears pinned flat back, glances over his shoulder and stumbles
> on a root. Close low-angle tracking shot, warm morning rim-light, heavy motion
> blur, kicked-up dust. Consistent 3D CGI animated feature film look, cinematic.
- **Dialog** — @Cal (OFF): „Warum habe ich nicht auf mein Bauchgefühl gehört? Ich
  habe ihnen doch gesagt, dass das gefährlich ist!"

### Shot 3 — @Liv (Laufstil + Angst)
- **refs:** @Liv · **genre:** `action`
> @Liv leaps athletically over roots and stones with sharp direction changes,
> jaw clenched, eyes darting to scan for an escape, leading the group. Dynamic
> side-tracking shot that jumps with her, crisp morning light, motion blur on the
> leaps. Consistent 3D CGI animated feature film look, cinematic.
- **Dialog** — @Liv: „Cal! Achtung!"

### Shot 4 — @Sammy (Laufstil + Angst)
- **refs:** @Sammy · **genre:** `comedy`
> @Sammy runs in chaotic panic, arms windmilling, tripping and tumbling head over
> heels then popping back up mid-run, mouth wide in a comedic scream, still
> clutching a crumb of food. Half-close tracking shot, slightly low comedic angle,
> warm playful light, motion blur. Consistent 3D CGI animated feature film look.

### Shot 5 — @Biff schnappt nach @Cals Schwanz
- **refs:** @Biff @Cal · **genre:** `action`
> The enormous snout of @Biff lunges into foreground, jaws snapping just behind
> @Cal's streaming tail as Cal's head whips around in fear. Low-angle from behind
> Cal, dramatic backlit contrast, spraying dirt, extreme motion blur. Consistent
> 3D CGI animated feature film look, tense, cinematic.

### Shot 6 — @Liv entdeckt den hohlen Baumstamm
- **refs:** @Liv · **genre:** `drama`
> @Liv's gaze snaps to a fallen hollow log with a dark opening at its end, a single
> god-ray highlighting it like an escape; her eyes lock on with a spark of hope
> through the fear. Quick whip-pan following her look, dewy moss. Consistent 3D CGI
> animated feature film look, cinematic.
- **Dialog** — @Liv: „Hier lang!"

### Shot 7 — Der Sprung in den Stamm
- **refs:** @Liv @Cal @Sammy @Biff · **genre:** `action`
> @Liv dives cleanly into the dark opening of the hollow log first, @Cal scrambles
> in after her, @Sammy tumbles in last still holding his crumb, @Biff bearing down
> right behind. Side shot, dust and leaves flying, morning light, motion blur.
> Consistent 3D CGI animated feature film look, cinematic.

### Shot 8 — @Biff knallt gegen den Stamm, Mäuse schießen heraus
- **refs:** @Biff @Cal @Liv @Sammy · **genre:** `comedy`
> @Biff slams his head against the outside of the hollow log and slumps down dazed
> with swirling stars, while at the far end @Cal, @Liv and @Sammy shoot out and land
> in a tangled heap on soft green moss. Wide comedic shot, dust cloud, dappled
> morning light. Consistent 3D CGI animated feature film look.
- **Dialog** — @Sammy (im Moos): „Das war echt aufregend!"

---

## Nutzung
- Pro Shot: `seedance_2_0`, `duration:10`, `resolution:1080p`, `mode:std`,
  `bitrate_mode:high`, `aspect_ratio:16:9`, Character-Refs als `image_references`,
  `genre` wie oben, `generate_audio:false`.
- Dialog ausschließlich Drehbuch-Canon; Shots ohne Zeile bleiben stumm.
- Shots 2–4 getrennt → jeder Laufstil einzeln generierbar & vergleichbar.
- In Studio-Modul ladbar (`Studio.add_shot(...)`) zum Tracking von Status & Assets.
