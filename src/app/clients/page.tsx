import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    include: { _count: { select: { projects: true, invoices: true } } },
  });

  return (
    <>
      <PageHeader
        title="Clients"
        description="Companies you produce for."
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
