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
              <FileText className="h-4 w-4" /> Dossier-PDF
            </a>
            <a href={`/ventures/${venture.slug}/export`} className="btn-secondary">
              <Archive className="h-4 w-4" /> Export (ZIP)
            </a>
            <Link href={`/ventures/${venture.slug}/edit`} className="btn-primary">
              <Pencil className="h-4 w-4" /> Bearbeiten
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Umsatz bezahlt" value={formatCurrency(paid)} hint={`${venture.invoices.length} Rechnungen`} />
        <Stat label="Open Rechnungen" value={formatCurrency(open)} />
        <Stat label="Angebots-Pipeline" value={formatCurrency(pipeline)} hint={`${venture.offers.length} offers`} />
        <Stat label="Werkzeugkosten / Monat" value={formatCurrency(toolCost)} hint={`${venture.tools.length} subscriptions`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Profil</h2>
            <StatusBadge status={venture.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Art" value={venture.kind} />
            <Row label="Kürzel" value={venture.slug} />
            <Row label="Gegründet" value={venture.foundedAt ? formatDate(venture.foundedAt) : null} />
            {venture.description && <Row label="About" value={venture.description} multiline />}
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Team</h2>
          {venture.members.length === 0 ? (
            <p className="text-sm text-ink-mute">
              Niemand zugeordnet.{" "}
              <Link href="/people" className="underline hover:no-underline">
                Assign people
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {venture.members.map((m) => (
                <li key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/people/${m.person.id}`} className="font-medium hover:underline truncate block">
                      {m.person.name}
                    </Link>
                    <div className="text-xs text-ink-mute truncate">{m.role}</div>
                  </div>
                  {m.allocation != null && (
                    <span className="text-xs text-ink-mute tabular-nums shrink-0">{m.allocation}%</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Kunden</h2>
          {venture.clients.length === 0 ? (
            <p className="text-sm text-ink-mute">Keine Kunden verknüpft.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
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
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Projekte</h2>
          {venture.projects.length === 0 ? (
            <p className="text-sm text-ink-mute">Noch keine Projekte.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {venture.projects.map((p) => (
                <li key={p.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/projects/${p.id}`} className="font-medium hover:underline truncate block">
                      {p.title}
                    </Link>
                    <div className="text-xs text-ink-mute truncate">
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
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Offene Aufgaben</h2>
          {venture.tasks.length === 0 ? (
            <p className="text-sm text-ink-mute">Nichts offen.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {venture.tasks.map((t) => (
                <li key={t.id} className="py-2.5">
                  <Link href={`/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                    {t.title}
                  </Link>
                  <div className="text-xs text-ink-mute">
                    {t.dueDate ? formatDate(t.dueDate) : "kein Termin"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 lg:col-span-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Verträge</h2>
          {venture.contracts.length === 0 ? (
            <p className="text-sm text-ink-mute">Keine Verträge erfasst.</p>
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Art</th>
                  <th>Vertragspartner</th>
                  <th>Runs until</th>
                  <th>Status</th>
                  <th className="text-right">Wert</th>
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
                    <td className="capitalize text-ink">{c.type}</td>
                    <td className="text-ink">{c.counterparty}</td>
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
      <div className="text-xs uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="font-display font-semibold text-2xl mt-2 text-ink tabular-nums">{value}</div>
      {hint && <div className="text-xs text-ink-mute mt-1">{hint}</div>}
    </div>
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
