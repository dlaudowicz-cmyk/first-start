# Production Workflow

Ein Workflow, der wiederholbar, Brand-safe und skalierbar ist.
Jede Etappe hat klare Outputs und mindestens eine Qualitätskontrolle.

---

## 0. Wochenrhythmus (Empfehlung)

| Tag       | Aufgabe                                                  |
|-----------|-----------------------------------------------------------|
| Montag    | Recherche & Themen-Triage (1,5h)                          |
| Dienstag  | Skripte & Hooks (2h)                                      |
| Mittwoch  | Dreh-Block (4–6h, 8–14 Kurzvideos)                        |
| Donnerstag| Schnitt + QA (4h)                                         |
| Freitag   | Posting + Manipulation-der-Woche (2h)                     |
| Samstag   | Newsletter-Versand                                        |
| Sonntag   | Auswertung & Hypothesen für nächste Woche (1h)            |

---

## 1. Recherche

**Ziel:** Eine Liste von 10–15 Beobachtungen aus der Woche, aus denen
3–5 Skripte entstehen.

**Quellen:**
- Schlagzeilen aus 4–6 unterschiedlich positionierten Medien.
- Pressestatements (Politik, Wirtschaft, Sport, Kultur).
- Werbeanzeigen (Print, OOH, Social).
- Talkshow-Ausschnitte (max. 3 Minuten anhören, nicht ganze Sendungen).
- 1–2 Fachartikel aus Medien-/Wahrnehmungspsychologie.

**Format der Notizen (Recherche-Sheet):**

| Beobachtung | Quelle/Setting | Vermuteter Mechanismus | Lager-Streuung? |
|-------------|----------------|------------------------|-----------------|
| z. B. „Wort *drängt*" | Politik-Talk | Verlustaversion | findet sich auch in Wirtschaftspresse |

**QA-Check Recherche:**
- Mindestens **eine** Beobachtung pro Mechanismus aus **mindestens zwei
  unterschiedlichen** Lagern/Branchen. Sonst: zurück in die Recherche.

---

## 2. Analyse

**Ziel:** Aus 10–15 Beobachtungen 3–5 mit echter Mechanik filtern.

**Filterkriterien:**
1. **Trennbarkeit:** Lässt sich der Mechanismus *ohne* die Originalquelle
   erklären?
2. **Übertragbarkeit:** Funktioniert er auf mindestens drei
   unterschiedlichen Themenfeldern?
3. **Brand-Safe:** Lässt er sich anonymisiert/generisch erzählen?
4. **Lehrwert:** Versteht eine kommunikationsferne Person den Mechanismus
   in unter einer Minute?

Wenn alle vier Antworten „ja": ins Skript-Backlog.

---

## 3. Skript

**Ziel:** Ein produktionsreifes Skript je Idee.

**Schritte:**
1. Rubrik wählen → entsprechende Vorlage aus `script_templates.md`.
2. Hook aus `hook_database.md` wählen — oder neue formulieren
   (Regel: max. 12 Wörter, keine Ragebait-Sprache).
3. Skript ausfüllen, **laut** lesen, mit Stoppuhr testen.
4. Brand-Phrasen-Check (siehe Liste in `script_templates.md`):
   - „Ein möglicher Effekt ist…"
   - „Beobachtbar ist…"
   - „Das macht es nicht falsch — es macht es wirksam."
5. Lager-Test: gibt es im Skript explizit ein Beispiel, das die Technik
   auch auf der „anderen Seite" sichtbar macht? Falls nein und Thema ist
   politisch sensibel: Pflicht.
6. Approval-Schritt: Skript geht durch das **Safety-Lint** aus
   `safety_and_positioning_rules.md`.

---

## 4. Dreh

**Setup (Standard):**
- Raum dunkel, Hintergrund schwarz/Beton, kein Set-Dressing.
- Spotlight von vorne-oben, kalter Rim, Negative Fill seitlich.
- Brennweite 40–50mm anamorphisch, max. 5–10% sehr langsamer Push-In.
- Mikrofon nah, warm, Headphone-Monitoring.
- 9:16 als Primärformat, 16:9 parallel aufzeichnen (Cropping-Reserve).

**Performance-Regie:**
- Hook *in die Linse*, eine kleine Pause, dann Skript.
- Schlüsselwörter mit Mikro-Pause davor.
- Take 1: ehrlich. Take 2: ruhiger. Take 3: mit alternativer Hook.
- Maximal 5 Takes pro Skript — sonst zurück ins Skript.

**Drehblock-Logik:**
- Pro Block 8–14 Kurzvideos.
- Wechsel zwischen Rubriken alle 2–3 Takes (verhindert Tonalitäts-Drift).
- 1 Längere Folge pro Block (für YouTube Longform).

