import { getActiveProject, getWorkshopDayModuleNumbers, getWorkshopDays } from "@/lib/data";
import { PageHeader, Card } from "@/components/ui";
import { updateWorkshopDay } from "./actions";

function Field({
  name,
  label,
  defaultValue,
  multiline = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      )}
    </label>
  );
}

export default async function WorkshopPage() {
  const project = await getActiveProject();
  if (!project) return null;

  const days = await getWorkshopDays(project.id);
  const totalHours = days.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div>
      <PageHeader
        title="Workshop-Builder"
        subtitle={`5-Tage-Intensivworkshop · Start ${project.startDate} · ${totalHours} Unterrichtsstunden gesamt`}
      />

      <div className="p-8 space-y-6">
        {await Promise.all(
          days.map(async (day) => {
            const relatedModules = await getWorkshopDayModuleNumbers(day.id);
            const bound = updateWorkshopDay.bind(null, day.id);
            return (
              <Card key={day.id} className="p-5">
                <form action={bound} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                        {day.dayNumber}
                      </span>
                      <input
                        name="title"
                        defaultValue={day.title}
                        className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-accent rounded px-1 -ml-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted shrink-0">
                      <span>Stunden:</span>
                      <input
                        name="hours"
                        type="number"
                        defaultValue={day.hours}
                        className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  {relatedModules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {relatedModules.map((m) => (
                        <span
                          key={m.number}
                          className="text-xs rounded-full bg-border px-2 py-0.5 text-muted"
                        >
                          LB {m.number} · {m.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <Field name="goal" label="Tagesziel" defaultValue={day.goal} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field name="theory" label="Theorie" defaultValue={day.theory} multiline />
                    <Field name="liveDemo" label="Live-Demo" defaultValue={day.liveDemo} multiline />
                    <Field name="exercise" label="Übung" defaultValue={day.exercise} multiline />
                    <Field name="groupTask" label="Gruppenaufgabe" defaultValue={day.groupTask} multiline />
                  </div>
                  <Field name="output" label="Tagesergebnis" defaultValue={day.output} />
                  <div className="grid grid-cols-3 gap-4">
                    <Field name="requiredTools" label="Benötigte Tools" defaultValue={day.requiredTools} />
                    <Field name="requiredAccounts" label="Benötigte Accounts" defaultValue={day.requiredAccounts} />
                    <Field name="requiredHardware" label="Benötigte Hardware" defaultValue={day.requiredHardware} />
                  </div>
                  <Field name="homework" label="Hausaufgabe / Vorbereitung" defaultValue={day.homework} />

                  <button
                    type="submit"
                    className="text-sm rounded-md bg-accent text-accent-foreground px-3 py-1.5 font-medium hover:opacity-90"
                  >
                    Speichern
                  </button>
                </form>
              </Card>
            );
          }),
        )}
      </div>
    </div>
  );
}
