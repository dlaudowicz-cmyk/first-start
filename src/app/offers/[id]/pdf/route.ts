import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DocumentPdf } from "@/lib/pdf/document";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { items: true, client: true, project: true },
  });
  if (!offer) notFound();
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const buffer = await renderToBuffer(
    DocumentPdf({
      kind: "Angebot",
      number: offer.number,
      date: offer.date,
      secondaryDate: offer.validUntil ? { label: "Gültig bis", value: offer.validUntil } : undefined,
      paymentTerms: offer.paymentTerms,
      notes: offer.notes,
      vatRate: offer.vatRate,
      client: offer.client,
      settings,
      items: offer.items,
      projectTitle: offer.project?.title ?? null,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${offer.number}.pdf"`,
    },
  });
}
