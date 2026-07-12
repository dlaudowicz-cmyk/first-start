import { PageHeader, Card } from "@/components/ui";

export default function KommentarePage() {
  return (
    <div>
      <PageHeader
        title="Kommentare"
        subtitle="Priorität 2 — Datenmodell steht, UI folgt im nächsten Modul"
      />
      <div className="p-8">
        <Card className="p-5">
          <p className="text-sm text-muted">
            Kommentare sollen auf Projekt-, Lernbereichs-, Feld-, Workshop-Tag-, Prüfungs- und Export-Ebene
            möglich sein, mit Status offen/in Bearbeitung/erledigt/abgelehnt (§5.8). Die Tabelle
            <code className="mx-1 px-1 rounded bg-border">comments</code>
            ist bereits im Schema angelegt (<code>src/db/schema.ts</code>) und referenziert beliebige
            Zielobjekte über <code>target_type</code>/<code>target_id</code> — die Freigabe- und
            Kommentar-UI ist Priorität 2 (siehe README-Roadmap).
          </p>
        </Card>
      </div>
    </div>
  );
}
