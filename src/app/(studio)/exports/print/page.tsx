import { getActiveProject, getModules, getWorkshopDays, getTools } from "@/lib/data";
import { computeHoursReport } from "@/lib/hours";
import { PrintButton } from "../print-button";

export default async function PrintExportPage() {
  const project = await getActiveProject();
  if (!project) return null;

  const [modules, days, toolList] = await Promise.all([
    getModules(project.id),
    getWorkshopDays(project.id),
    getTools(),
  ]);
  const report = computeHoursReport(modules, project.targetHours);

  return (
    <div className="max-w-4xl mx-auto px-10 py-10 print:px-0 print:py-0">
      <div className="flex justify-end mb-6">
        <PrintButton />
      </div>

      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">{project.title}</h1>
        {project.subtitle && <p className="text-muted">{project.subtitle}</p>}
        <p className="text-sm text-muted mt-2">
          {project.institution} · {report.totalHours} von {report.targetHours} Unterrichtsstunden
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Curriculum-Übersicht</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="py-1.5 pr-3">Nr.</th>
              <th className="py-1.5 pr-3">Lernbereich</th>
              <th className="py-1.5 pr-3">Stunden</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-border/60">
                <td className="py-1.5 pr-3">{m.number}</td>
                <td className="py-1.5 pr-3">{m.title}</td>
                <td className="py-1.5 pr-3">{m.hoursTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {modules.map((m) => (
        <section key={m.id} className="mb-6 break-inside-avoid">
          <h3 className="text-base font-semibold">
            {m.number}. {m.title}
          </h3>
          {m.summary && <p className="text-sm text-muted mt-1">{m.summary}</p>}
          <dl className="text-sm mt-2 space-y-1">
            {m.learningGoal && (
              <div><dt className="inline font-medium">Lernziel: </dt><dd className="inline">{m.learningGoal}</dd></div>
            )}
            {m.practicalTask && (
              <div><dt className="inline font-medium">Praktische Aufgabe: </dt><dd className="inline">{m.practicalTask}</dd></div>
            )}
            {m.assessment && (
              <div><dt className="inline font-medium">Leistungsnachweis: </dt><dd className="inline">{m.assessment}</dd></div>
            )}
          </dl>
        </section>
      ))}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Workshop (5 Tage)</h2>
        {days.map((d) => (
          <div key={d.id} className="mb-3 break-inside-avoid">
            <h3 className="text-base font-semibold">
              Tag {d.dayNumber}: {d.title} ({d.hours} Std.)
            </h3>
            {d.output && <p className="text-sm text-muted">Ergebnis: {d.output}</p>}
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Tool-Matrix</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="py-1.5 pr-3">Tool</th>
              <th className="py-1.5 pr-3">Kategorie</th>
              <th className="py-1.5 pr-3">Einsatzzweck</th>
            </tr>
          </thead>
          <tbody>
            {toolList.map((t) => (
              <tr key={t.id} className="border-b border-border/60">
                <td className="py-1.5 pr-3">{t.name}</td>
                <td className="py-1.5 pr-3">{t.category}</td>
                <td className="py-1.5 pr-3">{t.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
