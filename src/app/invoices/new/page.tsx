import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { InvoiceForm } from "../invoice-form";
import { formatInvoiceNumber } from "@/lib/invoice-numbering";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
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
        <PageHeader title="New invoice" />
        <EmptyState
          title="Add a client first"
          description="Invoices are addressed to a client."
          action={
            <Link href="/clients/new" className="btn-primary">
              Create a client
            </Link>
          }
        />
      </>
    );
  }

  const preselectedProject = sp.projectId ? projects.find((p) => p.id === sp.projectId) : undefined;
  const nextNumber = formatInvoiceNumber(settings.invoicePrefix, settings.nextInvoiceNo);

  return (
    <>
      <PageHeader
        title="New invoice"
        description={`Next number on save: ${nextNumber}`}
      />
      <InvoiceForm
        clients={clients}
        projects={projects}
        defaultVatRate={settings.defaultVatRate}
        initial={
          preselectedProject
            ? { projectId: preselectedProject.id, clientId: preselectedProject.clientId }
            : undefined
        }
      />
    </>
  );
}
