import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { getActiveVenture } from "@/lib/venture-context";
import { CredentialForm } from "../credential-form";

export const dynamic = "force-dynamic";

export default async function NewCredentialPage() {
  const [ventures, people, active] = await Promise.all([
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getActiveVenture(),
  ]);

  return (
    <>
      <PageHeader title="Add vault entry" description="Register an account, API or access — reference only." />
      <CredentialForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        initial={active ? { ventureId: active.id } : undefined}
      />
    </>
  );
}
