"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { offerSchema, type OfferInput } from "@/lib/schemas";
import { reserveNextOfferNumber } from "@/lib/invoice-numbering";
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


export async function createOffer(data: OfferInput) {
  const parsed = offerSchema.parse(data);
  const number = await reserveNextOfferNumber();
  const ventureId = await resolveVentureId(parsed.projectId);
  const created = await prisma.offer.create({
    data: {
      number,
      clientId: parsed.clientId,
      projectId: parsed.projectId || null,
      ventureId,
      date: new Date(parsed.date),
      validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
      paymentTerms: parsed.paymentTerms || null,
      notes: parsed.notes || null,
      vatRate: parsed.vatRate,
      status: parsed.status,
      items: {
        create: parsed.items.map((item, idx) => ({
          position: idx + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || null,
          unitPrice: item.unitPrice,
        })),
      },
    },
  });
  revalidatePath("/offers");
  redirect(`/offers/${created.id}`);
}

export async function updateOffer(id: string, data: OfferInput) {
  const parsed = offerSchema.parse(data);
  const ventureId = await resolveVentureId(parsed.projectId);
  await prisma.$transaction([
    prisma.offerItem.deleteMany({ where: { offerId: id } }),
    prisma.offer.update({
      where: { id },
      data: {
        clientId: parsed.clientId,
        projectId: parsed.projectId || null,
        ventureId,
        date: new Date(parsed.date),
        validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
        paymentTerms: parsed.paymentTerms || null,
        notes: parsed.notes || null,
        vatRate: parsed.vatRate,
        status: parsed.status,
        items: {
          create: parsed.items.map((item, idx) => ({
            position: idx + 1,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || null,
            unitPrice: item.unitPrice,
          })),
        },
      },
    }),
  ]);
  revalidatePath("/offers");
  revalidatePath(`/offers/${id}`);
  redirect(`/offers/${id}`);
}

export async function deleteOffer(id: string) {
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/offers");
  redirect("/offers");
}
