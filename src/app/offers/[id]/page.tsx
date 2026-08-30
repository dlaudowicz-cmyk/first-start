import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Download } from "lucide-react";
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
              <Download className="h-4 w-4" /> Download PDF
            </a>
            <Link href={`/offers/${offer.id}/edit`} className="btn-primary">
              <Pencil className="h-4 w-4" /> Edit
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
            <Row label="Client" value={offer.client.companyName} />
            <Row label="Project" value={offer.project?.title ?? null} />
            <Row label="Date" value={formatDate(offer.date)} />
            <Row label="Valid until" value={offer.validUntil ? formatDate(offer.validUntil) : null} />
            <Row label="VAT rate" value={`${offer.vatRate}%`} />
            {offer.paymentTerms && <Row label="Payment terms" value={offer.paymentTerms} multiline />}
            {offer.notes && <Row label="Notes" value={offer.notes} multiline />}
          </dl>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Line items</h2>
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Description</th>
                <th className="text-right w-24">Qty</th>
                <th className="text-right w-28">Unit price</th>
                <th className="text-right w-32">Line total</th>
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
                <span className="text-ink-mute">Net</span>
                <span className="tabular-nums">{formatCurrency(totals.net)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-mute">VAT {offer.vatRate}%</span>
                <span className="tabular-nums">{formatCurrency(totals.vat)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 mt-1.5 font-semibold text-base">
                <span>Gross</span>
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
