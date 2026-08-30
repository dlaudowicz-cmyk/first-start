import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate, monthlyCost } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = await prisma.toolSubscription.findUnique({
    where: { id },
    include: { owner: true, venture: true },
  });
  if (!tool) notFound();

  const perMonth = monthlyCost(tool.costPerMonth, tool.billingCycle);

  return (
    <>
      <PageHeader
        title={tool.name}
        description={tool.plan ?? undefined}
        actions={
          <>
            {tool.url && (
              <a href={tool.url} target="_blank" rel="noreferrer" className="btn-secondary">
                <ExternalLink className="h-4 w-4" /> Open
              </a>
            )}
            <Link href={`/tools/${tool.id}/edit`} className="btn-primary">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Subscription</h2>
            <StatusBadge status={tool.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Category" value={tool.category} />
            <Row label="Plan" value={tool.plan} />
            <Row label="Seats" value={tool.seats != null ? String(tool.seats) : null} />
            <Row label="Billing" value={tool.billingCycle} />
            <Row
              label="Cost"
              value={tool.costPerMonth != null ? `${formatCurrency(tool.costPerMonth)} / ${tool.billingCycle}` : null}
            />
            <Row label="Per month" value={formatCurrency(perMonth)} />
            <Row label="Per year" value={formatCurrency(perMonth * 12)} />
            <Row label="Renews" value={tool.renewalDate ? formatDate(tool.renewalDate) : null} />
            {tool.notes && <Row label="Notes" value={tool.notes} multiline />}
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Ownership</h2>
          <dl className="text-sm space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-ink-mute">Owner</dt>
              <dd className="col-span-2">
                {tool.owner ? (
                  <Link href={`/people/${tool.owner.id}`} className="hover:underline">
                    {tool.owner.name}
                  </Link>
                ) : (
                  <span className="text-ink-faint">Unassigned</span>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-ink-mute">Venture</dt>
              <dd className="col-span-2">
                {tool.venture ? (
                  <Link href={`/ventures/${tool.venture.slug}`} className="hover:underline">
                    {tool.venture.name}
                  </Link>
                ) : (
                  <span className="text-ink-faint">Company-wide</span>
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
      <dd className={`col-span-2 ${multiline ? "whitespace-pre-line" : "capitalize"}`}>{value || "—"}</dd>
    </div>
  );
}
