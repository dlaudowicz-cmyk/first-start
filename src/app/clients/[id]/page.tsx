import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { VentureLinks } from "./venture-links";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, ventures] = await Promise.all([
    prisma.client.findUnique({
      where: { id },
      include: {
        ventures: true,
        projects: { orderBy: { updatedAt: "desc" }, include: { venture: true } },
        invoices: { orderBy: { date: "desc" } },
        offers: { orderBy: { date: "desc" } },
      },
    }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, accent: true } }),
  ]);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={client.companyName}
        description={client.contactPerson || undefined}
        actions={
          <>
            <Link href={`/clients/${client.id}/edit`} className="btn-secondary">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <Link href="/projects/new" className="btn-primary">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-1">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Details</h2>
          <dl className="text-sm space-y-2">
            <Row label="Email" value={client.email} />
            <Row label="Phone" value={client.phone} />
            <Row label="VAT ID" value={client.vatId} />
            <Row label="Address" value={client.address} multiline />
            {client.notes && <Row label="Notes" value={client.notes} multiline />}
          </dl>
        </section>

        <section className="card p-5 lg:col-span-1">
          <VentureLinks
            clientId={client.id}
            ventures={ventures}
            linkedIds={client.ventures.map((cv) => cv.ventureId)}
          />
        </section>

        <section className="card p-5 lg:col-span-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Projects</h2>
          {client.projects.length === 0 ? (
            <p className="text-sm text-ink-mute">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {client.projects.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/projects/${p.id}`} className="font-medium hover:underline truncate block">
                      {p.title}
                    </Link>
                    <div className="text-xs text-ink-mute">
                      {p.type}
                      {p.shootStart && ` · ${formatDate(p.shootStart)}`}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Row({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-ink-mute col-span-1">{label}</dt>
      <dd className={`col-span-2 ${multiline ? "whitespace-pre-line" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
