import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { buildProjectReport } from "@/lib/project-report";
import { ProjectReportPdf } from "@/lib/pdf/project-report";
import { loadLogoDataUri } from "@/lib/pdf/logo";

export const dynamic = "force-dynamic";

/** Keep filenames safe across operating systems. */
function safeName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await buildProjectReport(id);
  if (!data) notFound();

  const logo = await loadLogoDataUri(data.settings?.logoPath);
  const generatedAt = new Date();
  const buffer = await renderToBuffer(ProjectReportPdf({ data, generatedAt, logo }));

  const filename = `${safeName(data.project.title)}-status-${generatedAt.toISOString().slice(0, 10)}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
