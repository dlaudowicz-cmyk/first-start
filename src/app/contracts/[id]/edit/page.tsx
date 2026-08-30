import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { dateInput } from "@/lib/form";
import { ContractForm } from "../../contract-form";

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contract, ventures, clients, people] = await Promise.all([
    prisma.contract.findUnique({ where: { id } }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!contract) notFound();

  return (
    <>
      <PageHeader title={`Bearbeiten · ${contract.title}`} />
      <ContractForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        clients={clients.map((c) => ({ id: c.id, label: c.companyName }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        initial={{
          id: contract.id,
          title: contract.title,
          type: contract.type as never,
          status: contract.status as never,
          counterparty: contract.counterparty,
          signedAt: dateInput(contract.signedAt),
          startDate: dateInput(contract.startDate),
          endDate: dateInput(contract.endDate),
          noticePeriodDays: contract.noticePeriodDays ?? undefined,
          value: contract.value ?? undefined,
          notes: contract.notes ?? "",
          ventureId: contract.ventureId ?? "",
          clientId: contract.clientId ?? "",
          personId: contract.personId ?? "",
        }}
      />
    </>
  );
}
