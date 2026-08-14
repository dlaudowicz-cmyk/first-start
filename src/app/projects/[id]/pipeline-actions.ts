"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getPipeline } from "@/lib/pipelines";
import { planQcTasks } from "@/lib/qc-tasks";

export type SeedResult = { created: number; skipped: number };

/**
 * Turns the pipeline's QC gates into tasks on the project. Re-running is safe:
 * `planQcTasks` skips gates that already have a task, so the button can be
 * pressed again after the pipeline gains a new gate.
 */
export async function seedQcTasks(projectId: string): Promise<SeedResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, pipelineKey: true, ventureId: true },
  });
  const pipeline = getPipeline(project?.pipelineKey);
  if (!project || !pipeline) return { created: 0, skipped: 0 };

  const existing = await prisma.task.findMany({
    where: { projectId },
    select: { title: true },
  });

  const { create, skipped } = planQcTasks(pipeline, existing.map((t) => t.title));

  if (create.length > 0) {
    await prisma.task.createMany({
      data: create.map((t) => ({
        ...t,
        status: "open",
        projectId,
        ventureId: project.ventureId,
      })),
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  return { created: create.length, skipped };
}
