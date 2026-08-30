import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { dateInput } from "@/lib/form";
import { TaskForm } from "../task-form";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, ventures, people, projects] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.person.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
  ]);
  if (!task) notFound();

  return (
    <>
      <PageHeader
        title={task.title}
        description={task.source ? `From: ${task.source}` : undefined}
        actions={
          <Link href="/tasks" className="btn-secondary">
            Zurück zu den Aufgaben
          </Link>
        }
      />
      <TaskForm
        ventures={ventures.map((v) => ({ id: v.id, label: v.name }))}
        people={people.map((p) => ({ id: p.id, label: p.name }))}
        projects={projects.map((p) => ({ id: p.id, label: p.title }))}
        initial={{
          id: task.id,
          title: task.title,
          detail: task.detail ?? "",
          status: task.status as never,
          priority: task.priority as never,
          dueDate: dateInput(task.dueDate),
          source: task.source ?? "",
          assigneeId: task.assigneeId ?? "",
          assigneeLabel: task.assigneeLabel ?? "",
          ventureId: task.ventureId ?? "",
          projectId: task.projectId ?? "",
        }}
      />
    </>
  );
}
