import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight, FilePlus2, Users, ReceiptEuro, Clapperboard } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [activeProjects, allInvoices, recentClients, upcomingProjects] = await Promise.all([
    prisma.project.findMany({
      where: { status: { in: ["confirmed", "in production", "offer sent"] } },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.invoice.findMany({ include: { items: true, client: true }, orderBy: { date: "desc" } }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.project.findMany({
      where: { shootStart: { gte: new Date() } },
      include: { client: true },
      orderBy: { shootStart: "asc" },
      take: 5,
    }),
  ]);

  const unpaidInvoices = allInvoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");
  const unpaidTotal = unpaidInvoices.reduce(
    (sum, inv) =>
      sum + calculateTotals(inv.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })), inv.vatRate).gross,
    0,
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = allInvoices
    .filter((i) => i.status === "paid" && i.paidAt && i.paidAt >= monthStart)
    .reduce(
      (sum, inv) =>
        sum +
        calculateTotals(
          inv.items.map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice })),
          inv.vatRate,
        ).gross,
      0,
    );

  return {
    activeProjects,
    unpaidInvoices,
    unpaidTotal,
    recentClients,
    upcomingProjects,
    monthlyRevenue,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Production at a glance — projects, invoices, revenue, upcoming shoots."
        actions={
          <>
            <Link href="/offers/new" className="btn-secondary">
              <FilePlus2 className="h-4 w-4" /> New offer
            </Link>
            <Link href="/invoices/new" className="btn-primary">
              <ReceiptEuro className="h-4 w-4" /> New invoice
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active projects" value={String(data.activeProjects.length)} hint="confirmed + in production" />
        <StatCard
          label="Unpaid invoices"
          value={String(data.unpaidInvoices.length)}
          hint={formatCurrency(data.unpaidTotal)}
        />
        <StatCard label="Monthly revenue" value={formatCurrency(data.monthlyRevenue)} hint="paid this month" />
        <StatCard label="Upcoming shoots" value={String(data.upcomingProjects.length)} hint="next 5 scheduled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-2">
          <SectionHeader title="Active projects" href="/projects" icon={Clapperboard} />
          {data.activeProjects.length === 0 ? (
            <p className="text-sm text-graphite-500 mt-2">No active projects.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {data.activeProjects.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/projects/${p.id}`} className="font-medium hover:underline truncate block">
                      {p.title}
                    </Link>
                    <div className="text-xs text-graphite-500 truncate">
                      {p.client.companyName} · {p.type}
                      {p.shootStart && ` · ${formatDate(p.shootStart)}`}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <SectionHeader title="Recent clients" href="/clients" icon={Users} />
          {data.recentClients.length === 0 ? (
            <p className="text-sm text-graphite-500 mt-2">No clients yet.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {data.recentClients.map((c) => (
                <li key={c.id} className="py-3">
                  <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                    {c.companyName}
                  </Link>
                  <div className="text-xs text-graphite-500">{c.contactPerson || c.email || "—"}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 lg:col-span-2">
          <SectionHeader title="Upcoming shoots" href="/projects" icon={Clapperboard} />
          {data.upcomingProjects.length === 0 ? (
            <p className="text-sm text-graphite-500 mt-2">Nothing scheduled.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {data.upcomingProjects.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/projects/${p.id}`} className="font-medium hover:underline truncate block">
                      {p.title}
                    </Link>
                    <div className="text-xs text-graphite-500 truncate">
                      {p.client.companyName} · {p.location || "—"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-graphite-700">
                    <div>{formatDate(p.shootStart)}</div>
                    {p.shootEnd && <div className="text-graphite-400">→ {formatDate(p.shootEnd)}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <SectionHeader title="Unpaid invoices" href="/invoices" icon={ReceiptEuro} />
          {data.unpaidInvoices.length === 0 ? (
            <p className="text-sm text-graphite-500 mt-2">All clear.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {data.unpaidInvoices.slice(0, 5).map((inv) => {
                const totals = calculateTotals(
                  inv.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
                  inv.vatRate,
                );
                return (
                  <li key={inv.id} className="py-3">
                    <Link href={`/invoices/${inv.id}`} className="font-medium hover:underline">
                      {inv.number}
                    </Link>
                    <div className="text-xs text-graphite-500">
                      {inv.client.companyName} · {formatCurrency(totals.gross)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-graphite-500">{label}</div>
      <div className="font-display text-3xl mt-2 text-graphite-900">{value}</div>
      {hint && <div className="text-xs text-graphite-500 mt-1">{hint}</div>}
    </div>
  );
}

function SectionHeader({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-graphite-500" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500">{title}</h2>
      </div>
      <Link href={href} className="text-xs text-graphite-500 hover:text-graphite-900 inline-flex items-center gap-1">
        View all <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
