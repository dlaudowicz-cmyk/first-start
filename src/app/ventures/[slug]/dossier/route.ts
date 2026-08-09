import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { buildVentureExport } from "@/lib/venture-export";
import { VentureDossierPdf } from "@/lib/pdf/venture-dossier";
import { loadLogoDataUri } from "@/lib/pdf/logo";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await buildVentureExport(slug);
  if (!data) notFound();

  const settings = await prisma.companySettings.findUnique({ where: { id: "singleton" } });
  const logo = await loadLogoDataUri(settings?.logoPath);

  const generatedAt = new Date();
  const buffer = await renderToBuffer(VentureDossierPdf({ data, generatedAt, logo }));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}-dossier-${generatedAt.toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
