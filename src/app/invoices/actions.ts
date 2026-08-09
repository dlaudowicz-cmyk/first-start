"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { invoiceSchema, type InvoiceInput } from "@/lib/schemas";
import { reserveNextInvoiceNumber } from "@/lib/invoice-numbering";
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


export async function createInvoice(data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const number = await reserveNextInvoiceNumber();
  const ventureId = await resolveVentureId(parsed.projectId);
  const created = await prisma.invoice.create({
    data: {
      number,
      clientId: parsed.clientId,
      projectId: parsed.projectId || null,
      ventureId,
      date: new Date(parsed.date),
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      paymentTerms: parsed.paymentTerms || null,
      notes: parsed.notes || null,
      vatRate: parsed.vatRate,
      status: parsed.status,
      paidAt: parsed.status === "paid" ? new Date() : null,
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
  revalidatePath("/invoices");
  redirect(`/invoices/${created.id}`);
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const existing = await prisma.invoice.findUnique({ where: { id }, select: { status: true, paidAt: true } });
  let paidAt: Date | null = existing?.paidAt ?? null;
  if (parsed.status === "paid" && !paidAt) paidAt = new Date();
  if (parsed.status !== "paid") paidAt = null;

  const ventureId = await resolveVentureId(parsed.projectId);
  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        clientId: parsed.clientId,
        projectId: parsed.projectId || null,
        ventureId,
        date: new Date(parsed.date),
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        paymentTerms: parsed.paymentTerms || null,
        notes: parsed.notes || null,
        vatRate: parsed.vatRate,
        status: parsed.status,
        paidAt,
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
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function markInvoicePaid(id: string) {
  await prisma.invoice.update({ where: { id }, data: { status: "paid", paidAt: new Date() } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}
