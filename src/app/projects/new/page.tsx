import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { getActiveVenture } from "@/lib/venture-context";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  const [clients, ventures, active] = await Promise.all([
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getActiveVenture(),
  ]);
  if (clients.length === 0) {
    return (
      <>
        <PageHeader title="Neues Projekt" />
        <EmptyState
          title="Zuerst einen Kunden anlegen"
          description="Ein Projekt gehört immer zu einem Kunden."
          action={
            <Link href="/clients/new" className="btn-primary">
              Kunde anlegen
            </Link>
          }
        />
      </>
    );
  }
  return (
    <>
      <PageHeader title="Neues Projekt" />
      <ProjectForm clients={clients} ventures={ventures} initial={active ? { ventureId: active.id } : undefined} />
    </>
  );
}
