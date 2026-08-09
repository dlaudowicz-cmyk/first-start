"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ventureSchema, ventureMemberSchema, type VentureInput, type VentureMemberInput } from "@/lib/schemas";
import { nullify, toDate } from "@/lib/form";

function toData(input: VentureInput) {
  return {
    name: input.name.trim(),
    slug: input.slug.trim(),
    kind: input.kind,
    status: input.status,
    tagline: nullify(input.tagline),
    description: nullify(input.description),
    accent: nullify(input.accent),
    foundedAt: toDate(input.foundedAt),
  };
}

export async function createVenture(input: VentureInput) {
  const parsed = ventureSchema.parse(input);
  const created = await prisma.venture.create({ data: toData(parsed) });
  revalidatePath("/ventures");
  revalidatePath("/", "layout");
  redirect(`/ventures/${created.slug}`);
}

export async function updateVenture(id: string, input: VentureInput) {
  const parsed = ventureSchema.parse(input);
  const updated = await prisma.venture.update({ where: { id }, data: toData(parsed) });
  revalidatePath("/ventures");
  revalidatePath("/", "layout");
  redirect(`/ventures/${updated.slug}`);
}

export async function deleteVenture(id: string) {
  // Operational records reference ventures optionally — detach instead of
  // cascading so invoices and projects are never silently destroyed.
  await prisma.$transaction([
    prisma.project.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.offer.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.invoice.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.expense.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.contract.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.credential.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.toolSubscription.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.task.updateMany({ where: { ventureId: id }, data: { ventureId: null } }),
    prisma.venture.delete({ where: { id } }),
  ]);
  revalidatePath("/ventures");
  revalidatePath("/", "layout");
  redirect("/ventures");
}

export async function addVentureMember(input: VentureMemberInput) {
  const parsed = ventureMemberSchema.parse(input);
  await prisma.ventureMember.upsert({
    where: { personId_ventureId: { personId: parsed.personId, ventureId: parsed.ventureId } },
    update: { role: parsed.role, allocation: parsed.allocation ?? null },
    create: {
      personId: parsed.personId,
      ventureId: parsed.ventureId,
      role: parsed.role,
      allocation: parsed.allocation ?? null,
    },
  });
  revalidatePath("/ventures");
  revalidatePath("/people");
}

export async function removeVentureMember(id: string) {
  await prisma.ventureMember.delete({ where: { id } });
  revalidatePath("/ventures");
  revalidatePath("/people");
}

/** Attach or detach a client from a venture (clients are many-to-many). */
export async function setClientVenture(clientId: string, ventureId: string, attached: boolean) {
  if (attached) {
    await prisma.clientVenture.upsert({
      where: { clientId_ventureId: { clientId, ventureId } },
      update: {},
      create: { clientId, ventureId },
    });
  } else {
    await prisma.clientVenture.deleteMany({ where: { clientId, ventureId } });
  }
  revalidatePath("/clients");
  revalidatePath("/ventures");
}
