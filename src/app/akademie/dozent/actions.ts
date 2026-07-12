"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { submissions, submissionFeedback, users } from "@/db/schema";

export async function submitFeedback(submissionId: string, formData: FormData) {
  const content = String(formData.get("content") ?? "");
  const status = String(formData.get("status") ?? "in_pruefung");
  const score = formData.get("score");

  const [reviewer] = await db.select().from(users).where(eq(users.role, "admin")).limit(1);

  await db.insert(submissionFeedback).values({
    id: randomUUID(),
    submissionId,
    reviewerId: reviewer?.id,
    content,
    score: score ? Number(score) : null,
  });

  await db
    .update(submissions)
    .set({ status: status as (typeof submissions.$inferInsert)["status"], score: score ? Number(score) : undefined })
    .where(eq(submissions.id, submissionId));

  revalidatePath("/akademie/dozent");
  revalidatePath("/akademie/aufgaben");
}
