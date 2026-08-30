import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { VentureBadge } from "@/components/venture-badge";
import { getActiveVenture, ventureScope } from "@/lib/venture-context";
import { formatCurrency, formatDate, monthlyCost } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const active = await getActiveVenture();
  const tools = await prisma.toolSubscription.findMany({
    where: ventureScope(active),
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { owner: true, venture: true },
  });

  const activeTools = tools.filter((t) => t.status === "active");
  const monthlyTotal = activeTools.reduce((sum, t) => sum + monthlyCost(t.costPerMonth, t.billingCycle), 0);
  const seatTotal = activeTools.reduce((sum, t) => sum + (t.seats ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Tools & SaaS"
        description="Every subscription the company pays for — who owns it, what it costs, when it renews."
        actions={
          <Link href="/tools/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Add tool
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Monthly run rate" value={formatCurrency(monthlyTotal)} hint="active subscriptions, normalized" />
        <Stat label="Yearly run rate" value={formatCurrency(monthlyTotal * 12)} />
        <Stat label="Active tools" value={String(activeTools.length)} hint={`${seatTotal} seats`} />
      </div>

      {tools.length === 0 ? (
        <EmptyState
          title="No tools recorded"
          description="Add your subscriptions to see the monthly run rate."
          action={
            <Link href="/tools/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Add tool
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Category</th>
                <th>Plan</th>
                <th className="text-right">Seats</th>
                <th>Owner</th>
                {!active && <th>Venture</th>}
                <th>Renews</th>
                <th>Status</th>
                <th className="text-right">Per month</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">
                    <Link href={`/tools/${t.id}`} className="hover:underline">
                      {t.name}
                    </Link>
                  </td>
                  <td className="capitalize text-ink">{t.category}</td>
                  <td className="text-ink-mute text-xs">{t.plan || "—"}</td>
                  <td className="text-right tabular-nums">{t.seats ?? "—"}</td>
                  <td className="text-ink">
                    {t.owner ? (
                      <Link href={`/people/${t.owner.id}`} className="hover:underline">
                        {t.owner.name}
                      </Link>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  {!active && (
                    <td>
                      <VentureBadge name={t.venture?.name} accent={t.venture?.accent} muted />
                    </td>
                  )}
                  <td className="text-xs text-ink-mute">
                    {t.renewalDate ? formatDate(t.renewalDate) : "—"}
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="text-right tabular-nums">
                    {formatCurrency(monthlyCost(t.costPerMonth, t.billingCycle))}
                    {t.billingCycle === "yearly" && (
                      <div className="text-[10px] text-ink-faint">
                        {formatCurrency(t.costPerMonth ?? 0)}/yr
                      </div>
                    )}
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

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="font-display font-semibold text-2xl mt-2 text-ink tabular-nums">{value}</div>
      {hint && <div className="text-xs text-ink-mute mt-1">{hint}</div>}
    </div>
  );
}
