import { getActiveProject, getVersions } from "@/lib/data";
import { PageHeader, Card } from "@/components/ui";
import { createVersion } from "./actions";
import { VersionStatusForm } from "./version-status-form";

const STATUS_OPTIONS = [
  "entwurf",
  "intern_geprueft",
  "fam_geprueft",
  "ihk_fassung",
  "freigegeben",
  "archiviert",
];

export default async function VersionsPage() {
  const project = await getActiveProject();
  if (!project) return null;
  const versionsList = await getVersions(project.id);
  const boundCreate = createVersion.bind(null, project.id);

  return (
    <div>
      <PageHeader
        title="Versionen"
        subtitle="Snapshot-Versionierung des Gesamtprojekts (Curriculum + Workshop)"
      />

      <div className="p-8 space-y-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Neue Version erzeugen</h2>
          <form action={boundCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <label className="block md:col-span-1">
              <span className="block text-xs font-medium text-muted mb-1">Bezeichnung</span>
              <input
                name="label"
                placeholder="z. B. Erste FAM-Abstimmung"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block md:col-span-1">
              <span className="block text-xs font-medium text-muted mb-1">Status</span>
              <select name="status" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-1">
              <span className="block text-xs font-medium text-muted mb-1">Änderungsnotiz</span>
              <input
                name="changeLog"
                placeholder="Was hat sich geändert?"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="text-sm rounded-md bg-accent text-accent-foreground px-4 py-2 font-medium hover:opacity-90 h-fit"
            >
              Version speichern
            </button>
          </form>
        </Card>

        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                <th className="py-3 px-4 w-16">Nr.</th>
                <th className="py-3 px-4">Bezeichnung</th>
                <th className="py-3 px-4">Änderungsnotiz</th>
                <th className="py-3 px-4 w-40">Status</th>
                <th className="py-3 px-4 w-32">Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {versionsList
                .slice()
                .reverse()
                .map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-muted">v{v.versionNumber}</td>
                    <td className="py-3 px-4 font-medium">{v.label}</td>
                    <td className="py-3 px-4 text-muted">{v.changeLog}</td>
                    <td className="py-3 px-4">
                      <VersionStatusForm versionId={v.id} status={v.status} />
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(v.createdAt).toLocaleDateString("de-DE")}
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
