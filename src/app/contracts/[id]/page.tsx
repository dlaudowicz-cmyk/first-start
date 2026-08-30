import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { venture: true, client: true, person: true },
  });
  if (!contract) notFound();

  const remaining = daysUntil(contract.endDate);

  return (
    <>
      <PageHeader
        title={contract.title}
        description={`${contract.type} · ${contract.counterparty}`}
        actions={
          <Link href={`/contracts/${contract.id}/edit`} className="btn-primary">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Terms</h2>
            <StatusBadge status={contract.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Counterparty" value={contract.counterparty} />
            <Row label="Type" value={contract.type} />
            <Row label="Signed" value={contract.signedAt ? formatDate(contract.signedAt) : null} />
            <Row label="Start" value={contract.startDate ? formatDate(contract.startDate) : null} />
            <Row
              label="End"
              value={
                contract.endDate
                  ? `${formatDate(contract.endDate)}${
                      remaining != null
                        ? remaining < 0
                          ? ` · ${Math.abs(remaining)} days overdue`
                          : ` · in ${remaining} days`
                        : ""
                    }`
                  : null
              }
            />
            <Row
              label="Notice period"
              value={contract.noticePeriodDays != null ? `${contract.noticePeriodDays} days` : null}
            />
            <Row label="Value" value={contract.value != null ? formatCurrency(contract.value) : null} />
            {contract.notes && <Row label="Notes" value={contract.notes} multiline />}
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Linked to</h2>
          <dl className="text-sm space-y-3">
            <div>
              <dt className="text-ink-mute text-xs uppercase tracking-wider">Venture</dt>
              <dd className="mt-0.5">
                {contract.venture ? (
                  <Link href={`/ventures/${contract.venture.slug}`} className="hover:underline">
                    {contract.venture.name}
                  </Link>
                ) : (
                  <span className="text-ink-faint">Company-wide</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-ink-mute text-xs uppercase tracking-wider">Client</dt>
              <dd className="mt-0.5">
                {contract.client ? (
                  <Link href={`/clients/${contract.client.id}`} className="hover:underline">
                    {contract.client.companyName}
                  </Link>
                ) : (
                  <span className="text-ink-faint">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-ink-mute text-xs uppercase tracking-wider">Person</dt>
              <dd className="mt-0.5">
                {contract.person ? (
                  <Link href={`/people/${contract.person.id}`} className="hover:underline">
                    {contract.person.name}
                  </Link>
                ) : (
                  <span className="text-ink-faint">—</span>
                )}
              </dd>
            </div>
          </dl>
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
