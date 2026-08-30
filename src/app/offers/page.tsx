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

export default async function OffersPage() {
  const active = await getActiveVenture();
  const offers = await prisma.offer.findMany({
    where: ventureScope(active),
    orderBy: { date: "desc" },
    include: { items: true, client: true, project: true, venture: true },
  });

  return (
    <>
      <PageHeader
        title="Angebote"
        description={
          active
            ? `Proposals for ${active.name}.`
            : "Angebote in Markenoptik, als PDF exportierbar."
        }
        actions={
          <Link href="/offers/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Neues Angebot
          </Link>
        }
      />

      {offers.length === 0 ? (
        <EmptyState
          title="Noch keine Angebote"
          description="Erstes Angebot anlegen."
          action={
            <Link href="/offers/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Neues Angebot
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
                <th>Kunde</th>
                {!active && <th>Venture</th>}
                <th>Projekt</th>
                <th>Gültig bis</th>
                <th>Status</th>
                <th className="text-right">Brutto</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => {
                const t = calculateTotals(o.items, o.vatRate);
                return (
                  <tr key={o.id}>
                    <td className="font-medium">
                      <Link href={`/offers/${o.id}`} className="hover:underline">
                        {o.number}
                      </Link>
                    </td>
                    <td>{formatDate(o.date)}</td>
                    <td>{o.client.companyName}</td>
                    {!active && (
                      <td>
                        <VentureBadge name={o.venture?.name} accent={o.venture?.accent} muted />
                      </td>
                    )}
                    <td className="text-ink-mute truncate max-w-[200px]">{o.project?.title || "—"}</td>
                    <td>{o.validUntil ? formatDate(o.validUntil) : "—"}</td>
                    <td>
                      <StatusBadge status={o.status} />
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
