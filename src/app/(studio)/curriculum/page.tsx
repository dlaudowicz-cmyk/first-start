import Link from "next/link";
import { getActiveProject, getModules } from "@/lib/data";
import { computeHoursReport } from "@/lib/hours";
import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { createModule, moveModule } from "./actions";

export default async function CurriculumPage() {
  const project = await getActiveProject();
  if (!project) return null;

  const modules = await getModules(project.id);
  const report = computeHoursReport(modules, project.targetHours);

  const createModuleWithProject = createModule.bind(null, project.id);

  return (
    <div>
      <PageHeader
        title="Curriculum"
        subtitle={`${modules.length} Lernbereiche · ${report.totalHours} von ${report.targetHours} Stunden`}
        actions={
          <form action={createModuleWithProject}>
            <button
              type="submit"
              className="text-sm btn-primary"
            >
              + Lernbereich
            </button>
          </form>
        }
      />

      <div className="p-8">
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                <th className="py-3 px-4 w-16">Nr.</th>
                <th className="py-3 px-4">Titel</th>
                <th className="py-3 px-4 w-28">Stunden</th>
                <th className="py-3 px-4 w-40">Status</th>
                <th className="py-3 px-4 w-24">Version</th>
                <th className="py-3 px-4 w-24 no-print">Reihenfolge</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m, i) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-background/60">
                  <td className="py-3 px-4 text-muted tabular-nums">{m.number}</td>
                  <td className="py-3 px-4">
                    <Link href={`/curriculum/${m.id}`} className="font-medium hover:underline">
                      {m.title}
                    </Link>
                    {m.summary && (
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{m.summary}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 tabular-nums">{m.hoursTotal}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3 px-4 text-muted">v{m.version}</td>
                  <td className="py-3 px-4 no-print">
                    <div className="flex gap-1">
                      <form action={moveModule.bind(null, project.id, m.id, "up")}>
                        <button
                          type="submit"
                          disabled={i === 0}
                          className="w-6 h-6 rounded border border-border text-xs disabled:opacity-30"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={moveModule.bind(null, project.id, m.id, "down")}>
                        <button
                          type="submit"
                          disabled={i === modules.length - 1}
                          className="w-6 h-6 rounded border border-border text-xs disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
