"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { credentialSchema, type CredentialInput } from "@/lib/schemas";
import { nullify, toDate } from "@/lib/form";

/**
 * Note: there is intentionally no secret/password field anywhere in this
 * module. The vault records *where* a secret lives, never the secret itself.
 */
function toData(input: CredentialInput) {
  return {
    service: input.service.trim(),
    category: input.category,
    criticality: input.criticality,
    url: nullify(input.url),
    identifier: nullify(input.identifier),
    storageLocation: input.storageLocation.trim(),
    vaultRef: nullify(input.vaultRef),
    mfaLocation: nullify(input.mfaLocation),
    sharedWith: nullify(input.sharedWith),
    rotatedAt: toDate(input.rotatedAt),
    rotateEveryDays: input.rotateEveryDays ?? null,
    notes: nullify(input.notes),
    ownerId: nullify(input.ownerId),
    ventureId: nullify(input.ventureId),
  };
}

export async function createCredential(input: CredentialInput) {
  const parsed = credentialSchema.parse(input);
  const created = await prisma.credential.create({ data: toData(parsed) });
  revalidatePath("/vault");
  redirect(`/vault/${created.id}`);
}

export async function updateCredential(id: string, input: CredentialInput) {
  const parsed = credentialSchema.parse(input);
  await prisma.credential.update({ where: { id }, data: toData(parsed) });
  revalidatePath("/vault");
  revalidatePath(`/vault/${id}`);
  redirect(`/vault/${id}`);
}

export async function deleteCredential(id: string) {
  await prisma.credential.delete({ where: { id } });
  revalidatePath("/vault");
  redirect("/vault");
}

/** Stamp today as the rotation date — used by the "Mark rotated" button. */
export async function markRotated(id: string) {
  await prisma.credential.update({ where: { id }, data: { rotatedAt: new Date() } });
  revalidatePath("/vault");
  revalidatePath(`/vault/${id}`);
}
