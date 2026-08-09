"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { clientSchema } from "@/lib/schemas";
import { getActiveVenture } from "@/lib/venture-context";

function parseFormData(formData: FormData) {
  return {
    companyName: String(formData.get("companyName") || "").trim(),
    contactPerson: String(formData.get("contactPerson") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    vatId: String(formData.get("vatId") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };
}

export async function createClient(formData: FormData) {
  const data = clientSchema.parse(parseFormData(formData));
  // Link the new client to whichever venture the user is currently scoped to,
  // so it does not immediately disappear from their filtered list.
  const active = await getActiveVenture();
  const created = await prisma.client.create({
    data: {
      ...data,
      contactPerson: data.contactPerson || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      vatId: data.vatId || null,
      notes: data.notes || null,
      ventures: active ? { create: [{ ventureId: active.id }] } : undefined,
    },
  });
  revalidatePath("/clients");
  redirect(`/clients/${created.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const data = clientSchema.parse(parseFormData(formData));
  await prisma.client.update({
    where: { id },
    data: {
      ...data,
      contactPerson: data.contactPerson || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      vatId: data.vatId || null,
      notes: data.notes || null,
    },
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}
