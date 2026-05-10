import { prisma } from "./db";

export function formatInvoiceNumber(prefix: string, num: number): string {
  return `${prefix}${String(num).padStart(4, "0")}`;
}

export function formatOfferNumber(prefix: string, num: number): string {
  const year = new Date().getFullYear();
  return `${prefix}${year}-${String(num).padStart(3, "0")}`;
}

export async function reserveNextInvoiceNumber(): Promise<string> {
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  const number = formatInvoiceNumber(settings.invoicePrefix, settings.nextInvoiceNo);
  await prisma.companySettings.update({
    where: { id: "singleton" },
    data: { nextInvoiceNo: settings.nextInvoiceNo + 1 },
  });
  return number;
}

export async function reserveNextOfferNumber(): Promise<string> {
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  const number = formatOfferNumber(settings.offerPrefix, settings.nextOfferNo);
  await prisma.companySettings.update({
    where: { id: "singleton" },
    data: { nextOfferNo: settings.nextOfferNo + 1 },
  });
  return number;
}
