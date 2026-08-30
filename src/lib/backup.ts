import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";
import { prisma } from "./db";

/**
 * Vollsicherung des OS: Datenbank plus alle abgelegten Dateien.
 *
 * Die Datenbank wird über `VACUUM INTO` gesichert, nicht kopiert. Ein einfaches
 * Kopieren der laufenden SQLite-Datei kann einen halb geschriebenen Stand
 * erwischen; VACUUM INTO schreibt einen in sich konsistenten Schnappschuss,
 * auch während die Anwendung läuft.
 */

const CONTENT: Array<{ dir: string; label: string }> = [
  { dir: path.join("storage", "projects"), label: "dateien/projekte" },
  { dir: path.join("public", "uploads"), label: "dateien/uploads" },
];

async function addDirectory(zip: JSZip, absDir: string, zipPath: string): Promise<number> {
  let count = 0;
  let entries: string[] = [];
  try {
    entries = await fs.readdir(absDir);
  } catch {
    return 0; // Ordner existiert noch nicht — kein Fehler.
  }
  for (const entry of entries) {
    const abs = path.join(absDir, entry);
    const stat = await fs.stat(abs);
    if (stat.isDirectory()) {
      count += await addDirectory(zip, abs, `${zipPath}/${entry}`);
    } else {
      zip.file(`${zipPath}/${entry}`, await fs.readFile(abs));
      count++;
    }
  }
  return count;
}

export async function buildBackup(): Promise<{ archive: Buffer; filename: string }> {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "");
  const zip = new JSZip();

  // ── Datenbank als konsistenter Schnappschuss ───────────────────────────────
  const tmp = path.join(process.cwd(), `.backup-${Date.now()}.db`);
  let dbBytes = 0;
  try {
    // Pfad wird selbst gebaut, nicht aus Nutzereingabe — kein Injection-Weg.
    await prisma.$executeRawUnsafe(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
    const buf = await fs.readFile(tmp);
    dbBytes = buf.byteLength;
    zip.file("datenbank/pushlabs.db", buf);
  } finally {
    await fs.rm(tmp, { force: true });
  }

  // ── Abgelegte Dateien ──────────────────────────────────────────────────────
  let fileCount = 0;
  for (const { dir, label } of CONTENT) {
    fileCount += await addDirectory(zip, path.join(process.cwd(), dir), label);
  }

  // ── Zahlen fürs Deckblatt ──────────────────────────────────────────────────
  const [projects, clients, invoices, offers, tasks, settings] = await Promise.all([
    prisma.project.count(),
    prisma.client.count(),
    prisma.invoice.count(),
    prisma.offer.count(),
    prisma.task.count(),
    prisma.companySettings.findUnique({ where: { id: "singleton" } }),
  ]);

  zip.file(
    "LIESMICH.md",
    `# Pushlabs Company OS — Sicherung

Erstellt: ${new Date().toLocaleString("de-DE")}
Firma: ${settings?.companyName ?? "Pushlabs"}

## Inhalt

| | |
|---|---|
| Datenbank | \`datenbank/pushlabs.db\` (${(dbBytes / 1024).toFixed(0)} KB) |
| Projektdateien | ${fileCount} Dateien |
| Projekte | ${projects} |
| Kunden | ${clients} |
| Angebote / Rechnungen | ${offers} / ${invoices} |
| Aufgaben | ${tasks} |

## Wiederherstellen

1. Anwendung beenden (\`Strg+C\` im Terminal, in dem \`npm run dev\` läuft).
2. \`datenbank/pushlabs.db\` nach \`prisma/dev.db\` kopieren — die vorhandene
   Datei dabei überschreiben.
3. Den Inhalt von \`dateien/projekte\` nach \`storage/projects\` kopieren
   und \`dateien/uploads\` nach \`public/uploads\`.
4. \`npm run dev\` starten.

Es ist keine Migration nötig: die Sicherung enthält die Datenbank so, wie sie
zum Zeitpunkt der Erstellung aussah, inklusive Schema.

## Wichtig

Diese Datei enthält **alle** Firmendaten im Klartext — Kunden, Beträge,
Steuernummer, Bankverbindung. Sie gehört an einen Ort, den du kontrollierst,
nicht in einen offenen Cloud-Ordner.

Die Sicherung enthält **keine** Passwörter oder API-Schlüssel. Der Zugangs-
Bereich des OS speichert grundsätzlich nur Verweise darauf, wo ein Secret
liegt — nie das Secret selbst.
`,
  );

  const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return { archive, filename: `pushlabs-sicherung-${stamp}.zip` };
}
