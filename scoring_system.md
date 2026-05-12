# Scoring System

Ein gemeinsames Bewertungssystem, damit Themen-Entscheidungen
**nachvollziehbar** sind und nicht im Bauchgefühl der Redaktion
hängen. Jede Idee bekommt sechs Scores. Die Summe **plus** harte
Stoppregeln entscheiden, ob, wann und in welchem Format das
Thema produziert wird.

---

## 1. Sechs Achsen

Alle Achsen werden auf einer Skala 1–5 bewertet.
Definitionen sind absichtlich operational gehalten — sie sollen
über Personen hinweg konsistent angewendet werden können.

### A · Aktualität

**Frage:** Wie eng ist das Thema an einem laufenden öffentlichen
Diskurs?

| Score | Bedeutung                                                          |
|-------|---------------------------------------------------------------------|
| 1     | Vollständig evergreen, keine Anbindung an aktuelles Geschehen.      |
| 2     | Evergreen, mit milder Anknüpfung an aktuelle Sprache.               |
| 3     | Mitte: Mechanismus, der dieser Woche besonders sichtbar ist.        |
| 4     | Stark verknüpft mit konkretem laufendem Diskurs.                    |
| 5     | Heißes Tagesereignis (siehe `trend_response_framework.md`, S0/S1).  |

### B · Psychologische Relevanz

**Frage:** Wie sauber lässt sich genau **ein** psychologischer
Mechanismus daran zeigen?

| Score | Bedeutung                                                          |
|-------|---------------------------------------------------------------------|
| 1     | Kein klarer Mechanismus, nur Anlass.                                |
| 2     | Mehrere unscharf vermischte Mechanismen.                            |
| 3     | Ein Mechanismus identifizierbar, aber nicht klar isolierbar.        |
| 4     | Ein Mechanismus klar isolierbar, mit Lehrbuch-Bezug.                |
| 5     | Eindeutiges Lehrbeispiel — gut isoliert, übertragbar, alltagstauglich. |

### C · Risiko der politischen Vereinnahmung

**Frage:** Wie wahrscheinlich ist es, dass das Thema **exklusiv** von
einer politischen Seite vereinnahmt, gespiegelt oder als „Bestätigung"
benutzt wird?

| Score | Bedeutung                                                          |
|-------|---------------------------------------------------------------------|
| 1     | Praktisch keine Vereinnahmungsgefahr (z. B. Werbung allgemein).     |
| 2     | Mild — z. B. Wirtschaftspresse, niedrige Polarisation.              |
| 3     | Vorsicht — Thema mit politischer Konnotation, aber breit verteilt.  |
| 4     | Hoch — Thema, an dem sich erkennbar Lager reiben.                   |
| 5     | Maximal — Thema, das in den 24h davor zur Lagerschlacht wurde.      |

> Wichtig: **C ist die einzige Achse, bei der hohe Werte schlecht sind.**
> Die anderen Achsen sind „mehr = besser für Reichweite/Funnel".

### D · Viralpotenzial

**Frage:** Wie wahrscheinlich ist eine starke Reaktion (Saves, Shares,
Completion) **unter Beibehaltung** unserer Tonalität?

| Score | Bedeutung                                                          |
|-------|---------------------------------------------------------------------|
| 1     | Sehr akademisch, schwer in 60 Sek. zu zeigen, kein „Aha".           |
| 2     | Solide Lehre, aber niedrige Share-Wahrscheinlichkeit.               |
| 3     | Klares Aha, mittlere Share-Wahrscheinlichkeit.                      |
| 4     | Starker „Das musste ich speichern"-Effekt.                          |
| 5     | Hook + Mechanik + Sprachbild — hohe Wahrscheinlichkeit für Saves & Shares. |

### E · Kursnähe

**Frage:** Wie eng knüpft das Thema an Module des Onlinekurses an
und kann es Newsletter-/Lead-Magnet-Conversion stützen?

| Score | Bedeutung                                                          |
|-------|---------------------------------------------------------------------|
| 1     | Kein Bezug zu Kurs-Modulen.                                         |
| 2     | Schwacher Bezug, eher Randthema.                                    |
| 3     | Bezug zu einem Modul, ohne Vertiefung.                              |
| 4     | Starker Bezug — passt direkt in eines der Module.                   |
| 5     | Kann nahezu 1:1 als Modul-Auszug fungieren / Lead-Magnet-Bridge.    |

### F · Visuelle Umsetzbarkeit

**Frage:** Wie gut lässt sich das Thema im Visual-Identity-Look
(dunkler Raum, typografische Projektion, Spotlight) umsetzen — ohne
Stock-Footage oder Bildbruch?

| Score | Bedeutung                                                          |
|-------|---------------------------------------------------------------------|
| 1     | Lässt sich nur mit Fremdmaterial/Bewegtbild zeigen — Stilbruch.     |
| 2     | Benötigt aufwändige Grafik, schwer zu wiederholen.                  |
| 3     | Mit Mühe als Typo-Projektion zeigbar.                               |
| 4     | Gut als Typo-Projektion + Markierungen umsetzbar.                   |
| 5     | Ideal: ein Wort, ein Satz, ein Markierungs-Akzent — fertig.         |

---

## 2. Gewichtung

Standardgewichtung (kann je Quartal angepasst werden, sollte aber
mit dem Funnel-Stadium übereinstimmen):

