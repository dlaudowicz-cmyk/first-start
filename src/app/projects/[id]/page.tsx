import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, FilePlus2, ReceiptEuro, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileVault } from "./file-vault";
import { PipelinePanel } from "./pipeline-panel";
import { getPipeline } from "@/lib/pipelines";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      offers: { include: { items: true }, orderBy: { date: "desc" } },
      invoices: { include: { items: true }, orderBy: { date: "desc" } },
      expenses: { orderBy: { travelDate: "desc" } },
      files: { orderBy: [{ category: "asc" }, { createdAt: "desc" }] },
    },
  });
  if (!project) notFound();

  const pipeline = getPipeline(project.pipelineKey);

  return (
    <>
      <PageHeader
        title={project.title}
        description={`${project.client.companyName} · ${project.type}`}
        actions={
          <>
            <a
              href={`/projects/${project.id}/report`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              <FileText className="h-4 w-4" /> Statusbericht
            </a>
            <Link href={`/projects/${project.id}/edit`} className="btn-secondary">
              <Pencil className="h-4 w-4" /> Bearbeiten
            </Link>
            <Link href={`/offers/new?projectId=${project.id}`} className="btn-secondary">
              <FilePlus2 className="h-4 w-4" /> Neues Angebot
            </Link>
            <Link href={`/invoices/new?projectId=${project.id}`} className="btn-primary">
              <ReceiptEuro className="h-4 w-4" /> Neue Rechnung
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Details</h2>
            <StatusBadge status={project.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Kunde" value={project.client.companyName} />
            <Row label="Art" value={project.type} />
            <Row label="Drehort" value={project.location} />
            <Row label="Drehbeginn" value={project.shootStart ? formatDate(project.shootStart) : null} />
            <Row label="Drehende" value={project.shootEnd ? formatDate(project.shootEnd) : null} />
            <Row label="Budget" value={project.budget != null ? formatCurrency(project.budget) : null} />
            <Row label="Pipeline" value={pipeline ? `${pipeline.name} ${pipeline.version}` : null} />
            {project.notes && <Row label="Notizen" value={project.notes} multiline />}
          </dl>
        </section>

        <div className="lg:col-span-2 space-y-6">
          <section className="card p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Angebote</h2>
            {project.offers.length === 0 ? (
              <p className="text-sm text-ink-mute">Noch keine Angebote.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {project.offers.map((o) => {
                  const t = calculateTotals(o.items, o.vatRate);
                  return (
                    <li key={o.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <Link href={`/offers/${o.id}`} className="font-medium hover:underline">
                          {o.number}
                        </Link>
                        <div className="text-xs text-ink-mute">{formatDate(o.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="tabular-nums text-sm">{formatCurrency(t.gross)}</div>
                        <StatusBadge status={o.status} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Rechnungen</h2>
            {project.invoices.length === 0 ? (
              <p className="text-sm text-ink-mute">Noch keine Rechnungen.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {project.invoices.map((inv) => {
                  const t = calculateTotals(inv.items, inv.vatRate);
                  return (
                    <li key={inv.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <Link href={`/invoices/${inv.id}`} className="font-medium hover:underline">
                          {inv.number}
                        </Link>
                        <div className="text-xs text-ink-mute">{formatDate(inv.date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="tabular-nums text-sm">{formatCurrency(t.gross)}</div>
                        <StatusBadge status={inv.status} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {pipeline && (
            <section className="card p-5">
              <PipelinePanel projectId={project.id} pipeline={pipeline} />
            </section>
          )}

          <section className="card p-5">
            <FileVault
              projectId={project.id}
              files={project.files.map((f) => ({
                id: f.id,
                category: f.category,
                originalName: f.originalName,
                size: f.size,
                notes: f.notes,
                createdAt: f.createdAt.toISOString(),
              }))}
            />
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Spesen</h2>
            {project.expenses.length === 0 ? (
              <p className="text-sm text-ink-mute">Keine Spesen erfasst.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {project.expenses.map((e) => (
                  <li key={e.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{formatDate(e.travelDate)}</div>
                      <div className="text-xs text-ink-mute">
                        {e.people} pax · {e.overnight ? "overnight" : "same day"}
                      </div>
                    </div>
                    <div className="tabular-nums">{formatCurrency(e.allowance)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
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
