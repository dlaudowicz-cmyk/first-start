"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { taskSchema, type TaskInput } from "@/lib/schemas";
import { nullify, toDate } from "@/lib/form";

function toData(input: TaskInput) {
  return {
    title: input.title.trim(),
    detail: nullify(input.detail),
    status: input.status,
    priority: input.priority,
    dueDate: toDate(input.dueDate),
    source: nullify(input.source),
    assigneeId: nullify(input.assigneeId),
    assigneeLabel: nullify(input.assigneeLabel),
    ventureId: nullify(input.ventureId),
    projectId: nullify(input.projectId),
    completedAt: input.status === "done" ? new Date() : null,
  };
}

export async function createTask(input: TaskInput) {
  const parsed = taskSchema.parse(input);
  const created = await prisma.task.create({ data: toData(parsed) });
  revalidatePath("/tasks");
  redirect(`/tasks/${created.id}`);
}

export async function updateTask(id: string, input: TaskInput) {
  const parsed = taskSchema.parse(input);
  const existing = await prisma.task.findUnique({ where: { id }, select: { completedAt: true } });
  const data = toData(parsed);
  // Preserve the original completion timestamp when a task stays done.
  if (parsed.status === "done" && existing?.completedAt) data.completedAt = existing.completedAt;
  await prisma.task.update({ where: { id }, data });
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  redirect(`/tasks/${id}`);
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  redirect("/tasks");
}

/** Inline status change straight from the task list. */
export async function setTaskStatus(id: string, status: string) {
  await prisma.task.update({
    where: { id },
    data: { status, completedAt: status === "done" ? new Date() : null },
  });
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/");
}
