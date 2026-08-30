# Pushlabs OS auf dem eigenen Rechner starten

Für Daniel. Einmal einrichten, danach sind es zwei Befehle.

Rechne mit 15 Minuten beim ersten Mal. **Mach das nicht am Tag der Vorführung** —
wenn etwas hakt, willst du Zeit haben.

---

## Einmalig einrichten

### 1. Node installieren

Das OS braucht Node.js ab Version 20.

- **Mac:** [nodejs.org](https://nodejs.org) öffnen, die Version mit „LTS"
  herunterladen, Installer durchklicken.
- **Windows:** dasselbe.

Prüfen, ob es geklappt hat — Terminal öffnen (Mac: Spotlight → „Terminal",
Windows: Startmenü → „PowerShell") und eingeben:

```bash
node --version
```

Kommt eine Zahl wie `v22.x.x`, ist alles gut. Kommt „command not found",
hat die Installation nicht geklappt oder das Terminal muss einmal neu
geöffnet werden.

### 2. Projekt holen

```bash
git clone https://github.com/dlaudowicz-cmyk/first-start.git pushlabs-os
cd pushlabs-os
git checkout claude/pushlabs-production-os-cFuDU
```

Falls `git` fehlt: auf dem Mac einmal `xcode-select --install` ausführen,
unter Windows [git-scm.com](https://git-scm.com) installieren.

### 3. Einrichten

```bash
npm install
cp .env.example .env
npm run db:push
```

`npm install` lädt die Abhängigkeiten und dauert beim ersten Mal ein paar
Minuten. `db:push` legt die leere Datenbank an.

**Wenn du mit Beispieldaten starten willst,** um dich umzusehen:

```bash
npm run db:seed
```

Das legt Demo-Kunden und -Projekte an. Die Oberfläche weist dann darauf hin,
dass es Demo-Daten sind. Zum Leeren später: `npm run db:reset` und dann die
Demo-Datensätze in der Oberfläche löschen.

---

## Täglich starten

```bash
cd pushlabs-os
npm run dev
```

Dann im Browser **http://localhost:3000** öffnen.

Beenden mit `Strg+C` im Terminal.

---

## Wenn etwas nicht geht

**„command not found: npm"**
Node ist nicht installiert oder das Terminal wurde seit der Installation nicht
neu geöffnet. Terminal schließen, neu öffnen, nochmal versuchen.

**„Port 3000 is already in use"**
Es läuft noch eine alte Instanz. Entweder das andere Terminalfenster suchen und
dort `Strg+C` drücken, oder auf einem anderen Port starten:
`npm run dev -- -p 3001`

**Die Seite bleibt weiß oder zeigt einen Fehler**
Meistens fehlt die Datenbank. `npm run db:push` nochmal ausführen.

**Nach einem `git pull` geht etwas nicht**
Wenn sich das Datenmodell geändert hat:
`npm install && npm run db:push`

---

## Wichtig: sichern

Alle Daten liegen in **einer Datei** auf diesem Rechner: `prisma/dev.db`.
Sie ist bewusst nicht in Git — dort hätten Kundendaten und Bankverbindung
nichts verloren. Das heißt aber auch: **geht der Rechner kaputt, sind die
Daten weg.**

Deshalb: in den **Einstellungen** auf **„Sicherung herunterladen"** klicken.
Du bekommst ein ZIP mit der Datenbank und allen Projektdateien, samt Anleitung
zum Zurückspielen.

Mach das regelmäßig. Einmal die Woche reicht, wenn du nicht täglich damit
arbeitest — und in jedem Fall, bevor du etwas Größeres änderst.

Das ZIP enthält alle Firmendaten im Klartext. Es gehört an einen Ort, den du
kontrollierst: externe Festplatte, dein eigener Cloud-Speicher, nicht ein
geteilter Ordner.

---

## Für die Vorführung

Ein Ablauf, der die Idee in fünf Minuten zeigt:

1. **Übersicht** — was läuft, was ist offen, was steht an
2. **Venture umschalten** oben links: dieselbe Ansicht, nur für ein Venture.
   Das ist der Unterschied zu einem normalen Projekttool.
3. **Ein Projekt öffnen** — Pipeline, Dateiablage, Statusbericht als PDF
4. **Ventures → ein Venture → Export (ZIP)** — das komplette Venture als
   Archiv, mit PDFs und der Markierung, welche Kunden geteilt sind
5. **Zugänge** — und dazu der Satz, dass hier bewusst keine Passwörter stehen

Punkt 4 ist der, den sonst niemand hat. Damit anfangen, wenn wenig Zeit ist.
