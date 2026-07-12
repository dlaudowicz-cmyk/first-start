# Online Academy — Architektur- und Entwicklungsplan

Antwort auf §47 des Übergabedokuments (Add-on Online Academy). Dies ist ein **Plan**, kein Code — die
Empfehlung in §48 ("Phase 1 zuerst, Academy danach") und die explizite Anforderung in §47.14 ("separater
Entwicklungsplan") sprechen dagegen, jetzt direkt Academy-Code zu schreiben, solange das Curriculum-Studio-MVP
noch nicht gemerged/abgenommen ist. Am Ende steht eine offene Frage zum weiteren Vorgehen.

---

## 1. Systemarchitektur

**Ein Repo, ein Next.js-Projekt, zwei Bereiche.** Kein separater Service — das Curriculum Studio ist bereits
Next.js/App-Router; die Academy wird als zweite Route-Gruppe daneben gebaut, nicht als eigenes Produkt:

```
src/app/
  (studio)/          ← bestehend: dashboard, curriculum, workshop, tools, versionen, exporte, ...
  (academy)/
    (public)/         Startseite, Programme, Kursdetail, Login, Registrierung, Zertifikat prüfen
    (learner)/        Teilnehmer-Dashboard, Kursansicht, Lektion, Aufgaben, Fortschritt, Zertifikate
    (instructor)/     Dozenten-Dashboard, Kohorten, Abgaben, Feedback, Live-Termine
    (admin)/          Programme, Kurse, Curriculum Sync, Kohorten, Nutzer, Zahlungen, Statistiken
```

**Datenbank: eine gemeinsame Postgres-Instanz (Supabase), keine zwei Datenbanken.** Das ist der zentrale
Architekturentscheid: "gemeinsames und getrenntes Datenmodell" (§47.2) heißt *ein* Schema mit klarer
Tabellentrennung plus expliziten Fremdschlüsseln an den Publishing-Grenzen (`course.curriculum_module_id`,
`program.curriculum_version_id`), nicht zwei Systeme, die sich per API synchronisieren. Zwei DBs würden die in
§42 geforderte Versions-/Snapshot-Logik (Kohorte friert Kursversion ein) unnötig verkomplizieren.

**Warum das die SQLite-Migration jetzt erzwingt:** Das Curriculum-Studio-MVP läuft bewusst ohne Auth auf
lokalem SQLite (siehe `docs/CONCEPT-REVIEW.md`). Die Academy braucht zwingend: echte Authentifizierung
(Teilnehmer-Login), Mehrbenutzerbetrieb mit Row Level Security (private Abgaben, §45), und Datei-/Video-Storage.
Das ist genau der in der README skizzierte Migrationspfad (SQLite→Postgres via Drizzle-Dialektwechsel) — die
Academy ist der Zeitpunkt, an dem er fällig wird, nicht optional.

**Externe Dienste (statt Eigenbau):**
- Auth + Postgres + Storage + RLS: **Supabase**
- Video: **Mux** (Empfehlung) oder Cloudflare Stream — nie Rohdateien über App-Storage ausliefern (§44)
- Live-Termine: **Google Meet/Zoom-Links + Kalenderintegration**, keine eigene Konferenzinfrastruktur (§30)
- Zahlung (Phase 4, nicht MVP): **Stripe**
- E-Mail: **Resend**

---

## 2. Datenmodell (Erweiterung, keine Kollision mit dem Curriculum-Schema)

Namenskollision: Das Curriculum-Studio hat bereits `curriculum_modules`. §40 nennt eine Academy-Entity
`Module` (Course→Module→Lesson). Umbenannt zu **`course_modules`**, um Verwechslung zu vermeiden — funktional
identisch zu §40.

Neue Tabellen (Drizzle, gleiche Konventionen wie `src/db/schema.ts`), gruppiert nach §40:

**Inhaltsstruktur**
- `programs` (`id, title, subtitle, type, status, target_hours, certificate_type, curriculum_version_id → versions.id, created_at, updated_at`)
- `courses` (`id, program_id, title, order_index, estimated_hours, status, access_type, cover_image, published_version, curriculum_module_id → curriculum_modules.id`)
- `course_modules` (`id, course_id, title, order_index, unlock_rule, estimated_minutes, status`)
- `lessons` (`id, course_module_id, title, lesson_type, content, video_url, transcript, estimated_minutes, required, order_index, publish_at, status`)
- `learning_activities` (`id, lesson_id, type, title, content, resource_url, required, completion_rule, order_index`)
- `prompt_blocks` (§27.3 — eigener Inhaltstyp: `id, lesson_id, tool, model, model_version, purpose, prompt, negative_prompt, reference_notes, example_result, author, status`)

**Teilnehmer & Fortschritt**
- `users` — bereits vorhanden (`src/db/schema.ts`), Rollen-Enum wird um Academy-Rollen erweitert:
  `academy_admin | course_author | instructor | mentor | teilnehmer | corporate_manager | alumni`
  (bestehende Studio-Rollen `admin/autor/pruefer/dozent/leser` bleiben parallel bestehen — ein Nutzer kann
  beide Rollensätze haben, z. B. Daniel als Studio-Admin *und* Academy-Instructor)
- `cohorts` (`id, program_id, title, start_date, end_date, capacity, status, timezone, enrollment_deadline`)
- `cohort_instructors` (Junction: `cohort_id, user_id`)
- `enrollments` (`id, user_id, program_id, cohort_id, status, enrolled_at, completed_at, payment_status, certificate_status`)
- `lesson_progress` (`id, enrollment_id, lesson_id, status, progress_percent, started_at, completed_at, last_position`)

**Aufgaben & Bewertung**
- `assignments` (`id, lesson_id, title, assignment_type, due_date, allowed_file_types, max_file_size, rubric_id, attempts_allowed, required`)
- `submissions` (`id, assignment_id, enrollment_id, version, status, submitted_at, content, file_urls, external_links, tool_documentation, reflection, score`)
- `feedback` (`id, submission_id, reviewer_id, feedback_type, content, media_url, score, created_at`)
- `rubrics` (`id, title, criteria (jsonb), total_points, version`)
- `quizzes` (`id, lesson_id, title, passing_score, attempts_allowed, time_limit, randomize_questions`)
- `questions` (`id, quiz_id, type, question, answers (jsonb), correct_answer, explanation, points`)

**Live & Zertifikate**
- `live_sessions` (`id, cohort_id, title, start_time, end_time, provider, meeting_url, recording_url`)
- `attendance` (`id, live_session_id, enrollment_id, status, joined_at, left_at, notes`)
- `certificates` (`id, enrollment_id, certificate_type, certificate_number, issued_at, verification_code, pdf_url, status`)

**Commerce (Phase 4, Tabellen schon vorsehen)**
- `orders` (`id, user_id, program_id, cohort_id, amount, currency, payment_method, payment_status, invoice_url`)

Alle Tabellen mit `enrollment_id`/`submission_id`/`file_urls` sind RLS-Kandidaten (§45: private Abgaben dürfen
nicht öffentlich lesbar sein) — das ist der Hauptgrund, warum SQLite (keine RLS) für die Academy nicht reicht.

---

## 3. Publishing- & Versionierungsworkflow (§42)

```
Curriculum-Version freigegeben (Studio)
        │
        ▼
Kursautor ordnet Lernbereiche einem Program/Course zu
        │  (courses.curriculum_module_id, programs.curriculum_version_id)
        ▼
Lektionen/Aufgaben werden erstellt (courses.status = entwurf)
        │
        ▼
fachliche Prüfung → courses.status = freigegeben
        │
        ▼
Kursversion veröffentlicht → courses.published_version += 1
        │
        ├─── neue Kohorte startet  → cohort erhält aktuelle published_version
        └─── laufende Kohorte      → behält ihre versionierte Kopie unverändert
```

**Kernregel (§42, hart durchzusetzen):** `enrollments` referenziert nie `courses` direkt für Inhalte, sondern
über ein **Snapshot-Feld** `enrollments.course_version_snapshot` (jsonb, analog zu `versions.snapshot` im
Studio) — genau das Snapshot-Muster, das im Curriculum Studio bereits für Projekt-Versionen existiert, hier auf
Kursebene wiederverwendet. Eine neue `courses.published_version` betrifft nur *neue* Einschreibungen.

---

## 4. User Flows (Kurzform)

**Teilnehmer:** Programm ansehen → buchen/einschreiben (`enrollments`) → Kohorte zugewiesen → Lektionen
absolvieren (`lesson_progress`) → Aufgabe einreichen (`submissions`) → Feedback erhalten (`feedback`) →
Abschlussvoraussetzungen erfüllt → Zertifikat anfordern (`certificates`, manuelle Freigabe laut §32.3).

**Dozent:** Kohorte öffnen → ungeprüfte Abgaben-Queue → Submission öffnen → Rubric bewerten → Feedback
schreiben → Status setzen (`bestanden/Überarbeitung erforderlich`) → bei Abschluss: Zertifikat-Freigabe
vorschlagen (kein Auto-Zertifikat, §32.3).

**Admin:** Curriculum-Version wählen → Program anlegen → Courses aus Lernbereichen ableiten (vorbelegt aus
`curriculum_modules`, analog zum bestehenden Workshop-Builder-Muster) → Kohorte anlegen → Dozenten zuweisen →
Live-Termine eintragen → Statistiken beobachten.

---

## 5. Wireframe-Beschreibung (Academy, §41 IA)

Gleiche Design-Sprache wie das Studio (Sidebar-Layout, Karten, Statuspillen) — Teilnehmerbereich zusätzlich
**mobile-first** (§46.13), da Teilnehmer anders als Dozenten/Admin auf dem Handy lernen:

- **Teilnehmer-Dashboard:** Fortschrittsbalken oben (analog zur Stundenprüfung-Karte im Studio-Dashboard),
  darunter Kartenraster "Nächste Deadline / Nächste Live-Session / Offene Aufgaben".
  „Meine Programme" als Liste mit Fortschrittsring pro Programm.
- **Kursansicht:** linke Spalte = Modul/Lektions-Baum (klappbar, Haken bei Abschluss), rechte Spalte =
  Lektionsinhalt (Video oben, Text/Prompt-Blöcke darunter, "Als abgeschlossen markieren"-Button unten).
- **Aufgabe/Abgabe:** Formular mit Datei-Upload, Toolvorgaben als Hinweis-Box, Abgabehistorie darunter
  (Versionen wie bei Curriculum-Modulen, jede Abgabe eigene Zeile mit Status-Badge).
- **Dozenten-Abgaben-Queue:** Tabelle wie die bestehende Curriculum-Liste, Spalten: Teilnehmer, Aufgabe,
  eingereicht am, Status; Klick öffnet Split-View (Abgabe links, Rubric-Formular rechts).
- **Admin Curriculum-Sync:** Tabelle Curriculum-Module ↔ zugeordnete Courses, mit "Übernehmen"-Button pro Zeile
  (übernimmt Lernziel/Praxisaufgabe als Vorbefüllung für eine neue Lektion).

---

## 6. Video- & Datei-Architektur

- Video-Uploads laufen nie über den App-Server: Autor lädt direkt zu Mux hoch (signierte Upload-URL), App
  speichert nur `video_url`/Mux-Asset-ID in `lessons`.
- Abgaben (Bilder/Videos/PDFs) → Supabase Storage, privater Bucket, signierte URLs mit kurzer TTL, RLS-Policy:
  nur `enrollment.user_id`, zugewiesene Dozenten der Kohorte, und Admin dürfen lesen.
  Öffentlicher Bucket ausschließlich für Zertifikat-PDFs (Verifikationsseite, §35) und Kursvorschaubilder.
- Downloads pro Lektion optional deaktivierbar (§27.1) → Flag `lessons.downloads_enabled`, wird bei der
  signierten-URL-Erzeugung geprüft, nicht nur im UI versteckt.

---

## 7. Rollen- & Sicherheitskonzept

Erweiterung des bestehenden `role`-Enums in `users` (Studio: `admin, autor, pruefer, dozent, leser`) um die
Academy-Rollen aus §25. Rechte werden nicht in der App-Schicht geprüft, sondern per **Supabase RLS-Policy pro
Tabelle** — Startpunkt der Policy-Matrix:

| Tabelle | Teilnehmer | Instructor/Mentor | Corporate Manager | Admin |
|---|---|---|---|---|
| `submissions` | nur eigene (`enrollment.user_id = auth.uid()`) | Kohorten, denen sie zugewiesen sind | keine Einzelabgaben (§25.6) | alle |
| `feedback` | nur zu eigenen Submissions lesbar | schreiben für zugewiesene Kohorten | aggregiert, nicht einzeln | alle |
| `lesson_progress` | nur eigene | ihrer Kohorten (read) | aggregiert | alle |
| `certificates` | nur eigene | Freigabe vorschlagen, nicht ausstellen | — | ausstellen |
| `courses`/`lessons` | freigegebene Version lesen | + Entwürfe ihrer Kurse | — | alle, inkl. Entwürfe |

Zertifikat-Ausstellung bleibt laut §32.3 ein manueller Admin-Schritt, nie eine reine RLS-Freigabe — das ist
eine Prozessregel, keine Rechte-Frage, und wird in der Server Action, nicht in der Policy, erzwungen.

---

## 8. Academy-MVP-Roadmap (Phase 2, aus §48 abgeleitet)

1. **Infrastruktur-Fundament** (Voraussetzung für alles Weitere): Supabase-Projekt, Drizzle-Dialektwechsel
   SQLite→Postgres, Supabase Auth (E-Mail/Passwort + Magic Link, §14), RLS-Grundgerüst, Storage-Buckets.
2. **Programme/Kurse/Lektionen (Autoring):** `programs, courses, course_modules, lessons, learning_activities`
   + Admin-UI „Curriculum Sync" (Lernbereich → Course-Vorbefüllung).
3. **Teilnehmerbereich (Lernen):** Registrierung/Login, Kursansicht, Video-/Textlektionen, `lesson_progress`.
4. **Kohorten:** `cohorts, cohort_instructors, enrollments`, Einschreibung (manuell, keine Buchung/Zahlung im
   MVP — §36 explizit Phase 4).
5. **Aufgaben & Feedback:** `assignments, submissions, feedback, rubrics` + Dozenten-Abgaben-Queue.
6. **Live-Termine:** `live_sessions, attendance`, externe Meeting-Links, iCal-Export.
7. **Zertifikate:** `certificates`, manuelle Admin-Freigabe, öffentliche Verifikationsseite (§35, keine
   sensiblen Daten).

Danach erst Phase 3 (Quiz/Prüfungen als eigenständiges Modul), Phase 4 (Stripe/Buchung), Phase 5 (Community,
AI-Tutor, Tool-Update-System, White-Label) — unverändert wie in §48 vorgeschlagen.

---

## 9. Migrationspfad vom Curriculum Studio zur Academy

1. Supabase-Projekt anlegen (braucht Daniels Zugangsdaten/Account — kann nicht in dieser Sandbox provisioniert
   werden, siehe offene Frage unten).
2. `drizzle.config.ts`: `dialect: "sqlite"` → `"postgresql"`; `src/db/index.ts`: `better-sqlite3` → Supabase-
   Postgres-Client. Schema-Felder bleiben 1:1 (bereits in `README.md` "Migrationspfad" vorbereitet).
3. Seed-Skript einmalig gegen die neue DB laufen lassen (`npm run db:seed`), bestehende SQLite-Datei danach
   nur noch lokales Dev-Fallback (optional, kein Produktions-Pfad mehr).
4. Auth aktivieren: Supabase Auth ersetzt den aktuell fest verdrahteten Seed-User „Daniel Laudowicz"; Studio-
   Rollen bleiben unverändert nutzbar, Academy-Rollen kommen als zusätzliche Werte im selben Enum dazu.
5. Academy-Tabellen per neuer Drizzle-Migration ergänzen (additiv, keine bestehende Studio-Tabelle ändert
   sich) — Studio bleibt während der gesamten Migration lauffähig.

---

## 10. Abgrenzung MVP / Phase 2+ / später (Zusammenfassung von §43)

| Jetzt gebaut (Curriculum Studio, PR #1) | Academy-MVP (Phase 2, dieser Plan) | Bewusst später (§43, §48 Phase 3–5) |
|---|---|---|
| Dashboard, Curriculum-Editor, Stundenprüfung, Workshop-Builder, Tool-Matrix, Snapshot-Versionierung, Export | Auth, Programme/Kurse/Lektionen, Fortschritt, Kohorten, Aufgaben/Feedback, Live-Termine (Links), Zertifikate (manuell) | Quiz/Prüfungen mit Fragenpool, Proctoring, Stripe/Buchung, B2B-Gruppen, Community/Alumni, AI-Tutor, Tool-Update-System, Mandantenfähigkeit, native App, Marketplace |

---

## Offene Frage

Dieser Plan ist bewusst *nicht* in Code umgesetzt. Bevor ich mit Phase-2-Implementierung anfange, hängt vieles
an einer Entscheidung, die nur du treffen kannst: Der ganze Academy-Teil braucht die SQLite→Supabase-Migration
(echte Auth, RLS, Storage) — das ist eine Infrastrukturentscheidung mit externen Zugangsdaten, kein reiner
Code-Schritt. Wie soll ich weitermachen?
