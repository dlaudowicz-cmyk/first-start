# Pushlabs Company OS — Arbeitsanweisungen

## Kostenkontrolle: bei Sessionbeginn prüfen

Am 25. August 2026 ist eine Session (`KI-Sequenzen James Holman`, movie-studio) auf
**206 $** gelaufen und am Sessionlimit gestorben — 67 Mio. gelesene Kontext-Token
für 106 Tsd. Token Output. Ursache war nicht ein teurer Auftrag, sondern eine
Session, die fünf Tage lief und deren Kontext mit jedem Werkzeugaufruf wuchs.

**Deshalb zu Beginn jeder Session, unaufgefordert:**

1. `list_triggers` — laufen Routines, die unbeaufsichtigt feuern? Das ist das
   einzige Szenario, in dem Kosten ohne Zutun des Nutzers entstehen. Findet sich
   eine unbekannte Routine: melden, nicht stillschweigend löschen.
2. `list_sessions` mit `mine: true` — Sessions mit dem Risikoprofil melden:
   - läuft seit Wochen oder Monaten
   - Cache-Reads im zweistelligen Millionenbereich
   - `status_bucket: FAILED` mit „hit your session limit"
3. Kurz und beiläufig berichten. Kein Report, wenn nichts auffällt.

**Die eigene Session gehört mitgeprüft.** Sie hat oft dasselbe Profil wie die
Session, vor der gewarnt wird — das gehört gesagt, nicht verschwiegen.

### Was die Kosten treibt

Bei jedem Zug wird der gesamte Kontext neu gelesen: *Züge × Kontextgröße*. Der
Output ist fast nie der Treiber. Konkret heißt das beim Arbeiten:

- Große Werkzeug-Ergebnisse (Medien-Generierung, lange Dateien, Job-Payloads)
  in Dateien schreiben und nur den Pfad im Gespräch behalten.
- Für eine neue, abgegrenzte Aufgabe eine neue Session, statt eine bestehende
  über Wochen weiterzuziehen.
- `effort` an die Aufgabe anpassen — nicht `xhigh` für mechanische Schritte.

### Reichweite dieser Datei

Gilt nur für Sessions auf `first-start`. `movie-studio` und `pushlabs-os`
brauchen dieselbe Anweisung in ihrer eigenen `CLAUDE.md` — dort ist der Schaden
tatsächlich entstanden.

## Projektkontext

Das eigentliche Produkt liegt in `README.md`: Pushlabs Company OS, Next.js 15 +
TypeScript + Prisma/SQLite, zweischichtig (Company-Ebene über Ventures,
Operations-Ebene darunter). Vor Änderungen dort nachlesen — insbesondere:

- Geld- und Steuerlogik gehört ausschließlich in `src/lib/calculations.ts`,
  niemals in UI-Komponenten.
- Der Vault (`src/lib/schemas.ts`, `credentialSchema`) hat **bewusst kein Feld
  für Passwörter oder Keys**. Diese Entscheidung nicht aufweichen.
- Standards liegen als Konfiguration an einer Stelle: `spesen-rates.ts`,
  `project-files.ts`, `pipelines.ts`.
