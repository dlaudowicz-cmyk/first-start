"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { contractSchema, type ContractInput } from "@/lib/schemas";
import { nullify, toDate } from "@/lib/form";

function toData(input: ContractInput) {
  return {
    title: input.title.trim(),
    type: input.type,
    status: input.status,
    counterparty: input.counterparty.trim(),
    signedAt: toDate(input.signedAt),
    startDate: toDate(input.startDate),
    endDate: toDate(input.endDate),
    noticePeriodDays: input.noticePeriodDays ?? null,
    value: input.value ?? null,
    notes: nullify(input.notes),
    ventureId: nullify(input.ventureId),
    clientId: nullify(input.clientId),
    personId: nullify(input.personId),
  };
}

export async function createContract(input: ContractInput) {
  const parsed = contractSchema.parse(input);
  const created = await prisma.contract.create({ data: toData(parsed) });
  revalidatePath("/contracts");
  redirect(`/contracts/${created.id}`);
}

export async function updateContract(id: string, input: ContractInput) {
  const parsed = contractSchema.parse(input);
  await prisma.contract.update({ where: { id }, data: toData(parsed) });
  revalidatePath("/contracts");
  revalidatePath(`/contracts/${id}`);
  redirect(`/contracts/${id}`);
}

export async function deleteContract(id: string) {
  await prisma.contract.delete({ where: { id } });
  revalidatePath("/contracts");
  redirect("/contracts");
}
