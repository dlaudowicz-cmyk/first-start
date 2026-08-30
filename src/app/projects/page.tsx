import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { VentureBadge } from "@/components/venture-badge";
import { getActiveVenture, ventureScope } from "@/lib/venture-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { de } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const active = await getActiveVenture();
  const projects = await prisma.project.findMany({
    where: ventureScope(active),
    orderBy: { updatedAt: "desc" },
    include: { client: true, venture: true },
  });

  return (
    <>
      <PageHeader
        title="Projekte"
        description={
          active ? `Productions inside ${active.name}.` : "Jede Produktion von der Anfrage bis zur Auslieferung."
        }
        actions={
          <Link href="/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Neues Projekt
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Noch keine Projekte"
          description="Erstes Projekt anlegen, um Produktionen zu verfolgen."
          action={
            <Link href="/projects/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Neues Projekt
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Projekt</th>
                <th>Kunde</th>
                <th>Art</th>
                {!active && <th>Venture</th>}
                <th>Drehtermin</th>
                <th>Status</th>
                <th className="text-right">Budget</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">
                    <Link href={`/projects/${p.id}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="text-ink">
                    <Link href={`/clients/${p.client.id}`} className="hover:underline">
                      {p.client.companyName}
                    </Link>
                  </td>
                  <td className="text-ink">{de.projectType(p.type)}</td>
                  {!active && (
                    <td>
                      <VentureBadge name={p.venture?.name} accent={p.venture?.accent} muted />
                    </td>
                  )}
                  <td className="text-ink-mute text-xs">
                    {p.shootStart ? formatDate(p.shootStart) : "—"}
                    {p.shootEnd ? ` → ${formatDate(p.shootEnd)}` : ""}
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="text-right tabular-nums">
                    {p.budget != null ? formatCurrency(p.budget) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
