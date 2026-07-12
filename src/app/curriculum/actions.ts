"use server";

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { curriculumModules } from "@/db/schema";

const TEXT_FIELDS = [
  "title",
  "summary",
  "learningGoal",
  "qualificationContent",
  "applicationCompetence",
  "practicalTask",
  "learningResult",
  "assessment",
  "teachingMethods",
  "tools",
  "notes",
] as const;

export async function updateModule(moduleId: string, formData: FormData) {
  const update: Record<string, unknown> = {};

  for (const field of TEXT_FIELDS) {
    const value = formData.get(field);
    if (value !== null) update[field] = String(value);
  }

  const hoursTotal = formData.get("hoursTotal");
  const hoursTheory = formData.get("hoursTheory");
  const hoursPractice = formData.get("hoursPractice");
  if (hoursTotal !== null) update.hoursTotal = Number(hoursTotal);
  if (hoursTheory !== null) update.hoursTheory = Number(hoursTheory);
  if (hoursPractice !== null) update.hoursPractice = Number(hoursPractice);

  const status = formData.get("status");
  if (status !== null) update.status = String(status);

  update.updatedAt = new Date().toISOString();

  await db.update(curriculumModules).set(update).where(eq(curriculumModules.id, moduleId));

  revalidatePath("/curriculum");
  revalidatePath(`/curriculum/${moduleId}`);
  revalidatePath("/dashboard");
}

export async function createModule(projectId: string) {
  const [{ maxOrder, maxNumber } = { maxOrder: -1, maxNumber: 0 }] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${curriculumModules.orderIndex}), -1)`,
      maxNumber: sql<number>`coalesce(max(${curriculumModules.number}), 0)`,
    })
    .from(curriculumModules)
    .where(eq(curriculumModules.projectId, projectId));

  const id = randomUUID();
  await db.insert(curriculumModules).values({
    id,
    projectId,
    number: maxNumber + 1,
    title: "Neuer Lernbereich",
    orderIndex: maxOrder + 1,
    hoursTotal: 0,
    hoursTheory: 0,
    hoursPractice: 0,
    status: "entwurf",
  });

  revalidatePath("/curriculum");
  revalidatePath("/dashboard");
  redirect(`/curriculum/${id}`);
}

export async function deleteModule(moduleId: string, projectId: string) {
  await db.delete(curriculumModules).where(eq(curriculumModules.id, moduleId));
  revalidatePath("/curriculum");
  revalidatePath("/dashboard");
  redirect("/curriculum");
}

export async function moveModule(
  projectId: string,
  moduleId: string,
  direction: "up" | "down",
) {
  const modules = await db
    .select()
    .from(curriculumModules)
    .where(eq(curriculumModules.projectId, projectId))
    .orderBy(curriculumModules.orderIndex);

  const index = modules.findIndex((m) => m.id === moduleId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= modules.length) return;

  const a = modules[index];
  const b = modules[swapWith];

  await db.update(curriculumModules).set({ orderIndex: b.orderIndex }).where(eq(curriculumModules.id, a.id));
  await db.update(curriculumModules).set({ orderIndex: a.orderIndex }).where(eq(curriculumModules.id, b.id));

  revalidatePath("/curriculum");
}
