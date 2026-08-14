import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "../../project-form";

function dateInputValue(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, clients, ventures] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${project.title}`} />
      <ProjectForm
        clients={clients}
        ventures={ventures}
        initial={{
          id: project.id,
          title: project.title,
          clientId: project.clientId,
          type: project.type as never,
          status: project.status as never,
          shootStart: dateInputValue(project.shootStart),
          shootEnd: dateInputValue(project.shootEnd),
          location: project.location ?? "",
          budget: project.budget ?? undefined,
          notes: project.notes ?? "",
          ventureId: project.ventureId ?? "",
          pipelineKey: project.pipelineKey ?? "",
        }}
      />
    </>
  );
}
