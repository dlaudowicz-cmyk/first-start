# Being Bexly — Kostenmodell der Produktions-Pipeline

> Stand: 08/2026 · Grundlage für Kalkulation und Finanzierungsgespräche.
> Rechner: `tools/kostenrechner.py` (Annahmen dort justierbar).
> **Alle Stückkosten sind real verifiziert** (durchgeführte Generierungen),
> alle Annahmen sind als solche gekennzeichnet.

---

## 1. Die Preisbasis — und warum wir mit dem Listenpreis rechnen

| | Betrag | Preis je Credit |
|---|---|---|
| Higgsfield Creator, 24 Monate à 6.000 Credits = **144.000 Credits** | | |
| **Listenpreis** | 6.000 € | **4,167 Cent** |
| Tatsächlich gezahlt (Rabattaktion) | 700 € | 0,486 Cent |

**Nach außen wird ausschließlich mit dem Listenpreis gerechnet.** Gründe:
1. Der Rabatt ist eine einmalige Aktion — nicht planbar wiederholbar.
2. Eine Kalkulation, die auf einer Sonderaktion beruht, bricht zusammen, sobald
   sie ausläuft. Genau danach fragt jedes Gremium.
3. **Auch zum vollen Listenpreis ist das Ergebnis dramatisch günstig.** Das
   Argument braucht den Rabatt nicht — es wird durch ihn nur unnötig angreifbar.

Der gezahlte Preis bleibt die *interne* Sicht (echter Liquiditätsbedarf).

---

## 2. Verifizierte Stückkosten

| Leistung | Credits | Verifiziert durch |
|---|---|---|
| 10s Clip, figurentreu (seedance_2_0, 720p, fast) | **35** | Cal/Liv/Sammy-Tests |
| 10s nachträglich vertonen (video_edit + Audio) | **20** | Job `901c285e` |
| Dialogzeile (TTS, eigenes Stimm-Element) | **0,7** | Cal-Zeile |
| Keyframe für Planung/Review (1k) | **2** | Cal-Keyframe |

---

## 3. Kosten je Minute fertigem Material

Annahme **Trefferquote**: nicht jede Generierung ist brauchbar. Modelliert als
Anzahl Versuche je verwendbarem Clip.

### 720p / fast — Stand der verifizierten Pipeline
| Szenario | Versuche/Clip | Credits/Min | **€/Min (Liste)** | €/Min (gezahlt) |
|---|---|---|---|---|
| Optimistisch | 2 | 568 | **23,68 €** | 2,76 € |
| **Realistisch** | **3** | **814** | **33,92 €** | 3,96 € |
| Konservativ | 4 | 1.060 | **44,17 €** | 5,15 € |

### Hochgerechnet (realistisches Szenario, Listenpreis)
| Umfang | Credits | € (Liste) |
|---|---|---|
| **Proof of Concept (3 Min)** | 2.443 | **≈ 102 €** |
| **Spielfilm (90 Min)** | 73.278 | **≈ 3.053 €** |

> Der 90-Minüter entspricht **12,2 Monatskontingenten** — also gut einem Jahr
> des bereits bezahlten Vertrags.

### ⚠️ Kino-Qualität — Zielformate und der Weg dahin
Die 35 Credits gelten für **720p im fast-Modus über Higgsfield**.
**Zielformate: Kino 4K/10-bit, Social Full HD/10-bit.**

#### Korrektur: Die Auflösungsgrenze ist Higgsfield, nicht Seedance
| | Auflösung | Quelle |
|---|---|---|
| **Seedance 2.5 nativ** | **bis 4K** (720p / 1080p / 4K), 21:9 möglich, 30s Single-Shot, bis 50 Referenzen | Modell-Dokumentation |
| **Higgsfield-Durchreichung** | nur **480p / 720p** | `models_explore`, verifiziert |
| **Unsere gelieferten Dateien** | 720p, h264 High, `yuv420p` = **8-bit** | ffprobe, verifiziert |

**Das ist die wichtigste technische Erkenntnis für die Kinoauswertung:** Der
Flaschenhals ist die **Plattform, nicht das Modell**. Für Kinoformate führt der
Weg über **direkten Modellzugang** statt über Higgsfield — mit eigener, noch zu
ermittelnder Preisstruktur.

#### Welcher Direktzugang? (präzisiert)
ByteDance betreibt **zwei nicht austauschbare** Plattformen:

| Plattform | Region | Für uns |
|---|---|---|
| **Volcano Engine Ark** | China-Konsole, CNY-Abrechnung | ❌ nicht relevant |
| **BytePlus ModelArk** | international, **USD-Abrechnung**, internationale Compliance | ✅ **das ist unser Weg** |

- Seedance 2.5 API international verfügbar seit **16.07.2026** über BytePlus ModelArk.
- **Es gibt eine EU-Datenebene (`eu-west-1`)** — relevant für DSGVO und für
  Förderanträge, bei denen Datenverarbeitung geprüft wird. Aktiv als Argument nutzen.
