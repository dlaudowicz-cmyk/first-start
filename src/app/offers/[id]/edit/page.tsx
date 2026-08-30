import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { OfferForm } from "../../offer-form";

function dateInputValue(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [offer, clients, projects, settings] = await Promise.all([
    prisma.offer.findUnique({ where: { id }, include: { items: true } }),
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, clientId: true },
    }),
    prisma.companySettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);
  if (!offer) notFound();

  return (
    <>
      <PageHeader title={`Bearbeiten · ${offer.number}`} />
      <OfferForm
        clients={clients}
        projects={projects}
        defaultVatRate={settings.defaultVatRate}
        initial={{
          id: offer.id,
          clientId: offer.clientId,
          projectId: offer.projectId ?? "",
          date: dateInputValue(offer.date),
          validUntil: dateInputValue(offer.validUntil),
          paymentTerms: offer.paymentTerms ?? "",
          notes: offer.notes ?? "",
          vatRate: offer.vatRate,
          status: offer.status as never,
          items: [...offer.items]
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