---

## 5. Schnitt

**Schritt-Reihenfolge:**
1. Auswahl der besten Takes (Anhand Hold-Sekunde 0–3).
2. Schnitt auf Bedeutung (siehe `visual_identity.md`, Abschnitt 6).
3. Typografische Projektionen für Schlüsselwörter.
4. Score auf −18 bis −22 LUFS unter der Stimme.
5. Sting nur bei der zentralen Hervorhebung.
6. Captions: Markierungen, nicht Wiederholungen.
7. Letzter Frame ruhig.

**Plattform-Cuts:**
- TikTok: 9:16, Caption-Stil dezent (siehe Visual Identity), eigene
  Hook-Variante in der Headline.
- Instagram Reels: identischer Cut, leicht angepasste Caption,
  alternative Cover-Frame.
- YouTube Shorts: identischer Cut, expliziter SEO-Titel.
- LinkedIn: identischer Cut, längere Hook-Variante, Text-Carousel
  als Begleit-Post.

**QA-Lint vor Export:**
- Hook in den ersten 1,5 Sek. ✅
- Mechanik benannt ✅
- Twist vorhanden ✅
- CTA ohne Hardsell ✅
- Konjunktiv bei Intention ✅
- Mindestens implizit erkennbar: Technik ist nicht lagerspezifisch ✅
- Keine Ragebait-Caption ✅
- Letzter Frame ruhig ✅

---

## 6. Posting

**Zeiten (Startannahmen, dann datengetrieben anpassen):**
- TikTok: Di/Do 18:30, Sa 11:00
- Instagram Reels: Mo/Mi 19:00
- YouTube Shorts: Di 09:00, Fr 17:00
- LinkedIn: Di/Do 08:00 und 12:30
- YouTube Longform: Sa 10:00
- Newsletter: So 09:00

**Caption-Standard (TikTok/Reels/Shorts):**
> *Hook als ersten Satz, identisch zur gesprochenen Hook.*
> 2–3 Sätze, die den Mechanismus benennen.
> Eine offene Frage, keine Empörungs-Aufforderung.
> Hashtags: 3–5, neutral
> (`#Medienpsychologie`, `#Framing`, `#Mentalismus`,
> `#Kommunikation`, `#Mechanik`).

**LinkedIn-Caption-Standard:**
> Erster Absatz: Beobachtung in einem Satz.
> Zweiter Absatz: 3 Bauteile als Liste.
> Dritter Absatz: Relevanz für Führung/Comms.
> Eine Frage am Ende, eine reflexive — keine
> „Was-meinst-du?"-Standardfloskel.

---

## 7. Auswertung

**Kennzahlen pro Video (kein Vanity-Bias):**
- **Hold @ 3s** (Stoppen Zuschauer nach der Hook?)
- **Completion-Rate**
- **Saves / View**
- **Shares / View**
- **Newsletter-Signups via Bio-Link**
- **Kommentar-Qualität** (sample-basiert, manuell, 5-Punkte-Skala)

**Wochenreview:**
- Top 3 Videos: was war die Hook? welche Rubrik? welche Mechanik?
- Bottom 3 Videos: Hook zu schwach, Mechanik zu abstrakt, oder
  Tonalität entgleist?
- Eine Hypothese für die Folgewoche: was teste ich anders?

---

## 8. Rollen (Soloproduktion → Team)

**Stufe 1 — Solo:**
Nico macht alles. Wochenrhythmus diszipliniert halten.

**Stufe 2 — +1 Editor:**
Nico: Recherche, Skript, Performance. Editor: Schnitt, Posting,
Plattform-Cuts.

**Stufe 3 — +1 Researcher / Producer:**
Researcher: Beobachtungs-Sheet, Quellenarbeit, Newsletter-Texte.
Producer: Wochenplan, QA, Stakeholder-Kommunikation.

**Stufe 4 — Format-Studio:**
+ Sound Designer, + Motion Designer für Longform, + Trainer für
Corporate-Programme.

---

## 9. Notfall-Workflow „Heißes Thema"

Wenn ein aktuelles Thema in den Top 3 der öffentlichen Aufmerksamkeit
explodiert:

1. **24h Pause.** Kein Reaktions-Posting.
2. Drei Quellen aus drei unterschiedlichen Lagern sichten.
3. Eine Mechanik filtern, die *unabhängig* vom Thema funktioniert.
4. Skript nach Template D (Manipulation der Woche).
5. Vor Posting: Lager-Test (mind. 2 unterschiedliche Lager im Video).
6. Posting frühestens 36–72h nach dem Höhepunkt der Empörung.

> Wir gewinnen nicht durch Schnelligkeit. Wir gewinnen durch
> Differenzierung.
