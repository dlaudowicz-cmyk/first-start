import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { getActiveVenture } from "@/lib/venture-context";
import { ContractForm } from "../contract-form";

export const dynamic = "force-dynamic";

export default async function NewContractPage() {
  const [ventures, clients, people, active] = await Promise.all([
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getActiveVenture(),
  ]);

  return (
    <>
      <PageHeader title="Vertrag hinzufügen" description="Konditionen, Termine und Kündigungsfristen festhalten, damit keine Verlängerung überrascht." />
      <ContractForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        clients={clients.map((c) => ({ id: c.id, label: c.companyName }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        initial={active ? { ventureId: active.id } : undefined}
      />
    </>
  );
}
