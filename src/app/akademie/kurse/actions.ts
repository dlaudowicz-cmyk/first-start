"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { lessonProgress } from "@/db/schema";

export async function setLessonStatus(
  enrollmentId: string,
  lessonId: string,
  status: "offen" | "in_bearbeitung" | "abgeschlossen",
) {
  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.enrollmentId, enrollmentId), eq(lessonProgress.lessonId, lessonId)));

  if (existing) {
    await db
      .update(lessonProgress)
      .set({ status, completedAt: status === "abgeschlossen" ? new Date().toISOString() : null })
      .where(eq(lessonProgress.id, existing.id));
  }

  revalidatePath("/akademie", "layout");
}
