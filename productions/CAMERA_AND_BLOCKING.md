# Kamera-Sprache & Blocking — Produktions-Standard

> Verbindliche Referenz für alle Bexly-Szenen. Das Studio-Modul (CineForge) und
> jede Shotlist nutzen dieses Vokabular. Ziel: konsistente, filmische Shots mit
> sauberer räumlicher Kontinuität.

---

## A. BLOCKING (Staging) — immer festlegen

Für jede Szene vor den Shots definieren:

1. **Screen Direction** — Hauptbewegungsrichtung (links→rechts oder rechts→links).
   Über alle Shots konsistent halten, sonst „springt" die Handlung.
2. **180°-Regel** — eine gedachte Achse zwischen den Figuren nicht überschreiten;
   wer links/rechts steht, bleibt links/rechts (z. B. Verfolger immer hinten/links).
3. **Staging / Positionen** — wer steht/läuft wo, in welcher Reihenfolge, Abstände.
4. **Eyelines** — Blickrichtungen müssen zueinander passen (A schaut rechts → B
   ist rechts).
5. **Entrances/Exits** — wer kommt wann von welcher Seite ins Bild / verlässt es.
6. **Geografie** — Start, Ziel, wichtige Objekte im Raum (konstant verorten).

Pro Shot als kurze **Blocking**-Notiz ausweisen.

---

## B. KAMERA-BEWEGUNGSSTILE (Camera Movement)

Pro Shot **einen** Stil wählen (passend zu Emotion & Tempo). Prompt-Cue in
*kursiv*.

### Bewegt / dynamisch
- **Handheld / Handkamera** — organisches Wackeln, Unmittelbarkeit, Chaos, Doku-
  Gefühl. *handheld camera, organic shake, urgent*
- **Gimbal** — stabilisiert-flüssig, „schwebendes Handheld". *smooth gimbal move*
- **Steadicam** — gleitende, fließende Verfolgung, schwerelos. *flowing steadicam
  follow*
- **Dolly In / Out** — sanftes Heran-/Wegfahren auf Schienen (Nähe/Distanz
  aufbauen). *slow dolly push-in* / *dolly pull-out*
- **Tracking / Trucking** — seitliches Mitfahren neben dem Subjekt. *lateral
  tracking shot moving with the subject*
- **Arc / Orbit** — Kamera umkreist das Subjekt (Enthüllung, Dramatik). *camera
  arcs around the subject*
- **Crane / Jib** — vertikales Schweben, hebt/senkt sich, großer Maßstab. *sweeping
  crane move rising up*
- **Drone / Aerial** — fliegend, hohe Weite, Reveal von Landschaft/Menge. *aerial
  drone shot flying over*
- **Pedestal** — Kamerakörper hebt/senkt sich gerade (ohne Neigung). *pedestal up*
- **Push-in / Pull-out** — schnelles Ran/Weg (Dolly oder Zoom). *fast push-in*
- **Follow / Chase-Cam** — direkt hinter dem Subjekt mitlaufend. *chase cam
  following from behind*

### Schwenks & Zooms
- **Pan / Tilt** — Kamera schwenkt horizontal / neigt vertikal (fixe Position).
  *slow pan right* / *tilt up*
- **Whip Pan** — blitzschneller Schwenk (harter Übergang, Energie). *fast whip-pan*
- **Zoom In / Out** — optisches Ran/Weg. *slow zoom in*
- **Crash Zoom** — abrupter, schneller Zoom (Schock/Comedy). *sudden crash zoom*
- **Dolly-Zoom (Vertigo)** — Dolly + Gegen-Zoom, Raum „verzieht" sich (Unheimlich,
  Erkenntnis). *vertigo dolly-zoom effect*

### Statisch & speziell
- **Static / Locked-off** — Stativ, keine Bewegung (Ruhe, Komposition). *static
  locked-off shot*
- **POV** — Subjektive, aus Figurensicht. *first-person POV*
- **Dutch Angle** — gekippter Horizont (Spannung, Verzerrung). *dutch tilt*
- **Snorricam / Body-Mount** — Kamera an der Figur montiert, sie „steht", Welt
  wackelt. *body-mounted snorricam*
- **Speed Ramp / Slow-Mo** — Tempo-Wechsel im Shot (Betonung). *speed ramp into
  slow motion*

---

## C. Genre-Hint (Seedance `genre`-Parameter)
`action · comedy · drama · horror · noir · epic` — pro Shot passend zur Stimmung
setzen; ergänzt (ersetzt nicht) den Kamera-Bewegungsstil.

---

## D. Standard-Regel
Jeder Shot einer Bexly-Shotlist enthält: **Blocking**, **Camera Framing/Angle**,
**Camera Movement** (aus B), **Lighting**, **Pacing**, **Stimmung**, **genre**,
**Prompt** (+ optional Canon-Dialog).
