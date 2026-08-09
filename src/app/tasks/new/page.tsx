import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { getActiveVenture } from "@/lib/venture-context";
import { TaskForm } from "../task-form";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const [ventures, people, projects, active] = await Promise.all([
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
    getActiveVenture(),
  ]);

  return (
    <>
      <PageHeader title="Add task" description="An action item with an owner and, ideally, a due date." />
      <TaskForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        projects={projects.map((p) => ({ id: p.id, label: p.title }))}
        initial={active ? { ventureId: active.id } : undefined}
      />
    </>
  );
}
