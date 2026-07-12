import { getTools } from "@/lib/data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div>
      <PageHeader
        title="Tool-Matrix"
        subtitle={`${tools.length} Werkzeuge · Schwerpunkt erster Workshop: Nano Banana, Veo, Gemini`}
      />
      <div className="p-8">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Kategorie</th>
                  <th className="py-3 px-4">Anbieter</th>
                  <th className="py-3 px-4">Einsatzzweck</th>
                  <th className="py-3 px-4">Kosten</th>
                  <th className="py-3 px-4">Mindestalter</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 font-medium">{t.name}</td>
                    <td className="py-3 px-4 text-muted">{t.category}</td>
                    <td className="py-3 px-4 text-muted">{t.provider}</td>
                    <td className="py-3 px-4">{t.purpose}</td>
                    <td className="py-3 px-4 text-muted">{t.pricing}</td>
                    <td className="py-3 px-4 text-muted">{t.minAge ?? "–"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
