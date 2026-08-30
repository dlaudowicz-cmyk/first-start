import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { calculateTotals } from "@/lib/calculations";
import { VentureBadge } from "@/components/venture-badge";
import { getActiveVenture, ventureScope } from "@/lib/venture-context";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const active = await getActiveVenture();
  const Rechnungen = await prisma.invoice.findMany({
    where: ventureScope(active),
    orderBy: [{ date: "desc" }, { number: "desc" }],
    include: { items: true, client: true, project: true, venture: true },
  });

  return (
    <>
      <PageHeader
        title="Rechnungen"
        description={
          active
            ? `Invoices issued by ${active.name}.`
            : "Rechnungen mit PDF-Export und ZUGFeRD-fähiger Datenstruktur."
        }
        actions={
          <Link href="/invoices/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Neue Rechnung
          </Link>
        }
      />

      {Rechnungen.length === 0 ? (
        <EmptyState
          title="Noch keine Rechnungen"
          description="Create your first invoice — numbering starts at RE-001-0026."
          action={
            <Link href="/invoices/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Neue Rechnung
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nummer</th>
                <th>Datum</th>
                <th>Fällig</th>
                <th>Kunde</th>
                {!active && <th>Venture</th>}
                <th>Projekt</th>
                <th>Status</th>
                <th className="text-right">Brutto</th>
              </tr>
            </thead>
            <tbody>
              {Rechnungen.map((inv) => {
                const t = calculateTotals(inv.items, inv.vatRate);
                return (
                  <tr key={inv.id}>
                    <td className="font-medium">
                      <Link href={`/invoices/${inv.id}`} className="hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td>{formatDate(inv.date)}</td>
                    <td>{inv.dueDate ? formatDate(inv.dueDate) : "—"}</td>
                    <td>{inv.client.companyName}</td>
                    {!active && (
                      <td>
                        <VentureBadge name={inv.venture?.name} accent={inv.venture?.accent} muted />
                      </td>
                    )}
                    <td className="text-ink-mute truncate max-w-[200px]">{inv.project?.title || "—"}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="text-right tabular-nums">{formatCurrency(t.gross)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