| Achse | Gewicht | Begründung                                              |
|-------|---------|---------------------------------------------------------|
| B · Psychologische Relevanz   | **3** | Substanz vor allem.                            |
| F · Visuelle Umsetzbarkeit    | **2** | Format steht und fällt mit Look.               |
| D · Viralpotenzial            | **2** | Wir brauchen Reichweite, aber sie ist nicht alles. |
| E · Kursnähe                  | **2** | Funnel-Steuerung.                              |
| A · Aktualität                | **1** | Bonus, aber nicht Pflicht.                     |
| C · Risiko der polit. Vereinnahmung | **−3** (Strafabzug!) | Hohe Werte ziehen Punkte ab. |

**Score-Formel:**
```
TOTAL = 3·B + 2·F + 2·D + 2·E + 1·A − 3·C
```

Theoretischer Bereich: −15 bis +50.

---

## 3. Score-Bänder

| Total      | Entscheidung                                                              |
|------------|---------------------------------------------------------------------------|
| ≥ 35       | **Greenlight** — sofort einplanen.                                        |
| 25–34      | **Greenlight mit Schliff** — Mechanik schärfen oder Hook variieren.       |
| 15–24      | **Hold** — auf späteren Slot legen oder mit anderem Thema kombinieren.    |
| 5–14       | **Rework** — nur produzieren, wenn deutlich aufgewertet werden kann.      |
| < 5        | **Pass** — nicht produzieren.                                             |

---

## 4. Harte Stoppregeln (überstimmen jeden Score)

Auch wenn der Score hoch ist, wird **nicht** produziert, wenn:

1. **C = 5** und keine zwei sauberen Streuungs-Beispiele aus anderen
   Feldern verfügbar sind.
2. Das Thema eine konkrete Privatperson zentral als Schuldfigur
   führt.
3. Die Faktenlage in den ersten 48h widersprüchlich ist.
4. Der Mechanismus nur durch Insider-/Trickwissen erklärbar ist, das
   wir nicht öffentlich zeigen wollen.
5. Im Skript Verschwörungs- oder Lager-Sprache nötig wäre, um die
   Pointe zu treffen.
6. Wir beim Recherchieren **Genugtuung** oder **Empörung** an uns
   bemerken, die wir nicht in 24h kalibrieren können.

---

## 5. Risiko-Begleitprotokoll

Für alle Themen mit **C ≥ 3**:

- Prompt 10 („Lager-Test") aus `ai_prompt_system.md` durchlaufen.
- Mindestens zwei Streuungs-Beispiele im Skript explizit benennen.
- Im Schnitt ein Visual, das die Mechanik **außerhalb** des
  ursprünglichen Felds zeigt.

Für alle Themen mit **C = 4 oder 5**:

- Zusätzlich 24h Cooldown vor Posting.
- Zweite Person liest gegen (Safety-Lint).
- Posting-Slot wird auf Donnerstag oder später verschoben, um
  Newsletter als Kontext zu haben.

---

## 6. Beispielbewertungen

### Beispiel 1 — „Das Wort *bedauerlich*" (Evergreen-Klassiker)

- A 1 · B 5 · C 1 · D 4 · E 4 · F 5
- TOTAL = 3·5 + 2·5 + 2·4 + 2·4 + 1·1 − 3·1 = 15 + 10 + 8 + 8 + 1 − 3 = **39**
- → **Greenlight.**

### Beispiel 2 — „Drei Schlagzeilen zur Steuerdebatte" (sensibel)

- A 4 · B 4 · C 4 · D 4 · E 3 · F 4
- TOTAL = 3·4 + 2·4 + 2·4 + 2·3 + 1·4 − 3·4 = 12 + 8 + 8 + 6 + 4 − 12 = **26**
- → **Greenlight mit Schliff.** Pflicht: Streuungs-Beispiele aus
  mindestens zwei weiteren Themen-Feldern, 24h Cooldown.

### Beispiel 3 — „Hot Take zu Skandal X innerhalb von 6 Stunden"

- A 5 · B 3 · C 5 · D 4 · E 2 · F 3
- TOTAL = 3·3 + 2·3 + 2·4 + 2·2 + 1·5 − 3·5 = 9 + 6 + 8 + 4 + 5 − 15 = **17**
- → **Hold.** Und: Stoppregel 1 greift (C = 5 ohne saubere Streuung)
  → **Pass.**

### Beispiel 4 — „Forced Choice — Mentalismus im Alltag"

- A 1 · B 5 · C 2 · D 5 · E 5 · F 5
- TOTAL = 3·5 + 2·5 + 2·5 + 2·5 + 1·1 − 3·2 = 15 + 10 + 10 + 10 + 1 − 6 = **40**
- → **Greenlight.**

---

## 7. Werkzeug: Scoring-Tabelle im Recherche-Sheet

Jede Themen-Idee bekommt **eine Zeile** in der Wochen-Tabelle:

| Idee | A | B | C | D | E | F | Total | Stoppregel? | Entscheidung |
|------|---|---|---|---|---|---|-------|-------------|--------------|

Das ist die Single Source of Truth für die Wochenplanung — und das
einzige Gremium, das letztlich entscheidet, ob ein Thema produziert
wird. Bauchgefühl ist erlaubt (es kann B, D, F treiben), aber das
Scoring zwingt zur Begründung.

---

## 8. Re-Scoring nach Veröffentlichung

Nach 7 Tagen wird **jedes Posting** rückwirkend mit den realen
Daten konfrontiert:

- Hold @ 3s — war D realistisch?
- Saves / View — war B realistisch?
- Kommentar-Sentiment (manuelle 5-Punkte-Skala) — war C realistisch?

Abweichungen ≥ 2 Punkte werden im Wochenreview diskutiert. So
kalibriert sich die Redaktion mit jeder Woche genauer.
