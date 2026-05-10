"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { expenseSchema, type ExpenseInput } from "@/lib/schemas";
import { calculateSpesen } from "@/lib/spesen";

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

  await prisma.expense.create({
    data: {
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
