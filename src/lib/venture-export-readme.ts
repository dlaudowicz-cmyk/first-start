import type { VentureExport } from "./venture-export";
import { formatCurrency, formatDate } from "./utils";

/** Human-readable entry point for the export archive. */
export function buildExportReadme(data: NonNullable<VentureExport>, generatedAt: Date): string {
  const s = data.summary;
  const v = data.venture;
  const shared = data.clients.filter((c) => c.shared);

  return `# ${v.name} — Venture-Export

Erstellt: ${formatDate(generatedAt, { dateStyle: "long" })}
${data.holding ? `Holding: ${data.holding.companyName} (${data.holding.owner})` : ""}

${v.tagline ? `> ${v.tagline}\n` : ""}
## Profil

| Feld | Wert |
|---|---|
| Name | ${v.name} |
| Kürzel | \`${v.slug}\` |
| Art | ${v.kind} |
| Status | ${v.status} |
| Gegründet | ${v.foundedAt ? formatDate(v.foundedAt) : "—"} |

${v.description ? `${v.description}\n` : ""}
## Kennzahlen

| Kennzahl | Wert |
|---|---|
| Umsatz (bezahlte Rechnungen) | ${formatCurrency(s.revenuePaid)} |
| Offene Rechnungen | ${formatCurrency(s.revenueOpen)} |
| Angebots-Pipeline | ${formatCurrency(s.offerPipeline)} |
| Werkzeugkosten pro Monat | ${formatCurrency(s.toolCostPerMonth)} |
| Abrechnungszeitraum | ${s.firstInvoice ? formatDate(s.firstInvoice) : "—"} → ${s.lastInvoice ? formatDate(s.lastInvoice) : "—"} |

## Inhalt

| Datensätze | Anzahl |
|---|---|
| Kunden | ${s.clients}${s.sharedClients > 0 ? ` (${s.sharedClients} geteilt)` : ""} |
| Teamgröße | ${s.teamSize} |
| Projekte | ${s.projects} |
| Angebote | ${s.offers} |
| Rechnungen | ${s.invoices} |
| Verträge | ${s.contracts} |
| Zugangsverweise | ${s.credentials} |
| Werkzeug-Abos | ${s.tools} |
| Aufgaben | ${s.tasks} (${s.openTasks} offen) |
| Projektdateien | ${s.files} |

## Aufbau des Archivs

\`\`\`
README.md              diese Datei
data/*.json            vollständige Datensätze, maschinenlesbar
data/*.csv             flache Sichten für Excel und Buchhaltung
documents/offers/      Angebots-PDFs
documents/invoices/    Rechnungs-PDFs
documents/projects/    abgelegte Projektdokumente, nach Projekt und Kategorie
zugferd/               strukturierte Rechnungsdaten, vorbereitet für ZUGFeRD-XML
\`\`\`

${
  shared.length > 0
    ? `## Geteilte Datensätze

${shared.length} Kunde(n) sind auch in anderen Pushlabs-Ventures aktiv. Sie sind hier
vollständig enthalten und markiert mit \`"shared": true\` in \`data/clients.json\`:

${shared.map((c) => `- **${c.companyName}** — außerdem in ${c.alsoInVentures.join(", ")}`).join("\n")}
`
    : `## Geteilte Datensätze

Kein Kunde dieses Ventures ist in einem anderen Pushlabs-Venture aktiv — dieser Export steht für sich.
`
}
## Hinweis zum Zugangsverzeichnis

\`data/credentials.json\` enthält **nur Verweise**: welcher Dienst existiert, wer zuständig ist und wo das Secret liegt.
Im Pushlabs OS werden keine Passwörter, Schlüssel oder Tokens gespeichert — dieses Archiv verschafft
niemandem Zugang zu irgendeinem System.
`;
}
