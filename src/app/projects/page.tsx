import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { client: true },
  });

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every production from lead to delivered."
        actions={
          <Link href="/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking productions."
          action={
            <Link href="/projects/new" className="btn-primary">
              <Plus className="h-4 w-4" /> New project
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Type</th>
                <th>Shoot dates</th>
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
                  <td className="text-graphite-700">
                    <Link href={`/clients/${p.client.id}`} className="hover:underline">
                      {p.client.companyName}
                    </Link>
                  </td>
                  <td className="capitalize text-graphite-700">{p.type}</td>
                  <td className="text-graphite-500 text-xs">
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
