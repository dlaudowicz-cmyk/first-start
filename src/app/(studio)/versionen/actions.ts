"use server";

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { versions, curriculumModules, workshopDays } from "@/db/schema";

export async function createVersion(projectId: string, formData: FormData) {
  const label = String(formData.get("label") ?? "");
  const status = String(formData.get("status") ?? "entwurf");

  const [{ maxVersion } = { maxVersion: 0 }] = await db
    .select({ maxVersion: sql<number>`coalesce(max(${versions.versionNumber}), 0)` })
    .from(versions)
    .where(eq(versions.projectId, projectId));

  const [modules, days] = await Promise.all([
    db.select().from(curriculumModules).where(eq(curriculumModules.projectId, projectId)),
    db.select().from(workshopDays).where(eq(workshopDays.projectId, projectId)),
  ]);

  await db.insert(versions).values({
    id: randomUUID(),
    projectId,
    versionNumber: maxVersion + 1,
    label: label || `Version ${maxVersion + 1}`,
    status: status as (typeof versions.$inferInsert)["status"],
    snapshot: JSON.stringify({ modules, workshopDays: days }),
    changeLog: String(formData.get("changeLog") ?? ""),
  });

  revalidatePath("/versionen");
}

export async function setVersionStatus(versionId: string, status: string) {
  await db
    .update(versions)
    .set({ status: status as (typeof versions.$inferInsert)["status"] })
    .where(eq(versions.id, versionId));
  revalidatePath("/versionen");
}
