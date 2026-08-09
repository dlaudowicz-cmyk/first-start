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

### ⚠️ Kino-Qualität — Schätzung, NICHT verifiziert
Die 35 Credits gelten für **720p im fast-Modus**. Kinoauswertung braucht höhere
Auflösung und Qualitätsstufe. Mit einem **angenommenen Faktor 2,5**:

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

Die Vergleichszahl für klassische 3D-Animation (Kosten je Filmminute) sollte
**von Red Sun Films kommen** — Rainer kennt reale Kalkulationen aus der Branche.

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
| Higgsfield-Preisstabilität | ⚠️ Anbieterrisiko; Pipeline ist modell-agnostisch angelegt (Blueprint V2) — als Risikoargument aktiv nutzen |
| Qualitätsniveau für Kinoauswertung | ⚠️ Muss am Proof of Concept bewiesen werden, nicht behauptet |

---

## 8. Nächste Schritte
1. **Testlauf in Zielqualität** (1080p/std) → Faktor 2,5 verifizieren oder korrigieren.
2. **Trefferquote messen** — ab dem nächsten Batch mitzählen (Versuche vs. verwendet).
3. **Rainer nach der klassischen Vergleichszahl fragen.**
4. Zahlen in Pitch-Deck und Kalkulation überführen.
