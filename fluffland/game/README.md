# FLUFFLAND – Fluff-Zug (Spiel)

Ein sanftes Snake-Spiel für sehr kleine Kinder (2–6), passend zur
[Series Bible](../SERIES-BIBLE.md): **kein Gewinnen/Verlieren, kein Stress.**

**Crossi** führt eine wachsende Kette aus **Mini-Fluffs** an und sammelt weiche
**Stoff-Sterne** ⭐. Jeder Stern bringt einen neuen Mini-Fluff in den Zug.

## Spielen

Die Datei `index.html` einfach im Browser öffnen (Doppelklick) – läuft komplett
offline, ohne Installation, auf Mac und Tablet.

## Steuerung

- **Tastatur:** Pfeiltasten oder WASD
- **Touch:** Wischen auf dem Spielfeld **oder** die großen Pfeil-Buttons

## Kinderfreundliches Design

- **Kein Game-Over:** Wände sind durchlässig (man kommt auf der anderen Seite wieder heraus).
- **Kein Schaden:** Durch den eigenen Zug laufen ist harmlos.
- **Kein Zeitdruck, kein Punktestand** – nur die fröhliche Zahl der „Freunde im Zug".
- Pastellpalette und weiche Figuren gemäß FLUFFLAND-Canon.

## Premium-Features

- Retina-scharfes Rendering, plüschige Farbverläufe, weiche Schatten, Vignette & Sonnenlicht.
- Startbildschirm mit Master-Key-Visual und „Meet the friends"-Galerie.
- Wählbarer Anführer (Crossi/Nana/Manny/Lunelle) und Ort (Café/Sternengarten/See/Wald).
- Juice: Squash beim Einsammeln, Glitzer-Staub-Spur, pulsierender Stern, Blinzeln.
- Meilenstein-Banner + sanfter Akkord alle 5 Freunde · Sound- und Pause-Button.

## Offizielle Assets

Der Startscreen lädt das Master-Key-Visual und die Charakter-Karten direkt von der
Higgsfield-CDN. Die **Zug-Glieder sind echte Plüsch-Mini-Fluff-Sprites** (4 Pastell­farben,
2 davon mit Zöpfen), per weicher Kreis-Maske eingebunden (weiße Ecken werden weggeschnitten).
Die Anführer sind aktuell Canvas-gezeichnet (ihre Karten haben grauen Hintergrund).

> Hinweis: Echtes Freistellen (transparente PNGs) braucht das `remove_background`-Tool,
> das in dieser Umgebung freigabepflichtig ist; sobald verfügbar, können die Sprites
> randlos eingebunden und auch die Anführer als echte Figuren ergänzt werden.

**Dauerhaft/offline machen:** die PNGs in `fluffland/game/assets/`
herunterladen und in `index.html` `ASSET_BASE = "assets/"` setzen.

## Technik

- Eine einzelne HTML-Datei (Canvas + Vanilla JS, keine Abhängigkeiten).
- Spielfiguren sind mit Canvas gezeichnet (robust/offline, freigestellt); die
  Render-Assets dienen aktuell für Startbild & Galerie.
