"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workshopDays } from "@/db/schema";

const FIELDS = [
  "title",
  "goal",
  "theory",
  "liveDemo",
  "exercise",
  "groupTask",
  "output",
  "requiredTools",
  "requiredAccounts",
  "requiredHardware",
  "homework",
  "notes",
] as const;

export async function updateWorkshopDay(dayId: string, formData: FormData) {
  const update: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    if (value !== null) update[field] = String(value);
  }
  const hours = formData.get("hours");
  if (hours !== null) update.hours = Number(hours);

  await db.update(workshopDays).set(update).where(eq(workshopDays.id, dayId));
  revalidatePath("/workshop");
}
