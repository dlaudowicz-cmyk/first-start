"use server";

import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { settingsSchema } from "@/lib/schemas";

export async function updateSettings(formData: FormData) {
  const data = settingsSchema.parse({
    companyName: formData.get("companyName"),
    owner: formData.get("owner"),
    address: formData.get("address"),
    taxNumber: formData.get("taxNumber"),
    vatId: formData.get("vatId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    bankName: formData.get("bankName"),
    iban: formData.get("iban"),
    bic: formData.get("bic"),
    defaultVatRate: formData.get("defaultVatRate"),
    invoicePrefix: formData.get("invoicePrefix"),
    nextInvoiceNo: formData.get("nextInvoiceNo"),
    offerPrefix: formData.get("offerPrefix"),
    nextOfferNo: formData.get("nextOfferNo"),
  });

  await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {
      companyName: data.companyName,
      owner: data.owner,
      address: data.address || null,
      taxNumber: data.taxNumber || null,
      vatId: data.vatId || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      bankName: data.bankName || null,
      iban: data.iban || null,
      bic: data.bic || null,
      defaultVatRate: data.defaultVatRate,
      invoicePrefix: data.invoicePrefix,
      nextInvoiceNo: data.nextInvoiceNo,
      offerPrefix: data.offerPrefix,
      nextOfferNo: data.nextOfferNo,
    },
    create: {
      id: "singleton",
      companyName: data.companyName,
      owner: data.owner,
      address: data.address || null,
      taxNumber: data.taxNumber || null,
      vatId: data.vatId || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      bankName: data.bankName || null,
      iban: data.iban || null,
      bic: data.bic || null,
      defaultVatRate: data.defaultVatRate,
      invoicePrefix: data.invoicePrefix,
      nextInvoiceNo: data.nextInvoiceNo,
      offerPrefix: data.offerPrefix,
      nextOfferNo: data.nextOfferNo,
    },
  });

  revalidatePath("/settings");
}

export async function uploadLogo(formData: FormData) {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return;
  const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("Unsupported logo format. Use PNG, JPG, SVG or WebP.");
  }
  const ext = file.type.split("/")[1].replace("svg+xml", "svg");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const filename = `logo-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: { logoPath: `/uploads/${filename}` },
    create: { id: "singleton", logoPath: `/uploads/${filename}` },
  });
  revalidatePath("/settings");
}
