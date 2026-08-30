import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { InvoiceForm } from "../invoice-form";
import { formatInvoiceNumber } from "@/lib/invoice-numbering";
import type { InvoiceInput } from "@/lib/schemas";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; fromOffer?: string }>;
}) {
  const sp = await searchParams;
  const [clients, projects, settings] = await Promise.all([
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, clientId: true },
    }),
    prisma.companySettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);

  if (clients.length === 0) {
    return (
      <>
        <PageHeader title="Neue Rechnung" />
        <EmptyState
          title="Zuerst einen Kunden anlegen"
          description="Rechnungen richten sich an einen Kunden."
          action={
            <Link href="/clients/new" className="btn-primary">
              Kunde anlegen
            </Link>
          }
        />
      </>
    );
  }

  const offer = sp.fromOffer
    ? await prisma.offer.findUnique({ where: { id: sp.fromOffer }, include: { items: true } })
    : null;

  const preselectedProject = sp.projectId ? projects.find((p) => p.id === sp.projectId) : undefined;
  const nextNumber = formatInvoiceNumber(settings.invoicePrefix, settings.nextInvoiceNo);

  /**
   * An offer carries over as a draft: same client, project, VAT rate and positions.
   * Dates and the invoice number are set fresh, and nothing is written until you save.
   */
  let initial: (Partial<InvoiceInput> & { id?: string }) | undefined;
  if (offer) {
    initial = {
      clientId: offer.clientId,
      projectId: offer.projectId ?? "",
      vatRate: offer.vatRate,
      paymentTerms: offer.paymentTerms ?? undefined,
      notes: offer.notes ?? "",
      items: [...offer.items]
        .sort((a, b) => a.position - b.position)
        .map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          unit: i.unit ?? "Stk.",
        })),
    };
  } else if (preselectedProject) {
    initial = { projectId: preselectedProject.id, clientId: preselectedProject.clientId };
  }

  return (
    <>
      <PageHeader
        title="Neue Rechnung"
        description={
          offer
            ? `Übernommen aus Angebot ${offer.number}. Nummer beim Speichern: ${nextNumber}`
            : `Nummer beim Speichern: ${nextNumber}`
        }
      />
      <InvoiceForm
        clients={clients}
        projects={projects}
        defaultVatRate={settings.defaultVatRate}
        initial={initial}
      />
    </>
  );
}
