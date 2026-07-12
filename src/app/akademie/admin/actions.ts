"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courses } from "@/db/schema";

export async function createCourseFromModule(
  programId: string,
  moduleId: string,
  title: string,
  summary: string | null,
  hours: number,
) {
  await db.insert(courses).values({
    id: randomUUID(),
    programId,
    curriculumModuleId: moduleId,
    title,
    description: summary ?? undefined,
    estimatedHours: hours,
    status: "entwurf",
  });

  revalidatePath("/akademie/admin");
  revalidatePath("/akademie/programme");
}
