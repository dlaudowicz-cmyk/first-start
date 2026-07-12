import { getActiveProject } from "@/lib/data";
import { getActiveProgram, getUnmappedCurriculumModules } from "@/lib/academy-data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { createCourseFromModule } from "./actions";

export default async function CurriculumSyncPage() {
  const project = await getActiveProject();
  const program = await getActiveProgram();
  if (!project || !program) return null;

  const mapping = await getUnmappedCurriculumModules(project.id, program.id);

  return (
    <div>
      <PageHeader
        title="Curriculum-Sync"
        subtitle="Lernbereiche aus dem Studio ↔ Academy-Kurse (§42 Publishing-Workflow)"
      />
      <div className="p-8">
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                <th className="py-3 px-4">Lernbereich (Studio)</th>
                <th className="py-3 px-4 w-32">Stunden</th>
                <th className="py-3 px-4 w-56">Academy-Kurs</th>
                <th className="py-3 px-4 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {mapping.map(({ module, course, mapped }) => {
                const bound = createCourseFromModule.bind(
                  null,
                  program.id,
                  module.id,
                  module.title,
                  module.summary,
                  module.hoursTotal,
                );
                return (
                  <tr key={module.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      {module.number}. {module.title}
                    </td>
                    <td className="py-3 px-4 tabular-nums">{module.hoursTotal}</td>
                    <td className="py-3 px-4">
                      {course ? <StatusBadge status={course.status} /> : <span className="text-muted text-xs">nicht übernommen</span>}
                    </td>
                    <td className="py-3 px-4">
                      {!mapped && (
                        <form action={bound}>
                          <button type="submit" className="text-xs rounded-md border border-border px-2.5 py-1 hover:bg-background">
                            Übernehmen
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
