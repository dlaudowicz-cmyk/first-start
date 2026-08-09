"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { toolSchema, type ToolInput } from "@/lib/schemas";
import { nullify, toDate } from "@/lib/form";

function toData(input: ToolInput) {
  return {
    name: input.name.trim(),
    category: input.category,
    status: input.status,
    billingCycle: input.billingCycle,
    plan: nullify(input.plan),
    seats: input.seats ?? null,
    costPerMonth: input.costPerMonth ?? null,
    renewalDate: toDate(input.renewalDate),
    url: nullify(input.url),
    notes: nullify(input.notes),
    ownerId: nullify(input.ownerId),
    ventureId: nullify(input.ventureId),
  };
}

export async function createTool(input: ToolInput) {
  const parsed = toolSchema.parse(input);
  const created = await prisma.toolSubscription.create({ data: toData(parsed) });
  revalidatePath("/tools");
  redirect(`/tools/${created.id}`);
}

export async function updateTool(id: string, input: ToolInput) {
  const parsed = toolSchema.parse(input);
  await prisma.toolSubscription.update({ where: { id }, data: toData(parsed) });
  revalidatePath("/tools");
  revalidatePath(`/tools/${id}`);
  redirect(`/tools/${id}`);
}

export async function deleteTool(id: string) {
  await prisma.toolSubscription.delete({ where: { id } });
  revalidatePath("/tools");
  redirect("/tools");
}
