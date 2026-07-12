import Link from "next/link";
import { PageHeader, Card } from "@/components/ui";

const EXPORTS = [
  {
    title: "Vollständiger Rahmenlehrplan (Markdown)",
    description: "Curriculum, Workshop und Tool-Matrix als durchsuchbares Markdown.",
    href: "/exports/markdown",
    download: true,
  },
  {
    title: "Vollständiger Rahmenlehrplan (PDF-Druckansicht)",
    description: "Editoriale Druckansicht, aus dem Browser als PDF speicherbar.",
    href: "/exports/print",
    download: false,
  },
  {
    title: "Rohdaten (JSON)",
    description: "Vollständiger Datenexport inkl. Stundenprüfung, z. B. für Weiterverarbeitung.",
    href: "/exports/json",
    download: true,
  },
];

export default function ExportsPage() {
  return (
    <div>
      <PageHeader title="Exporte" subtitle="Priorität 1: Markdown, JSON, PDF (Druckansicht)" />
      <div className="p-8 space-y-4">
        {EXPORTS.map((e) => (
          <Card key={e.href} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{e.title}</p>
              <p className="text-sm text-muted mt-1">{e.description}</p>
            </div>
            <Link
              href={e.href}
              target={e.download ? undefined : "_blank"}
              className="text-sm btn-primary whitespace-nowrap"
            >
              {e.download ? "Herunterladen" : "Öffnen"}
            </Link>
          </Card>
        ))}

        <Card className="p-5 border-dashed">
          <p className="text-sm font-medium">Geplant (Priorität 2/3)</p>
          <p className="text-sm text-muted mt-1">
            DOCX-Export, XLSX-Export, kompakte Übersicht, Marketing-Kurzfassung, Dozentenhandbuch-Export,
            Prüfungsübersicht — siehe <code>README.md</code> Roadmap.
          </p>
        </Card>
      </div>
    </div>
  );
}
