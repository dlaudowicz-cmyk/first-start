import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { OfferForm } from "../offer-form";

export default async function NewOfferPage({
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
        <PageHeader title="Neues Angebot" />
        <EmptyState
          title="Zuerst einen Kunden anlegen"
          description="Angebote richten sich an einen Kunden."
          action={
            <Link href="/clients/new" className="btn-primary">
              Kunde anlegen
            </Link>
          }
        />
      </>
    );
  }

  const preselectedProject = sp.projectId ? projects.find((p) => p.id === sp.projectId) : undefined;

  return (
    <>
      <PageHeader title="Neues Angebot" description="Angebot in Markenoptik — beim Speichern entsteht das PDF." />
      <OfferForm
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
