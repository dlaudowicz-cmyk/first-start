import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DocumentPdf } from "@/lib/pdf/document";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, client: true, project: true },
  });
  if (!invoice) notFound();
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const buffer = await renderToBuffer(
    DocumentPdf({
      kind: "Rechnung",
      number: invoice.number,
      date: invoice.date,
      secondaryDate: invoice.dueDate ? { label: "Fällig am", value: invoice.dueDate } : undefined,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes,
      vatRate: invoice.vatRate,
      client: invoice.client,
      settings,
      items: invoice.items,
      projectTitle: invoice.project?.title ?? null,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
