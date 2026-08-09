import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VenturesPage() {
  const ventures = await prisma.venture.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      invoices: { include: { items: true } },
      _count: { select: { projects: true, members: true, clients: true, contracts: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Ventures"
        description="Every business line under the Pushlabs roof. Switch scope in the sidebar to work inside one venture."
        actions={
          <Link href="/ventures/new" className="btn-primary">
            <Plus className="h-4 w-4" /> New venture
          </Link>
        }
      />

      {ventures.length === 0 ? (
        <EmptyState
          title="No ventures yet"
          description="Create your first venture — e.g. Pushlabs Studio or Backsley."
          action={
            <Link href="/ventures/new" className="btn-primary">
              <Plus className="h-4 w-4" /> New venture
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ventures.map((v) => {
            const paidRevenue = v.invoices
              .filter((i) => i.status === "paid")
              .reduce((sum, inv) => sum + calculateTotals(inv.items, inv.vatRate).gross, 0);
            const openRevenue = v.invoices
              .filter((i) => i.status !== "paid" && i.status !== "cancelled")
              .reduce((sum, inv) => sum + calculateTotals(inv.items, inv.vatRate).gross, 0);

            return (
              <Link
                key={v.id}
                href={`/ventures/${v.slug}`}
                className="card p-5 hover:shadow-soft transition-shadow block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      aria-hidden
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: v.accent ?? "#caff3d" }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{v.name}</div>
                      <div className="text-xs text-graphite-500 capitalize">{v.kind}</div>
                    </div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>

                {v.tagline && <p className="mt-3 text-sm text-graphite-500 line-clamp-2">{v.tagline}</p>}

                <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
                  <Stat label="Projects" value={String(v._count.projects)} />
                  <Stat label="Clients" value={String(v._count.clients)} />
                  <Stat label="Team" value={String(v._count.members)} />
                  <Stat label="Contracts" value={String(v._count.contracts)} />
                </dl>

                <div className="mt-4 pt-3 border-t border-graphite-100 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-graphite-500">Paid</div>
                    <div className="text-sm font-medium tabular-nums">{formatCurrency(paidRevenue)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-graphite-500">Open</div>
                    <div className="text-sm font-medium tabular-nums">{formatCurrency(openRevenue)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="text-graphite-500">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
