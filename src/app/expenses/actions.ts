"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { expenseSchema, type ExpenseInput } from "@/lib/schemas";
import { calculateSpesen } from "@/lib/spesen";
import { getActiveVenture } from "@/lib/venture-context";

/**
 * A document belongs to the venture of its project; when no project is linked
 * we fall back to the venture the user is currently scoped to.
 */
async function resolveVentureId(projectId: string | null | undefined): Promise<string | null> {
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ventureId: true },
    });
    if (project?.ventureId) return project.ventureId;
  }
  const active = await getActiveVenture();
  return active?.id ?? null;
}


export async function saveExpense(data: ExpenseInput) {
  const parsed = expenseSchema.parse(data);
  const breakdown = calculateSpesen({
    startTime: parsed.startTime || null,
    endTime: parsed.endTime || null,
    overnight: parsed.overnight,
    breakfast: parsed.breakfast,
    lunch: parsed.lunch,
    dinner: parsed.dinner,
    people: parsed.people,
  });

  const ventureId = await resolveVentureId(parsed.projectId);
  await prisma.expense.create({
    data: {
      ventureId,
      travelDate: new Date(parsed.travelDate),
      startTime: parsed.startTime || null,
      endTime: parsed.endTime || null,
      overnight: parsed.overnight,
      breakfast: parsed.breakfast,
      lunch: parsed.lunch,
      dinner: parsed.dinner,
      people: parsed.people,
      allowance: breakdown.total,
      notes: parsed.notes || null,
      projectId: parsed.projectId || null,
    },
  });

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
}
