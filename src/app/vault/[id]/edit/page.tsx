import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { dateInput } from "@/lib/form";
import { CredentialForm } from "../../credential-form";

export default async function EditCredentialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [credential, ventures, people] = await Promise.all([
    prisma.credential.findUnique({ where: { id } }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!credential) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${credential.service}`} />
      <CredentialForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        initial={{
          id: credential.id,
          service: credential.service,
          category: credential.category as never,
          criticality: credential.criticality as never,
          url: credential.url ?? "",
          identifier: credential.identifier ?? "",
          storageLocation: credential.storageLocation,
          vaultRef: credential.vaultRef ?? "",
          mfaLocation: credential.mfaLocation ?? "",
          sharedWith: credential.sharedWith ?? "",
          rotatedAt: dateInput(credential.rotatedAt),
          rotateEveryDays: credential.rotateEveryDays ?? undefined,
          notes: credential.notes ?? "",
          ownerId: credential.ownerId ?? "",
          ventureId: credential.ventureId ?? "",
        }}
      />
    </>
  );
}