- BytePlus ModelArk führt **eigene Seedance-2.5-Preise** — diese sind für die
  Kino-Kalkulation maßgeblich, nicht der Higgsfield-Creditpreis.

#### BytePlus-Preise — recherchiert (Stand 08/2026)
| Auflösung | Preis | 10s-Clip | je Minute |
|---|---|---|---|
| 480p | $0,09/s | $0,90 | ≈ 4,97 € |
| **720p** | **$0,21/s** | $2,10 | ≈ 11,59 € |
| **1080p** | **nicht veröffentlicht** | — | — |
| **4K** | **nicht veröffentlicht** | — | — |

Abrechnung tokenbasiert ($10,70/1 Mio. Token ohne Video-Input, $6,40 mit
Video-Input), fester Sekundenpreis je Auflösung, Clips 4–30 s, **keine
Grundgebühr und kein Aufpreis für Audio**. *(Umrechnung mit angenommenem Kurs
1 USD ≈ 0,92 €.)*

#### ⚠️ Zwei Ergebnisse, die die Erwartung umkehren

**1. Die Kino-Kalkulation lässt sich noch nicht abschließen.**
BytePlus veröffentlicht Preise **nur für 480p und 720p**. Ohne offizielle
1080p-/4K-Tarife ist jede Kinokalkulation eine Erfindung. Der angenommene
Faktor 2,5 bleibt damit **offen** — das ist die ehrliche Antwort.

**2. Higgsfield ist bei 720p günstiger als der Direktzugang.**
| | 10s-Clip 720p | je Minute (3 Versuche) |
|---|---|---|
| Higgsfield (Listenpreis) | **1,46 €** | 26,25 € |
| BytePlus direkt | 1,93 € | 34,78 € |
| Higgsfield (dein Rabatt) | 0,17 € | 3,06 € |

Higgsfield ist zum **Listenpreis rund 25 % günstiger** als der direkte
Modellzugang — Abo-Bündelung schlägt Pay-per-Use. **Der Grund, zu BytePlus zu
wechseln, ist also die Auflösung, nicht der Preis.**

Für Social (Full HD) und Kino (4K) führt der Weg trotzdem über BytePlus, sobald
die Tarife dort veröffentlicht sind — **oder über einen anderen Anbieter, der
1080p+ durchreicht.** Das ist vor der Kalkulation zu klären.

⚠️ **Zusätzlicher Prüfpunkt:** In der Fachpresse wird zu Seedance 2.5 auf
**ungeklärte urheberrechtliche Fragen** hingewiesen. Für einen öffentlich
geförderten Film ist Rechtekette und Rechteklarheit ein Prüfkriterium —
**vor Antragstellung die Nutzungsbedingungen von BytePlus prüfen** (kommerzielle
Nutzung, Rechteübertragung am Output, Trainingsdaten-Zusicherungen).

**10-bit:** Nach Produktionsangabe unterstützt Seedance 10-bit. Öffentlich
dokumentiert ist das nicht; unsere Higgsfield-Ausgabe ist nachweislich 8-bit.
**Vor der Kalkulation gegen die offizielle Volcano-Engine-Dokumentation
verifizieren** — davon hängt ab, ob ein echtes 10-bit-Negativ entsteht oder nur
ein 10-bit-Container über 8-bit-Information.

**Nebeneffekt für die Produktion:** 30s natives Single-Shot statt 10s bedeutet
weniger Schnitte, bessere Kontinuität — und verändert die Stückkostenrechnung
zugunsten längerer Einstellungen.

Für die Zwischenzeit, mit **angenommenem Faktor 2,5** (720p→Zielqualität):

| Umfang | Credits | € (Liste) |
|---|---|---|
| Proof of Concept (3 Min) | 6.106 | ≈ 254 € |
| Spielfilm (90 Min) | 183.195 | ≈ 7.633 € |

**Dieser Faktor ist eine Annahme und muss vor jeder offiziellen Kalkulation
durch einen Testlauf in Zielqualität verifiziert werden.** (Kosten dafür: eine
Handvoll Credits — sollte vor dem ersten Fördergespräch passieren.)

---

## 4. Die zentrale Erkenntnis: der Engpass ist nicht das Geld

| | Kapazität |
|---|---|
| **Rechenleistung** (6.000 Credits/Monat) | ≈ **7,4 Min/Monat** |
| **Menschliche Arbeitszeit** (6 h Produktion/Woche, solo) | ≈ **2–4 Min/Monat** |

**Die Rechenleistung ist doppelt bis dreifach im Überschuss. Der Engpass ist die
Arbeitszeit.**

Daraus folgt die Finanzierungslogik direkt:
- Solo, 15 h/Woche → ein 90-Minüter dauert **rechnerisch ~2–4 Jahre**
- Mit einem kleinen finanzierten Team → **Bruchteil dieser Zeit**

> **Die Bitte an Financiers ist damit nicht mehr „bezahlt uns die Animation",
> sondern „bezahlt uns ein kleines Team, das die Maschine bedient".**
> Das ist eine erheblich kleinere und besser begründbare Summe.

