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
        title="People"
        description={
          active
            ? `Team assigned to ${active.name}.`
            : "Founders, employees, freelancers, partners and advisors across all ventures."
        }
        actions={
          <Link href="/people/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Add person
          </Link>
        }
      />

      {people.length === 0 ? (
        <EmptyState
          title={active ? `No one assigned to ${active.name}` : "No people yet"}
          description={
            active
              ? "Assign someone from a person's detail page, or switch to All ventures."
              : "Add the founders first, then freelancers and partners."
          }
          action={
            <Link href="/people/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Add person
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Type</th>
                <th>Ventures</th>
                <th>Contact</th>
                <th className="text-right">Day rate</th>
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
                  <td className="text-graphite-700">{p.role || "—"}</td>
                  <td className="capitalize text-graphite-700">{p.type}</td>
                  <td>
                    {p.memberships.length === 0 ? (
                      <span className="text-xs text-graphite-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {p.memberships.map((m) => (
                          <VentureBadge key={m.id} name={m.venture.name} accent={m.venture.accent} muted />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="text-graphite-500 text-xs">{p.email || p.phone || "—"}</td>
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
