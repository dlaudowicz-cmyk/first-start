# Konzeptprüfung & MVP-Spezifikation

Antwort auf Abschnitt 20–21 des Übergabedokuments. Kurz gehalten, Fokus auf Entscheidungen statt Wiederholung des Dokuments.

## 1. Bewertung des Konzepts

Das Konzept ist intern konsistent und ungewöhnlich gut vorstrukturiert (Datenmodell und IA waren im Dokument selbst schon fast MVP-reif). Zwei echte Widersprüche und einige Lücken:

**Widersprüche**

- **Rollen vs. MVP-Umfang**: Abschnitt 12 definiert 5 Rollen inkl. Mehrbenutzerbetrieb, aber Abschnitt 16 schließt "komplexe Multi-Tenant-Architektur" aus und Priorität 3 verschiebt "Mehrbenutzerbetrieb" nach hinten. → Auflösung: Rollenmodell wird im Schema angelegt (Nutzer-Tabelle, Rollenfeld), aber **Auth/Rechteprüfung ist kein MVP-Feature**. Die App läuft im MVP single-user (Daniel als Admin), Rollen sind vorbereitet, nicht durchgesetzt.
- **Versionierung (5.7) vs. MVP-Abnahme (18)**: 5.7 verlangt einen vollen Statusworkflow (Entwurf → intern geprüft → FAM geprüft → IHK-Fassung → freigegeben → archiviert) mit Feld-Diff pro Änderung. Abnahmekriterium 8 verlangt nur "Versionen erzeugt werden können". → Auflösung: MVP implementiert Snapshot-Versionierung (ganzes Projekt als JSON-Snapshot mit Statuslabel), kein feldgenaues Change-Tracking. Das ist in Abschnitt 15 ("Export Assistant") ohnehin als spätere Automatisierung vorgesehen.

**Lücken**

- Keine Aussage, ob ein Lernbereich mehreren Workshop-Tagen zugeordnet werden kann oder 1:n ist → Annahme: n:m über eine einfache Zuordnungstabelle (`workshop_day_modules`), da ein Tag typischerweise mehrere Lernbereiche anreißt.
- "Überschneidung mit anderen Lernbereichen" (5.3) ist nicht definiert (zeitlich? inhaltlich?) → Annahme: als *manuelle* Warnung interpretiert (Autor markiert Themen als "Duplikat von Modul X"), keine automatische Textanalyse im MVP (das wäre die KI-Konsistenzprüfung aus Abschnitt 15, explizit Phase 2).
- Kein Hinweis auf Mandantenfähigkeit für mehrere Projekte gleichzeitig, obwohl das Datenmodell `project_id`-Fremdschlüssel überall vorsieht → App unterstützt mehrere Projekte von Anfang an (kostet nichts, verhindert Migrationsschmerz), aber es gibt im MVP nur ein Seed-Projekt.

## 2. Bereinigte MVP-Funktionsliste (Priorität 1, umgesetzt)

1. Projekt-Dashboard: Stundenbilanz, Modulanzahl, Status, letzte Änderung
2. Curriculum-Editor: 10 Lernbereiche, alle Felder aus 5.2, sortierbar
3. Stundenprüfung: Live-Berechnung + Warnungen aus 5.3
4. Workshop-Builder: 5-Tage-Struktur aus 5.4, referenziert Lernbereiche
5. Tool-Matrix: Tabelle aus 5.6 mit Seed-Tools
6. Versionierung: Snapshot erzeugen, Liste, Status setzen
7. Export: Markdown (voll funktionsfähig), PDF (Druckansicht/Browser-Print), JSON (voll funktionsfähig)

Bewusst als **Stub** angelegt (Navigation/Datenmodell vorhanden, keine Tiefe): Dozentenhandbuch, Kommentare, Einstellungen — das sind Priorität 2/3 laut Abschnitt 17.

Bewusst **nicht gebaut** (Abschnitt 16): Auth/Rechteprüfung, Teilnehmerverwaltung, Zahlungen, Multi-Tenant, KI-Funktionen, lokale Modelle.

## 3. Technischer Stack — Abweichung vom Vorschlag in Abschnitt 14

| Bereich | Vorschlag im Dokument | Umgesetzt | Begründung |
|---|---|---|---|
| Frontend | Next.js, TS, Tailwind, shadcn/ui | Next.js 16 (App Router), TS, Tailwind v4 | wie vorgeschlagen |
| Backend/DB | Supabase/Postgres | **SQLite (better-sqlite3) via Drizzle ORM** | MVP muss ohne externe Cloud-Accounts sofort lauffähig sein ("ersten lauffähigen App-Skeleton"). Drizzle-Schema ist Dialekt-portabel: Umzug auf Supabase/Postgres ist ein Treiberwechsel, keine Schema-Neukonzeption (Migrationspfad in README dokumentiert). |
| Editor | TipTap/Lexical Rich-Text | native strukturierte Formularfelder (`<textarea>`/Inputs) | Datenmodell ist bereits feldbasiert (Lernziel, Qualifikationsinhalte, ...); Rich-Text pro Feld ist Komfort, kein MVP-Blocker. Nachrüstbar pro Feld. |
| Export | serverseitig PDF/DOCX | Markdown + JSON serverseitig, PDF über Browser-Druckansicht | Vollwertige serverseitige PDF/DOCX-Erzeugung (Puppeteer/LibreOffice) braucht Systemabhängigkeiten, die den "sofort lauffähig"-Anspruch gefährden. Druckansicht ist mit vorhandenem CSS bereits sauber exportierbar; echter PDF-Service ist Priorität-3-Ausbau. |
| Auth | E-Mail/Passwort, Magic Link | keine (single-user) | s.o., kein MVP-Feature laut 17/18 |

## 4. Weitere dokumentierte Annahmen

- Zielstunden sind pro Projekt konfigurierbar (Feld `target_hours`), Default 400 wie im Seed, nicht hart codiert — falls IHK-Abstimmung den Wert später ändert.
- Theorie/Praxis-Stunden werden pro Modul einzeln gepflegt (`hours_theory`, `hours_practice`) statt als reiner Prozentsatz, damit die 70/30-Zielquote (3.3) aus echten Werten berechnet wird, nicht geschätzt.
- Status-Werte für Module: `entwurf | in_bearbeitung | review | freigegeben` — reduzierte Variante des 6-stufigen Freigabeworkflows aus 5.7, weil 5.2 nur "Status" pro Lernbereich verlangt, der volle Workflow gehört zur Projekt-Version (siehe Widerspruch oben).
- "Version" ist MVP als Projekt-weiter Snapshot modelliert, nicht pro Lernbereich — entspricht 5.7 ("Version" als Projektfeld) eher als 5.2 ("Version" als Modulfeld); beide Felder existieren, aber nur die Projekt-Version hat einen Freigabe-Workflow.
