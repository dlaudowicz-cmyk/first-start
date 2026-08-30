import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { getActiveVenture } from "@/lib/venture-context";
import { ToolForm } from "../tool-form";

export const dynamic = "force-dynamic";

export default async function NewToolPage() {
  const [ventures, people, active] = await Promise.all([
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getActiveVenture(),
  ]);

  return (
    <>
      <PageHeader title="Werkzeug hinzufügen" description="Abo mit Kosten und Zuständigkeit erfassen." />
      <ToolForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        initial={active ? { ventureId: active.id } : undefined}
      />
    </>
  );
}
