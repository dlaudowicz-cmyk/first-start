import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Download, FileJson, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { markInvoicePaid } from "../actions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, client: true, project: true },
  });
  if (!invoice) notFound();

  const items = [...invoice.items].sort((a, b) => a.position - b.position);
  const totals = calculateTotals(items, invoice.vatRate);

  async function handleMarkPaid() {
    "use server";
    await markInvoicePaid(id);
  }

  return (
    <>
      <PageHeader
        title={invoice.number}
        description={`${invoice.client.companyName} · ${formatDate(invoice.date)}`}
        actions={
          <>
            <a href={`/invoices/${invoice.id}/zugferd.json`} target="_blank" rel="noreferrer" className="btn-secondary">
              <FileJson className="h-4 w-4" /> ZUGFeRD-JSON
            </a>
            <a href={`/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer" className="btn-secondary">
              <Download className="h-4 w-4" /> PDF herunterladen
            </a>
            {invoice.status !== "paid" && (
              <form action={handleMarkPaid}>
                <button type="submit" className="btn-secondary">
                  <CheckCircle2 className="h-4 w-4" /> Als bezahlt markieren
                </button>
              </form>
            )}
            <Link href={`/invoices/${invoice.id}/edit`} className="btn-primary">
              <Pencil className="h-4 w-4" /> Bearbeiten
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Details</h2>
            <StatusBadge status={invoice.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Kunde" value={invoice.client.companyName} />
            <Row label="Projekt" value={invoice.project?.title ?? null} />
            <Row label="Rechnungsdatum" value={formatDate(invoice.date)} />
            <Row label="Fällig am" value={invoice.dueDate ? formatDate(invoice.dueDate) : null} />
            <Row label="USt-Satz" value={`${invoice.vatRate}%`} />
            {invoice.paidAt && <Row label="Paid on" value={formatDate(invoice.paidAt)} />}
            {invoice.paymentTerms && <Row label="Zahlungsbedingungen" value={invoice.paymentTerms} multiline />}
            {invoice.notes && <Row label="Notizen" value={invoice.notes} multiline />}
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
                <span className="text-ink-mute">MwSt {invoice.vatRate}%</span>
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
