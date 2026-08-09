"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { personSchema, type PersonInput } from "@/lib/schemas";
import { nullify } from "@/lib/form";

function toData(input: PersonInput) {
  return {
    name: input.name.trim(),
    type: input.type,
    status: input.status,
    role: nullify(input.role),
    email: nullify(input.email),
    phone: nullify(input.phone),
    location: nullify(input.location),
    dayRate: input.dayRate ?? null,
    skills: nullify(input.skills),
    notes: nullify(input.notes),
  };
}

export async function createPerson(input: PersonInput) {
  const parsed = personSchema.parse(input);
  const created = await prisma.person.create({ data: toData(parsed) });
  revalidatePath("/people");
  redirect(`/people/${created.id}`);
}

export async function updatePerson(id: string, input: PersonInput) {
  const parsed = personSchema.parse(input);
  await prisma.person.update({ where: { id }, data: toData(parsed) });
  revalidatePath("/people");
  revalidatePath(`/people/${id}`);
  redirect(`/people/${id}`);
}

export async function deletePerson(id: string) {
  // Keep the records they own; just detach the person.
  await prisma.$transaction([
    prisma.credential.updateMany({ where: { ownerId: id }, data: { ownerId: null } }),
    prisma.toolSubscription.updateMany({ where: { ownerId: id }, data: { ownerId: null } }),
    prisma.contract.updateMany({ where: { personId: id }, data: { personId: null } }),
    prisma.task.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } }),
    prisma.person.delete({ where: { id } }),
  ]);
  revalidatePath("/people");
  redirect("/people");
}
