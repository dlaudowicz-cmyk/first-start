import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { VentureBadge } from "@/components/venture-badge";
import { clientVentureScope, getActiveVenture } from "@/lib/venture-context";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const active = await getActiveVenture();
  const clients = await prisma.client.findMany({
    where: clientVentureScope(active),
    orderBy: { companyName: "asc" },
    include: {
      ventures: { include: { venture: true } },
      _count: { select: { projects: true, invoices: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Clients"
        description={active ? `Clients booking ${active.name}.` : "Companies you produce for, across all ventures."}
        actions={
          <Link href="/clients/new" className="btn-primary">
            <Plus className="h-4 w-4" /> New client
          </Link>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start creating projects."
          action={
            <Link href="/clients/new" className="btn-primary">
              <Plus className="h-4 w-4" /> New client
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>VAT ID</th>
                {!active && <th>Ventures</th>}
                <th className="text-right">Projects</th>
                <th className="text-right">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">
                    <Link href={`/clients/${c.id}`} className="hover:underline">
                      {c.companyName}
                    </Link>
                  </td>
                  <td className="text-graphite-700">{c.contactPerson || "—"}</td>
                  <td className="text-graphite-700">{c.email || "—"}</td>
                  <td className="text-graphite-500">{c.vatId || "—"}</td>
                  {!active && (
                    <td>
                      {c.ventures.length === 0 ? (
                        <span className="text-xs text-graphite-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {c.ventures.map((cv) => (
                            <VentureBadge key={cv.id} name={cv.venture.name} accent={cv.venture.accent} muted />
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="text-right tabular-nums">{c._count.projects}</td>
                  <td className="text-right tabular-nums">{c._count.invoices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
