import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { dateInput } from "@/lib/form";
import { ToolForm } from "../../tool-form";

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tool, ventures, people] = await Promise.all([
    prisma.toolSubscription.findUnique({ where: { id } }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!tool) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${tool.name}`} />
      <ToolForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        initial={{
          id: tool.id,
          name: tool.name,
          category: tool.category as never,
          status: tool.status as never,
          billingCycle: tool.billingCycle as never,
          plan: tool.plan ?? "",
          seats: tool.seats ?? undefined,
          costPerMonth: tool.costPerMonth ?? undefined,
          renewalDate: dateInput(tool.renewalDate),
          url: tool.url ?? "",
          notes: tool.notes ?? "",
          ownerId: tool.ownerId ?? "",
          ventureId: tool.ventureId ?? "",
        }}
      />
    </>
  );
}