---

## 5. Was in diesen Zahlen NICHT enthalten ist

**Das ist der wichtigste Abschnitt.** Wer die Rechenkosten mit einem Filmbudget
verwechselt, verliert im ersten Gespräch die Glaubwürdigkeit.

Nicht enthalten:
- **Arbeitszeit** — Regie, Prompting, Review, Schnitt, Sounddesign *(der jetzt
  dominierende Kostenblock)*
- Stoffentwicklung, Drehbuch, Storyboard
- **Sprecher** — die Besetzung steht bereits mit echten Schauspielern
- Musik (Komposition oder Lizenz) und finale Tonmischung
- Schnitt, Color Grading, Mastering
- Produzentenhonorar, Overhead, Versicherung, Rechtsberatung
- Marketing, Festival, Verleih

**Korrekte Formulierung für Gespräche:**
> „KI macht den Film nicht kostenlos. Sie verschiebt den größten Kostenblock —
> die Animationsherstellung — von einem sechs- bis siebenstelligen Posten auf
> einen vierstelligen. Alle anderen Gewerke bleiben bestehen."

---

## 6. Der Vergleich zur klassischen Produktion

**Recherchiert — Details in `marktvergleich_animation.md`.**

| | €/Minute | 90-Minüter (Animation) |
|---|---|---|
| Mittelklasse Europa 3D (Vergleichsklasse) | 8.000–15.000 € | 0,72–1,35 Mio € |
| **Bexly-Pipeline, Vollkosten inkl. Arbeitszeit** | **800–2.400 €** | **72.000–216.000 €** |

**→ Faktor 4–10 günstiger.** Wichtig: Es wird mit **Vollkosten** verglichen
(Arbeitszeit + Rechenleistung), nicht mit den nackten 34 €/Min Rechenkosten —
sonst ist das Argument sachlich falsch und vor Fachleuten wertlos.

Die Vergleichszahl sollte zusätzlich **von Red Sun Films validiert werden** —
Rainer kennt reale Kalkulationen aus der Branche.

Das ist auch strategisch besser:
- Eine Zahl vom erfahrenen Produzenten ist vor Gremien belastbarer als eine
  recherchierte.
- Es bindet Rainer inhaltlich in das Argument ein, statt es ihm vorzusetzen.

**Konkrete Bitte an ihn:** „Was kostet bei einer klassischen Produktion die
fertige Animationsminute in unserem Qualitätssegment?" — Diese eine Zahl neben
unsere gestellt ergibt die entscheidende Folie des Pitches.

---

## 7. Belastbarkeit & Vorbehalte

| Punkt | Status |
|---|---|
| Stückkosten (35/20/0,7/2 Credits) | ✅ real verifiziert |
| Trefferquote 1:3 | ⚠️ Schätzung aus kleiner Stichprobe — mit jedem Batch nachschärfen |
| Faktor 2,5 für Kinoqualität | ⚠️ **unverifiziert** — Testlauf nötig |
| Seedance nativ bis 4K (nicht 720p) | ✅ recherchiert — Higgsfield ist der Flaschenhals |
| 10-bit-Fähigkeit von Seedance | ⚠️ Produktionsangabe; öffentlich nicht dokumentiert — gegen Volcano-Engine-Doku prüfen |
| BytePlus-Preise 480p/720p | ✅ recherchiert ($0,09 / $0,21 je Sekunde) — **Sekundärquellen**, offizielle Doku war nicht erreichbar; vor Kalkulation gegenprüfen |
| **BytePlus-Preise 1080p/4K** | ❌ **nicht veröffentlicht** — Kino-Kalkulation bis dahin nicht abschließbar |
| Higgsfield vs. Direktzugang bei 720p | ✅ Higgsfield (Liste) ~25 % günstiger — Wechselgrund ist Auflösung, nicht Preis |
| Rechtliche Nutzungsbedingungen des Modellanbieters | ⚠️ **ungeprüft** — Rechte am Output, kommerzielle Nutzung, Trainingsdaten. Für Förderanträge kritisch. |
| EU-Datenebene `eu-west-1` verfügbar | ✅ recherchiert — DSGVO-Argument für Anträge |
| Higgsfield-Preisstabilität | ⚠️ Anbieterrisiko; Pipeline ist modell-agnostisch angelegt (Blueprint V2) — als Risikoargument aktiv nutzen |
| Qualitätsniveau für Kinoauswertung | ⚠️ Muss am Proof of Concept bewiesen werden, nicht behauptet |

---

## 8. Nächste Schritte
1. **Testlauf in Zielqualität** (1080p/std) → Faktor 2,5 verifizieren oder korrigieren.
2. **Trefferquote messen** — ab dem nächsten Batch mitzählen (Versuche vs. verwendet).
3. **Rainer nach der klassischen Vergleichszahl fragen.**
4. Zahlen in Pitch-Deck und Kalkulation überführen.
