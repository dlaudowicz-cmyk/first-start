import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildZugferdInvoice } from "@/lib/zugferd";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, client: true },
  });
  if (!invoice) notFound();
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const payload = buildZugferdInvoice({ invoice, settings });
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `inline; filename="${invoice.number}.zugferd.json"`,
    },
  });
}
