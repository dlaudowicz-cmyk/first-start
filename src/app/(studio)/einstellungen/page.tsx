import { getActiveProject } from "@/lib/data";
import { PageHeader, Card } from "@/components/ui";

export default async function EinstellungenPage() {
  const project = await getActiveProject();

  return (
    <div>
      <PageHeader title="Einstellungen" subtitle="Projektstammdaten (MVP: single-project, single-user)" />
      <div className="p-8">
        <Card className="p-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted">Projekttitel</span>
            <span>{project?.title}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted">Institution</span>
            <span>{project?.institution}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted">Zielstunden</span>
            <span>{project?.targetHours}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Fachlicher Lead</span>
            <span>Daniel Laudowicz</span>
          </div>
        </Card>
        <p className="text-sm text-muted mt-4">
          Nutzerverwaltung, Rollen (Admin/Autor/Prüfer/Dozent/Leser) und Authentifizierung sind laut
          Übergabedokument §16 kein MVP-Umfang und folgen in Priorität 3 (Mehrbenutzerbetrieb).
        </p>
      </div>
    </div>
  );
}
