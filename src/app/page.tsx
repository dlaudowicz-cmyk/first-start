import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { VentureBadge } from "@/components/venture-badge";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency, formatDate, daysUntil, monthlyCost } from "@/lib/utils";
import { clientVentureScope, getActiveVenture, ventureScope } from "@/lib/venture-context";
import { ArrowRight, FilePlus2, Users, ReceiptEuro, Clapperboard, ListChecks, FileSignature, Boxes } from "lucide-react";

export const dynamic = "force-dynamic";

/** Contracts inside this window surface on the dashboard. */
const CONTRACT_WARNING_DAYS = 90;

async function getDashboardData() {
  const active = await getActiveVenture();
  const scope = ventureScope(active);

  const [activeProjects, allInvoices, recentClients, upcomingProjects, openTasks, contracts, tools, ventures] =
    await Promise.all([
      prisma.project.findMany({
        where: { ...scope, status: { in: ["confirmed", "in production", "offer sent"] } },
        include: { client: true, venture: true },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.invoice.findMany({ where: scope, include: { items: true, client: true }, orderBy: { date: "desc" } }),
      prisma.client.findMany({ where: clientVentureScope(active), orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.project.findMany({
        where: { ...scope, shootStart: { gte: new Date() } },
        include: { client: true },
        orderBy: { shootStart: "asc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: { ...scope, status: { not: "done" } },
        include: { assignee: true, venture: true },
        orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
        take: 6,
      }),
      prisma.contract.findMany({
        where: { ...scope, status: { notIn: ["terminated", "expired"] }, endDate: { not: null } },
        orderBy: { endDate: "asc" },
      }),
      prisma.toolSubscription.findMany({ where: { ...scope, status: "active" } }),
      active ? Promise.resolve([]) : prisma.venture.findMany({ where: { status: { not: "archived" } } }),
    ]);

  const grossOf = (inv: { items: { description: string; quantity: number; unitPrice: number }[]; vatRate: number }) =>
    calculateTotals(inv.items, inv.vatRate).gross;

  const unpaidInvoices = allInvoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + grossOf(inv), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = allInvoices
    .filter((i) => i.status === "paid" && i.paidAt && i.paidAt >= monthStart)
    .reduce((sum, inv) => sum + grossOf(inv), 0);

  const expiringContracts = contracts.filter((c) => {
    const d = daysUntil(c.endDate);
    return d != null && d <= CONTRACT_WARNING_DAYS;
  });

  const toolMonthly = tools.reduce((sum, t) => sum + monthlyCost(t.costPerMonth, t.billingCycle), 0);

  return {
    active,
    ventures,
    activeProjects,
    unpaidInvoices,
    unpaidTotal,
    recentClients,
    upcomingProjects,
    monthlyRevenue,
    openTasks,
    expiringContracts,
    toolMonthly,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title={data.active ? data.active.name : "Company OS"}
        description={
          data.active
            ? "Scoped view — projects, invoices and tasks for this venture."
            : "Everything under the Pushlabs roof — ventures, production, money, obligations."
        }
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
        <StatCard
          label="Open tasks"
          value={String(data.openTasks.length)}
          hint={`tool run rate ${formatCurrency(data.toolMonthly)}/mo`}
        />
      </div>

      {!data.active && data.ventures.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Ventures" href="/ventures" icon={Boxes} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.ventures.map((v) => (
              <Link key={v.id} href={`/ventures/${v.slug}`} className="card p-4 hover:shadow-soft transition-shadow">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: v.accent ?? "#caff3d" }}
                  />
                  <span className="font-medium truncate">{v.name}</span>
                </div>
                <div className="mt-1 text-xs text-graphite-500 capitalize">
                  {v.kind} · {v.status}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
                    <div className="text-xs text-graphite-500 truncate flex flex-wrap items-center gap-x-2">
                      <span>
                        {p.client.companyName} · {p.type}
                        {p.shootStart && ` · ${formatDate(p.shootStart)}`}
                      </span>
                      {!data.active && p.venture && (
                        <VentureBadge name={p.venture.name} accent={p.venture.accent} muted />
                      )}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <SectionHeader title="Open tasks" href="/tasks" icon={ListChecks} />
          {data.openTasks.length === 0 ? (
            <p className="text-sm text-graphite-500 mt-2">Nothing open.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {data.openTasks.map((t) => {
                const overdue = (() => {
                  const d = daysUntil(t.dueDate);
                  return d != null && d < 0;
                })();
                return (
                  <li key={t.id} className="py-3">
                    <Link href={`/tasks/${t.id}`} className="text-sm font-medium hover:underline block truncate">
                      {t.title}
                    </Link>
                    <div className="text-xs text-graphite-500 truncate">
                      {t.assignee?.name ?? t.assigneeLabel ?? "unassigned"}
                      {t.dueDate && (
                        <span className={overdue ? " text-red-600 font-medium" : undefined}>
                          {" "}
                          · due {formatDate(t.dueDate)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
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
                const totals = calculateTotals(inv.items, inv.vatRate);
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
          <SectionHeader title="Contracts needing attention" href="/contracts" icon={FileSignature} />
          {data.expiringContracts.length === 0 ? (
            <p className="text-sm text-graphite-500 mt-2">
              Nothing ending within {CONTRACT_WARNING_DAYS} days.
            </p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {data.expiringContracts.map((c) => {
                const d = daysUntil(c.endDate)!;
                return (
                  <li key={c.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/contracts/${c.id}`} className="font-medium hover:underline truncate block">
                        {c.title}
                      </Link>
                      <div className="text-xs text-graphite-500 truncate">
                        {c.counterparty}
                        {c.noticePeriodDays ? ` · ${c.noticePeriodDays} days notice` : ""}
                      </div>
                    </div>
                    <span className={`text-xs shrink-0 ${d < 0 ? "text-red-600 font-medium" : "text-graphite-700"}`}>
                      {d < 0 ? `${Math.abs(d)} days overdue` : `in ${d} days`}
                    </span>
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
