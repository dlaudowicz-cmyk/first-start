import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Download, ReceiptEuro } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { items: true, client: true, project: true },
  });
  if (!offer) notFound();

  const items = [...offer.items].sort((a, b) => a.position - b.position);
  const totals = calculateTotals(items, offer.vatRate);

  return (
    <>
      <PageHeader
        title={offer.number}
        description={`${offer.client.companyName} · ${formatDate(offer.date)}`}
        actions={
          <>
            <a href={`/offers/${offer.id}/pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
              <Download className="h-4 w-4" /> PDF herunterladen
            </a>
            <Link href={`/offers/${offer.id}/edit`} className="btn-secondary">
              <Pencil className="h-4 w-4" /> Bearbeiten
            </Link>
            <Link href={`/invoices/new?fromOffer=${offer.id}`} className="btn-primary">
              <ReceiptEuro className="h-4 w-4" /> Rechnung daraus erstellen
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Details</h2>
            <StatusBadge status={offer.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Kunde" value={offer.client.companyName} />
            <Row label="Projekt" value={offer.project?.title ?? null} />
            <Row label="Datum" value={formatDate(offer.date)} />
            <Row label="Gültig bis" value={offer.validUntil ? formatDate(offer.validUntil) : null} />
            <Row label="USt-Satz" value={`${offer.vatRate}%`} />
            {offer.paymentTerms && <Row label="Zahlungsbedingungen" value={offer.paymentTerms} multiline />}
            {offer.notes && <Row label="Notizen" value={offer.notes} multiline />}
          </dl>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Positionen</h2>
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Leistung</th>
                <th className="text-right w-24">Menge</th>
                <th className="text-right w-28">Einzelpreis</th>
                <th className="text-right w-32">Summe</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id}>
                  <td className="text-ink-mute">{idx + 1}</td>
                  <td>{it.description}</td>
                  <td className="text-right tabular-nums">
                    {it.quantity} {it.unit || ""}
                  </td>
                  <td className="text-right tabular-nums">{formatCurrency(it.unitPrice)}</td>
                  <td className="text-right tabular-nums">{formatCurrency(totals.itemTotals[idx])}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 flex justify-end">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-mute">Netto</span>
                <span className="tabular-nums">{formatCurrency(totals.net)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-mute">MwSt {offer.vatRate}%</span>
                <span className="tabular-nums">{formatCurrency(totals.vat)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 mt-1.5 font-semibold text-base">
                <span>Brutto</span>
                <span className="tabular-nums">{formatCurrency(totals.gross)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Row({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-ink-mute col-span-1">{label}</dt>
      <dd className={`col-span-2 ${multiline ? "whitespace-pre-line" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
