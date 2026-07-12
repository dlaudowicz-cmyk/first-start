import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveProject, getModule, getModules } from "@/lib/data";
import { computeHoursReport } from "@/lib/hours";
import { PageHeader, Card, StatusBadge, WarningList } from "@/components/ui";
import { updateModule, deleteModule } from "../actions";

function Field({
  name,
  label,
  defaultValue,
  multiline = false,
  hint,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  multiline?: boolean;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      )}
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
  );
}

export default async function ModuleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const module = await getModule(id);
  if (!module) notFound();

  const [siblingModules, project] = await Promise.all([
    getModules(module.projectId),
    getActiveProject(),
  ]);
  const report = computeHoursReport(siblingModules, project?.targetHours ?? 400);
  const moduleWarnings = report.warnings.filter((w) => w.moduleId === module.id);

  const boundUpdate = updateModule.bind(null, module.id);
  const boundDelete = deleteModule.bind(null, module.id, module.projectId);

  return (
    <div>
      <PageHeader
        title={`${module.number}. ${module.title}`}
        subtitle="Lernbereich bearbeiten"
        actions={
          <>
            <Link
              href="/curriculum"
              className="text-sm rounded-md border border-border px-3 py-1.5 font-medium hover:bg-background"
            >
              Zurück
            </Link>
            <form action={boundDelete}>
              <button
                type="submit"
                className="text-sm rounded-md border border-error text-error px-3 py-1.5 font-medium hover:bg-error-bg"
              >
                Löschen
              </button>
            </form>
          </>
        }
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form action={boundUpdate} className="lg:col-span-2 space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold">Grunddaten</h2>
            <Field name="title" label="Titel" defaultValue={module.title} />
            <Field name="summary" label="Kurzbeschreibung" defaultValue={module.summary} multiline />
            <div className="grid grid-cols-3 gap-4">
              <Field name="hoursTotal" label="Stunden gesamt" type="number" defaultValue={String(module.hoursTotal)} />
              <Field name="hoursTheory" label="davon Theorie" type="number" defaultValue={String(module.hoursTheory)} />
              <Field name="hoursPractice" label="davon Praxis" type="number" defaultValue={String(module.hoursPractice)} />
            </div>
            <label className="block">
              <span className="block text-xs font-medium text-muted mb-1">Status</span>
              <select
                name="status"
                defaultValue={module.status}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="entwurf">Entwurf</option>
                <option value="in_bearbeitung">In Bearbeitung</option>
                <option value="review">Review</option>
                <option value="freigegeben">Freigegeben</option>
              </select>
            </label>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold">Kompetenzen & Inhalte</h2>
            <Field name="learningGoal" label="Lernziel" defaultValue={module.learningGoal} multiline />
            <Field
              name="qualificationContent"
              label="Qualifikationsinhalte"
              defaultValue={module.qualificationContent}
              multiline
            />
            <Field
              name="applicationCompetence"
              label="Anwendungskompetenz"
              defaultValue={module.applicationCompetence}
              multiline
            />
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold">Praxis & Prüfung</h2>
            <Field name="practicalTask" label="Praktische Aufgabe" defaultValue={module.practicalTask} multiline />
            <Field name="learningResult" label="Lernergebnis" defaultValue={module.learningResult} multiline />
            <Field name="assessment" label="Leistungsnachweis" defaultValue={module.assessment} multiline />
            <Field
              name="teachingMethods"
              label="Empfohlene Unterrichtsform"
              defaultValue={module.teachingMethods}
            />
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold">Tools & Notizen</h2>
            <Field
              name="tools"
              label="Verwendete Tools"
              defaultValue={module.tools}
              hint="Nur das aktuelle Unterrichtswerkzeug — siehe Tool-Matrix für Details/Alternativen"
            />
            <Field name="notes" label="Notizen" defaultValue={module.notes} multiline />
          </Card>

          <button
            type="submit"
            className="text-sm btn-primary"
          >
            Speichern
          </button>
        </form>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-3">Status</h2>
            <div className="flex items-center gap-2 text-sm">
              <StatusBadge status={module.status} />
              <span className="text-muted">Version {module.version}</span>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-3">Prüfhinweise</h2>
            <WarningList warnings={moduleWarnings} />
          </Card>
        </div>
      </div>
    </div>
  );
}
