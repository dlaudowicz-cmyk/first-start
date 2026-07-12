import { getModules, getActiveProject } from "@/lib/data";
import { PageHeader, Card } from "@/components/ui";

export default async function DozentenhandbuchPage() {
  const project = await getActiveProject();
  const modules = project ? await getModules(project.id) : [];

  return (
    <div>
      <PageHeader
        title="Dozentenhandbuch"
        subtitle="Priorität 2 — Datenmodell steht, Redaktionsoberfläche folgt im nächsten Modul"
      />
      <div className="p-8 space-y-4">
        <Card className="p-5">
          <p className="text-sm text-muted">
            Zu jedem Lernbereich werden hier Ablauf, Trainerhinweise, Live-Demos, Beispielprompts,
            typische Fehler, Musterlösungen und Bewertungsraster gepflegt (§5.5). Die Datenbank-Tabelle
            <code className="mx-1 px-1 rounded bg-border">teaching_materials</code>
            existiert bereits und ist an Lernbereiche und Workshop-Tage anknüpfbar — die Bearbeitungsoberfläche
            ist bewusst noch nicht gebaut (Priorität 2, siehe README-Roadmap).
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-3">Lernbereiche (Referenz)</h2>
          <ul className="text-sm space-y-1">
            {modules.map((m) => (
              <li key={m.id} className="text-muted">
                {m.number}. {m.title}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
