import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { VentureBadge } from "@/components/venture-badge";
import { getActiveVenture, ventureScope } from "@/lib/venture-context";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Contracts within this window need attention before the notice period lapses. */
const EXPIRY_WARNING_DAYS = 120;

export default async function ContractsPage() {
  const active = await getActiveVenture();
  const contracts = await prisma.contract.findMany({
    where: ventureScope(active),
    orderBy: [{ status: "asc" }, { endDate: "asc" }],
    include: { venture: true, client: true, person: true },
  });

  const expiring = contracts.filter((c) => {
    if (c.status === "terminated" || c.status === "expired") return false;
    const d = daysUntil(c.endDate);
    return d != null && d <= EXPIRY_WARNING_DAYS;
  });

  return (
    <>
      <PageHeader
        title="Verträge"
        description={
          active
            ? `Contract register for ${active.name}.`
            : "Jede Vereinbarung, an der Pushlabs beteiligt ist — Kunden, Freelance, Kooperationen, Miete."
        }
        actions={
          <Link href="/contracts/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Vertrag hinzufügen
          </Link>
        }
      />

      {expiring.length > 0 && (
        <div className="card p-4 mb-6 border-warn/30 bg-warn/10">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-warn mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-warn">
                {expiring.length} contract{expiring.length === 1 ? "" : "s"} ending within {EXPIRY_WARNING_DAYS} days
              </span>
              <ul className="mt-1 text-ink space-y-0.5">
                {expiring.map((c) => {
                  const d = daysUntil(c.endDate)!;
                  return (
                    <li key={c.id}>
                      <Link href={`/contracts/${c.id}`} className="underline hover:no-underline">
                        {c.title}
                      </Link>{" "}
                      — {d < 0 ? `${Math.abs(d)} Tage überfällig` : `in ${d} days`}
                      {c.noticePeriodDays ? ` · ${c.noticePeriodDays} Tage Kündigungsfrist` : ""}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <EmptyState
          title="Keine Verträge erfasst"
          description="Ersten Vertrag erfassen, um Konditionen und Fristen im Blick zu behalten."
          action={
            <Link href="/contracts/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Vertrag hinzufügen
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Vertrag</th>
                <th>Art</th>
                <th>Vertragspartner</th>
                {!active && <th>Venture</th>}
                <th>Laufzeit</th>
                <th>Status</th>
                <th className="text-right">Wert</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">
                    <Link href={`/contracts/${c.id}`} className="hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="capitalize text-ink">{c.type}</td>
                  <td className="text-ink">{c.counterparty}</td>
                  {!active && (
                    <td>
                      <VentureBadge name={c.venture?.name} accent={c.venture?.accent} muted />
                    </td>
                  )}
                  <td className="text-xs text-ink-mute">
                    {c.startDate ? formatDate(c.startDate) : "—"}
                    {c.endDate ? ` → ${formatDate(c.endDate)}` : ""}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="text-right tabular-nums">{c.value != null ? formatCurrency(c.value) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
