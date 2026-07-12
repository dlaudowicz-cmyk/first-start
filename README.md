# AI Creator Curriculum App

Internes Arbeitswerkzeug zur Entwicklung und Pflege des Curriculums **„AI Creator – Professional Certificate“**
(Fernseh Akademie Mitteldeutschland × Daniel Laudowicz). Siehe `docs/CONCEPT-REVIEW.md` für die Konzeptprüfung,
Annahmen und die Begründung der Stack-Abweichungen vom ursprünglichen Übergabedokument.

## Schnellstart

```bash
npm install
npm run dev
```

Öffnet auf [http://localhost:3000](http://localhost:3000), leitet auf `/dashboard` weiter. Beim ersten Start
(`predev`/`prebuild`) werden automatisch die SQLite-Migrationen ausgeführt und, falls die Datenbank leer ist,
die Seed-Daten aus dem Übergabedokument eingespielt (Projekt, 10 Lernbereiche = 400 Std., 5-Tage-Workshop,
10 Tools). Kein externer Account, keine `.env`-Datei nötig.

Die SQLite-Datei liegt unter `data/curriculum.db` (git-ignoriert). Zum Zurücksetzen: Datei löschen, neu starten.

## Stack

| Bereich | Wahl | Warum |
|---|---|---|
| Framework | Next.js 16 (App Router), TypeScript | wie im Übergabedokument §14 vorgeschlagen |
| Styling | Tailwind CSS v4 | wie vorgeschlagen; keine Component-Library (shadcn) im MVP, um Abhängigkeiten gering zu halten |
| Datenbank | SQLite (`better-sqlite3`) über **Drizzle ORM** | lauffähig ohne Cloud-Account; Drizzle-Schema ist dialektportabel — Migration auf Supabase/Postgres ist ein Treiberwechsel (siehe unten), keine Schema-Neukonzeption |
| Mutations | Next.js Server Actions | keine separate API-Schicht nötig für den MVP-Umfang |
| Export | Markdown + JSON serverseitig, PDF über Browser-Druckansicht | siehe `docs/CONCEPT-REVIEW.md` §3 |

Vollständige Begründung aller Abweichungen vom Dokument-Vorschlag: `docs/CONCEPT-REVIEW.md`.

## Projektstruktur

```
src/
  db/
    schema.ts            Drizzle-Schema: Curriculum Studio (§11) + Academy-Tabellen (§40, Klick-Dummy-Scope)
    index.ts              DB-Client (better-sqlite3)
    seed.ts               Seed-Daten Studio aus §6/§7/§8/§19
    academy-seed.ts        Mock-Daten Academy: Programm, Kurse, Lektionen, Abgaben, Zertifikat
    migrate-and-seed.ts    Läuft vor jedem dev/build
  lib/
    hours.ts               Stundenprüfung (§5.3) — reine Funktion, testbar
    data.ts                 Studio-Datenzugriff (Server-seitig)
    academy-data.ts         Academy-Datenzugriff
    academy-role.ts          Rollen-Cookie (Ersatz für Auth im Klick-Dummy)
    export.ts               Markdown-/JSON-Exportgenerierung
  components/
    sidebar.tsx, ui.tsx      Studio-Layout und geteilte UI-Primitiven
    academy/                 Academy-Sidebar, Rollen-Umschalter
  app/
    (studio)/                eigene Route-Gruppe (keine URL-Auswirkung), eigener Sidebar-Layout
      dashboard/, curriculum/[id]/, workshop/, tools/, versionen/, exporte/, ...
    akademie/                Online-Academy-Klick-Dummy (docs/ACADEMY-PLAN.md)
      dashboard/, programme/[id]/, kurse/[courseId]/, aufgaben/, dozent/, zertifikate/, admin/
drizzle/                     generierte SQL-Migrationen (committed)
docs/CONCEPT-REVIEW.md       Konzeptprüfung, Annahmen, MVP-Abgrenzung (Curriculum Studio)
docs/ACADEMY-PLAN.md          Architektur, Datenmodell, Roadmap für die Online Academy (§47)
```

## Online Academy (Klick-Dummy)

Unter `/akademie` liegt ein UI/UX-Klick-Dummy der in `docs/ACADEMY-PLAN.md` geplanten Online Academy — auf
ausdrücklichen Wunsch **auf dem bestehenden SQLite-Stack**, ohne echte Authentifizierung. Da es kein Login gibt,
schaltet ein Cookie-basierter Rollen-Umschalter in der Academy-Sidebar zwischen drei Ansichten um: Teilnehmer,
Dozent, Admin. Interaktionen sind echt und persistieren (Lektion abschließen, Aufgabe einreichen, Feedback
geben, Lernbereich aus dem Studio als Kurs übernehmen) — es fehlt nur die Zugriffskontrolle. Die Migration auf
Supabase (echte Auth/RLS/Storage) ist bewusst zurückgestellt, siehe `docs/ACADEMY-PLAN.md` §9.

## Datenbank-Befehle

```bash
npm run db:generate   # neue Migration aus schema.ts erzeugen
npm run db:migrate     # Migrationen anwenden
npm run db:studio      # Drizzle Studio (DB-Browser im Browser)
npm run db:seed        # Seed-Daten erneut einspielen
npm run db:seed:academy # Academy-Mock-Daten erneut einspielen
```

## Migrationspfad zu Supabase/Postgres

Für Mehrbenutzerbetrieb, Auth und Row Level Security (Priorität 3) ist der vorgesehene Weg:

1. `drizzle.config.ts`: `dialect: "sqlite"` → `"postgresql"`, `dbCredentials.url` → Supabase-Connection-String.
2. `src/db/schema.ts`: `sqlite-core` → `pg-core` Importe (Spaltentypen sind 1:1 übertragbar — `text`/`integer`/`real` haben direkte Postgres-Entsprechungen, `enum`-Constraints bleiben gleich).
3. `src/db/index.ts`: `drizzle(sqlite, ...)` → `drizzle(postgresClient, ...)` (z. B. via `postgres-js` oder `@supabase/supabase-js`).
4. Auth/RLS/Rollen (§12) darüberlegen — das Rollenfeld existiert in `users` bereits, wird im MVP aber nicht durchgesetzt.

Kein Feld, keine Tabelle muss dafür umbenannt oder neu konzipiert werden.

## MVP-Umfang

Siehe `docs/CONCEPT-REVIEW.md` §2 für die vollständige Liste. Kurzfassung:

**Gebaut (Priorität 1):** Dashboard, Curriculum-Editor mit allen Feldern aus §5.2, automatische Stundenprüfung
mit Warnungen (§5.3), Workshop-Builder (§5.4), Tool-Matrix (§5.6), Snapshot-Versionierung (§5.7), Export als
Markdown/JSON/PDF-Druckansicht (§5.9).

**Als Stub angelegt (Datenmodell fertig, UI folgt — Priorität 2):** Dozentenhandbuch, Kommentare/Freigaben.

**Bewusst nicht gebaut (§16):** Auth/Rechteprüfung, Teilnehmerverwaltung, Zahlungsabwicklung, Multi-Tenant,
KI-Assistenzfunktionen, lokale KI-Modelle, DOCX/XLSX-Export.

## Roadmap (Priorität 2/3, aus §17)

- **P2:** Kommentar- und Freigabe-UI, Dozentenhandbuch-Redaktionsoberfläche, Tool-Matrix-Bearbeitung im UI (aktuell nur Seed/DB).
- **P3:** KI-Assistent (Lernziele formulieren, Konsistenzprüfung, Workshop-Generator — §15), DOCX-Export,
  Marketing-Kurzfassungs-Export, Prüfungs-Generator, Mehrbenutzerbetrieb mit Auth/RLS (siehe Migrationspfad oben).

## Getestet

- `npx tsc --noEmit` — sauber
- `npm run build` — erfolgreich, alle Routen rendern
- Browser-Smoke-Test (Playwright): Dashboard, Curriculum-Liste/Editor (anlegen/bearbeiten/löschen), Workshop-Tage
  bearbeiten, Tool-Matrix, Versionserstellung, Markdown-/JSON-Export, PDF-Druckansicht, Stub-Seiten — alle ohne
  Konsolenfehler, Datenpersistenz in SQLite verifiziert.
- Academy-Klick-Dummy in allen drei Rollen durchgeklickt (Teilnehmer, Dozent, Admin): Lektion abschließen,
  Aufgabe einreichen, Dozenten-Feedback speichern, Curriculum-Modul als Kurs übernehmen — alle Interaktionen
  in SQLite verifiziert, keine Konsolenfehler.
