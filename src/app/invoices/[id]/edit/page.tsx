import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { InvoiceForm } from "../../invoice-form";

function dateInputValue(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, clients, projects, settings] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, clientId: true },
    }),
    prisma.companySettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);
  if (!invoice) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${invoice.number}`} />
      <InvoiceForm
        clients={clients}
        projects={projects}
        defaultVatRate={settings.defaultVatRate}
        initial={{
          id: invoice.id,
          clientId: invoice.clientId,
          projectId: invoice.projectId ?? "",
          date: dateInputValue(invoice.date),
          dueDate: dateInputValue(invoice.dueDate),
          paymentTerms: invoice.paymentTerms ?? "",
          notes: invoice.notes ?? "",
          vatRate: invoice.vatRate,
          status: invoice.status as never,
          items: [...invoice.items]
            .sort((a, b) => a.position - b.position)
            .map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              unit: i.unit ?? "Stk.",
            })),
        }}
      />
    </>
  );
}
