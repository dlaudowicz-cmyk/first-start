"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { submissions } from "@/db/schema";

export async function createSubmission(assignmentId: string, enrollmentId: string, formData: FormData) {
  await db.insert(submissions).values({
    id: randomUUID(),
    assignmentId,
    enrollmentId,
    status: "eingereicht",
    content: String(formData.get("content") ?? ""),
    toolDocumentation: String(formData.get("toolDocumentation") ?? ""),
    reflection: String(formData.get("reflection") ?? ""),
  });

  revalidatePath("/akademie/aufgaben");
  revalidatePath("/akademie/dozent");
}
