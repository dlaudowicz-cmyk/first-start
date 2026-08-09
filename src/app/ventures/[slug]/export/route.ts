import JSZip from "jszip";
import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildVentureExport, exportCsvFiles } from "@/lib/venture-export";
import { buildExportReadme } from "@/lib/venture-export-readme";
import { buildZugferdInvoice } from "@/lib/zugferd";
import { DocumentPdf } from "@/lib/pdf/document";
import { VentureDossierPdf } from "@/lib/pdf/venture-dossier";
import { loadLogoDataUri } from "@/lib/pdf/logo";
import { ProjectReportPdf } from "@/lib/pdf/project-report";
import { buildProjectReport } from "@/lib/project-report";
import { categoryLabel } from "@/lib/project-files";
import { readProjectFile } from "@/lib/project-files-storage";

export const dynamic = "force-dynamic";

/** Keep filenames safe across operating systems. */
function safeName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_");
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await buildVentureExport(slug);
  if (!data) notFound();

  const generatedAt = new Date();
  const stamp = generatedAt.toISOString().slice(0, 10);
  const zip = new JSZip();

  zip.file("README.md", buildExportReadme(data, generatedAt));

  // ── Machine-readable records ───────────────────────────────────────────────
  const dataFolder = zip.folder("data")!;
  const json = (value: unknown) => JSON.stringify(value, null, 2);
  dataFolder.file("venture.json", json({ venture: data.venture, summary: data.summary, holding: data.holding }));
  dataFolder.file("clients.json", json(data.clients));
  dataFolder.file("people.json", json(data.people));
  dataFolder.file("projects.json", json(data.projects));
  dataFolder.file("offers.json", json(data.offers));
  dataFolder.file("invoices.json", json(data.invoices));
  dataFolder.file("expenses.json", json(data.expenses));
  dataFolder.file("contracts.json", json(data.contracts));
  dataFolder.file("credentials.json", json(data.credentials));
  dataFolder.file("tools.json", json(data.tools));
  dataFolder.file("tasks.json", json(data.tasks));
  // Stored filenames are internal; the archive exposes the original names only.
  dataFolder.file(
    "files.json",
    json(data.files.map(({ storedName: _storedName, ...rest }) => rest)),
  );

  for (const [name, content] of Object.entries(exportCsvFiles(data))) {
    if (content) dataFolder.file(name, content);
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const logo = await loadLogoDataUri(settings.logoPath);

  const documents = zip.folder("documents")!;
  documents.file(
    `${safeName(slug)}-dossier-${stamp}.pdf`,
    await renderToBuffer(VentureDossierPdf({ data, generatedAt, logo })),
  );

  if (data.offers.length > 0) {
    const offerRecords = await prisma.offer.findMany({
      where: { venture: { slug } },
      include: { items: true, client: true, project: true },
    });
    const offersFolder = documents.folder("offers")!;
    for (const offer of offerRecords) {
      const pdf = await renderToBuffer(
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
          logo,
        }),
      );
      offersFolder.file(`${safeName(offer.number)}.pdf`, pdf);
    }
  }

  if (data.invoices.length > 0) {
    const invoiceRecords = await prisma.invoice.findMany({
      where: { venture: { slug } },
      include: { items: true, client: true, project: true },
    });
    const invoicesFolder = documents.folder("invoices")!;
    const zugferdFolder = zip.folder("zugferd")!;
    for (const invoice of invoiceRecords) {
      const pdf = await renderToBuffer(
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
          logo,
        }),
      );
      invoicesFolder.file(`${safeName(invoice.number)}.pdf`, pdf);
      zugferdFolder.file(
        `${safeName(invoice.number)}.zugferd.json`,
        json(buildZugferdInvoice({ invoice, settings })),
      );
    }
  }

  // ── Project documents: status report plus the filed bytes ─────────────────
  if (data.projects.length > 0) {
    const projectsFolder = documents.folder("projects")!;
    for (const project of data.projects) {
      const folderName = safeName(project.title);
      const projectFolder = projectsFolder.folder(folderName)!;

      const report = await buildProjectReport(project.id);
      if (report) {
        projectFolder.file(
          `${folderName}-status-${stamp}.pdf`,
          await renderToBuffer(ProjectReportPdf({ data: report, generatedAt, logo })),
        );
      }

      for (const file of data.files.filter((f) => f.projectId === project.id)) {
        const bytes = await readProjectFile(file.projectId, file.storedName);
        // A metadata row whose bytes went missing must not abort the export.
        if (!bytes) continue;
        projectFolder.folder(safeName(categoryLabel(file.category)))!.file(safeName(file.originalName), bytes);
      }
    }
  }

  const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new Response(new Uint8Array(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName(slug)}-export-${stamp}.zip"`,
      "Content-Length": String(archive.byteLength),
    },
  });
}
