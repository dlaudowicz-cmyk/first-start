import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { VentureBadge } from "@/components/venture-badge";
import { getActiveVenture } from "@/lib/venture-context";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const active = await getActiveVenture();
  const people = await prisma.person.findMany({
    where: active ? { memberships: { some: { ventureId: active.id } } } : {},
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: { memberships: { include: { venture: true } } },
  });

  return (
    <>
      <PageHeader
        title="Personen"
        description={
          active
            ? `Team assigned to ${active.name}.`
            : "Gründer, Angestellte, Freelancer, Partner und Berater über alle Ventures."
        }
        actions={
          <Link href="/people/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Person hinzufügen
          </Link>
        }
      />

      {people.length === 0 ? (
        <EmptyState
          title={active ? `No one assigned to ${active.name}` : "Noch keine Personen"}
          description={
            active
              ? "Assign someone from a person's detail page, or switch to Alle Ventures."
              : "Zuerst die Gründer, dann Freelancer und Partner."
          }
          action={
            <Link href="/people/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Person hinzufügen
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rolle</th>
                <th>Art</th>
                <th>Ventures</th>
                <th>Kontakt</th>
                <th className="text-right">Tagessatz</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">
                    <Link href={`/people/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="text-ink">{p.role || "—"}</td>
                  <td className="capitalize text-ink">{p.type}</td>
                  <td>
                    {p.memberships.length === 0 ? (
                      <span className="text-xs text-ink-faint">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {p.memberships.map((m) => (
                          <VentureBadge key={m.id} name={m.venture.name} accent={m.venture.accent} muted />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="text-ink-mute text-xs">{p.email || p.phone || "—"}</td>
                  <td className="text-right tabular-nums">{p.dayRate != null ? formatCurrency(p.dayRate) : "—"}</td>
                  <td>
                    <StatusBadge status={p.status} />
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
