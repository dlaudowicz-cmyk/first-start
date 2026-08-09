import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Archive, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency, formatDate, monthlyCost } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VentureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venture = await prisma.venture.findUnique({
    where: { slug },
    include: {
      members: { include: { person: true }, orderBy: { role: "asc" } },
      clients: { include: { client: { include: { _count: { select: { ventures: true } } } } } },
      projects: { include: { client: true }, orderBy: { updatedAt: "desc" } },
      invoices: { include: { items: true }, orderBy: { date: "desc" } },
      offers: { include: { items: true }, orderBy: { date: "desc" } },
      contracts: { orderBy: { endDate: "asc" } },
      tools: true,
      credentials: true,
      tasks: { where: { status: { not: "done" } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!venture) notFound();

  const paid = venture.invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, inv) => sum + calculateTotals(inv.items, inv.vatRate).gross, 0);
  const open = venture.invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, inv) => sum + calculateTotals(inv.items, inv.vatRate).gross, 0);
  const pipeline = venture.offers
    .filter((o) => o.status === "sent" || o.status === "draft")
    .reduce((sum, o) => sum + calculateTotals(o.items, o.vatRate).gross, 0);
  const toolCost = venture.tools.reduce((sum, t) => sum + monthlyCost(t.costPerMonth, t.billingCycle), 0);

  return (
    <>
      <PageHeader
        title={venture.name}
        description={venture.tagline ?? undefined}
        actions={
          <>
            <a href={`/ventures/${venture.slug}/dossier`} target="_blank" rel="noreferrer" className="btn-secondary">
              <FileText className="h-4 w-4" /> Dossier PDF
            </a>
            <a href={`/ventures/${venture.slug}/export`} className="btn-secondary">
              <Archive className="h-4 w-4" /> Export ZIP
            </a>
            <Link href={`/ventures/${venture.slug}/edit`} className="btn-primary">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Revenue paid" value={formatCurrency(paid)} hint={`${venture.invoices.length} invoices`} />
        <Stat label="Open invoices" value={formatCurrency(open)} />
        <Stat label="Offer pipeline" value={formatCurrency(pipeline)} hint={`${venture.offers.length} offers`} />
        <Stat label="Tool cost / month" value={formatCurrency(toolCost)} hint={`${venture.tools.length} subscriptions`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500">Profile</h2>
            <StatusBadge status={venture.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Kind" value={venture.kind} />
            <Row label="Slug" value={venture.slug} />
            <Row label="Founded" value={venture.foundedAt ? formatDate(venture.foundedAt) : null} />
            {venture.description && <Row label="About" value={venture.description} multiline />}
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500 mb-3">Team</h2>
          {venture.members.length === 0 ? (
            <p className="text-sm text-graphite-500">
              No one assigned.{" "}
              <Link href="/people" className="underline hover:no-underline">
                Assign people
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {venture.members.map((m) => (
                <li key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/people/${m.person.id}`} className="font-medium hover:underline truncate block">
                      {m.person.name}
                    </Link>
                    <div className="text-xs text-graphite-500 truncate">{m.role}</div>
                  </div>
                  {m.allocation != null && (
                    <span className="text-xs text-graphite-500 tabular-nums shrink-0">{m.allocation}%</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500 mb-3">Clients</h2>
          {venture.clients.length === 0 ? (
            <p className="text-sm text-graphite-500">No clients linked.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {venture.clients.map((cv) => (
                <li key={cv.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link href={`/clients/${cv.client.id}`} className="font-medium hover:underline truncate">
                    {cv.client.companyName}
                  </Link>
                  {cv.client._count.ventures > 1 && (
                    <span className="badge-info shrink-0 text-[10px]">shared</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500 mb-3">Projects</h2>
          {venture.projects.length === 0 ? (
            <p className="text-sm text-graphite-500">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {venture.projects.map((p) => (
                <li key={p.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/projects/${p.id}`} className="font-medium hover:underline truncate block">
                      {p.title}
                    </Link>
                    <div className="text-xs text-graphite-500 truncate">
                      {p.client.companyName}
                      {p.shootStart ? ` · ${formatDate(p.shootStart)}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500 mb-3">Open tasks</h2>
          {venture.tasks.length === 0 ? (
            <p className="text-sm text-graphite-500">Nothing open.</p>
          ) : (
            <ul className="divide-y divide-graphite-100">
              {venture.tasks.map((t) => (
                <li key={t.id} className="py-2.5">
                  <Link href={`/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                    {t.title}
                  </Link>
                  <div className="text-xs text-graphite-500">
                    {t.dueDate ? formatDate(t.dueDate) : "no due date"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 lg:col-span-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500 mb-3">Contracts</h2>
          {venture.contracts.length === 0 ? (
            <p className="text-sm text-graphite-500">No contracts recorded.</p>
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Counterparty</th>
                  <th>Runs until</th>
                  <th>Status</th>
                  <th className="text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {venture.contracts.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">
                      <Link href={`/contracts/${c.id}`} className="hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="capitalize text-graphite-700">{c.type}</td>
                    <td className="text-graphite-700">{c.counterparty}</td>
                    <td>{c.endDate ? formatDate(c.endDate) : "—"}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-right tabular-nums">{c.value != null ? formatCurrency(c.value) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-graphite-500">{label}</div>
      <div className="font-display text-2xl mt-2 text-graphite-900 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-graphite-500 mt-1">{hint}</div>}
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-graphite-500 col-span-1">{label}</dt>
      <dd className={`col-span-2 ${multiline ? "whitespace-pre-line" : "capitalize"}`}>{value || "—"}</dd>
    </div>
  );
}
