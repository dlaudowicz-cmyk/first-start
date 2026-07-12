import Link from "next/link";
import { getActiveProject, getModules, getVersions } from "@/lib/data";
import { computeHoursReport } from "@/lib/hours";
import { PageHeader, Card, Stat, StatusBadge, WarningList } from "@/components/ui";

export default async function DashboardPage() {
  const project = await getActiveProject();
  if (!project) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted">Kein Projekt gefunden. Bitte Seed-Daten einspielen.</p>
      </div>
    );
  }

  const modules = await getModules(project.id);
  const versionsList = await getVersions(project.id);
  const report = computeHoursReport(modules, project.targetHours);

  const lastUpdated = modules.reduce(
    (latest, m) => (m.updatedAt > latest ? m.updatedAt : latest),
    project.updatedAt,
  );

  const errorCount = report.warnings.filter((w) => w.level === "error").length;
  const warningCount = report.warnings.filter((w) => w.level === "warning").length;

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`${project.subtitle ?? ""} · ${project.institution ?? ""}`}
        actions={
          <Link
            href="/curriculum"
            className="text-sm btn-primary"
          >
            Curriculum bearbeiten
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="animate-fade-up stagger-1">
              <Stat
                label="Gesamtstunden"
                value={`${report.totalHours}`}
                hint={`Ziel: ${report.targetHours} Std.`}
                tone={report.deviation === 0 ? "success" : report.deviation > 0 ? "error" : "warning"}
              />
            </div>
            <div className="animate-fade-up stagger-2">
              <Stat
                label="Abweichung"
                value={`${report.deviation > 0 ? "+" : ""}${report.deviation} Std.`}
                hint={report.deviation === 0 ? "Zielumfang erreicht" : undefined}
              />
            </div>
            <div className="animate-fade-up stagger-3">
              <Stat
                label="Theorie / Praxis"
                value={`${Math.round(report.theoryPercent)} / ${Math.round(report.practicePercent)} %`}
                hint="Zielverteilung: 30 / 70"
              />
            </div>
            <div className="animate-fade-up stagger-4">
              <Stat
                label="Lernbereiche"
                value={`${modules.length}`}
                hint={`${modules.filter((m) => m.status === "freigegeben").length} freigegeben`}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up stagger-2">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Stundenprüfung</h2>
              <span className="text-xs text-muted">
                {errorCount} Fehler · {warningCount} Hinweise
              </span>
            </div>
            <WarningList warnings={report.warnings} />
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Status</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Projektstatus</dt>
                <dd><StatusBadge status={project.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Letzte Änderung</dt>
                <dd>{new Date(lastUpdated).toLocaleDateString("de-DE")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Versionen</dt>
                <dd>{versionsList.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Workshop-Start</dt>
                <dd>{project.startDate}</dd>
              </div>
            </dl>
          </Card>
        </section>

        <section className="animate-fade-up stagger-3">
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Lernbereiche im Überblick</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                    <th className="py-2 pr-4">Nr.</th>
                    <th className="py-2 pr-4">Titel</th>
                    <th className="py-2 pr-4">Stunden</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-muted">{m.number}</td>
                      <td className="py-2 pr-4">
                        <Link href={`/curriculum/${m.id}`} className="hover:text-accent transition-colors">
                          {m.title}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 tabular-nums">{m.hoursTotal}</td>
                      <td className="py-2 pr-4"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
