import type { VentureExport } from "./venture-export";
import { formatCurrency, formatDate } from "./utils";

/** Human-readable entry point for the export archive. */
export function buildExportReadme(data: NonNullable<VentureExport>, generatedAt: Date): string {
  const s = data.summary;
  const v = data.venture;
  const shared = data.clients.filter((c) => c.shared);

  return `# ${v.name} — Venture Export

Generated: ${formatDate(generatedAt, { dateStyle: "long" })}
${data.holding ? `Holding: ${data.holding.companyName} (${data.holding.owner})` : ""}

${v.tagline ? `> ${v.tagline}\n` : ""}
## Profile

| Field | Value |
|---|---|
| Name | ${v.name} |
| Slug | \`${v.slug}\` |
| Kind | ${v.kind} |
| Status | ${v.status} |
| Founded | ${v.foundedAt ? formatDate(v.foundedAt) : "—"} |

${v.description ? `${v.description}\n` : ""}
## Key figures

| Metric | Value |
|---|---|
| Revenue (paid invoices) | ${formatCurrency(s.revenuePaid)} |
| Open invoices | ${formatCurrency(s.revenueOpen)} |
| Offer pipeline | ${formatCurrency(s.offerPipeline)} |
| Tool cost per month | ${formatCurrency(s.toolCostPerMonth)} |
| Invoicing period | ${s.firstInvoice ? formatDate(s.firstInvoice) : "—"} → ${s.lastInvoice ? formatDate(s.lastInvoice) : "—"} |

## Contents

| Records | Count |
|---|---|
| Clients | ${s.clients}${s.sharedClients > 0 ? ` (${s.sharedClients} shared)` : ""} |
| Team members | ${s.teamSize} |
| Projects | ${s.projects} |
| Offers | ${s.offers} |
| Invoices | ${s.invoices} |
| Contracts | ${s.contracts} |
| Vault references | ${s.credentials} |
| Tool subscriptions | ${s.tools} |
| Tasks | ${s.tasks} (${s.openTasks} open) |

## Archive layout

\`\`\`
README.md              this file
data/*.json            complete records, machine-readable and re-importable
data/*.csv             flat views for Excel / accounting
documents/offers/      offer PDFs
documents/invoices/    invoice PDFs
zugferd/               structured invoice data, ready for ZUGFeRD XML mapping
\`\`\`

${
  shared.length > 0
    ? `## Shared records

${shared.length} client${shared.length === 1 ? " is" : "s are"} also active in other Pushlabs ventures. They are
included here in full and flagged with \`"shared": true\` in \`data/clients.json\`:

${shared.map((c) => `- **${c.companyName}** — also in ${c.alsoInVentures.join(", ")}`).join("\n")}
`
    : `## Shared records

No client of this venture is active in another Pushlabs venture — this export is fully self-contained.
`
}
## Notes on the vault export

\`data/credentials.json\` contains **references only**: which service exists, who owns it, and where the secret is
kept. No passwords, keys or tokens are stored in the Pushlabs OS database, so this archive cannot be used to gain
access to any system.
`;
}
