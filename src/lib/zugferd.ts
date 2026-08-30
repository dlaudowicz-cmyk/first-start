/**
 * ZUGFeRD-ready structured invoice data layer.
 *
 * This builds a normalized JSON shape close to the BASIC profile of
 * ZUGFeRD / Factur-X (CrossIndustryInvoice). It is *not* the final XML —
 * see TODO in README. A future step will map this object to the actual
 * UN/CEFACT CII XML and embed it into the PDF/A-3.
 */
import type { Invoice, InvoiceItem, Client, CompanySettings } from "@prisma/client";
import { calculateTotals } from "./calculations";

export type ZugferdInvoice = {
  meta: {
    profile: "BASIC";
    schema: "urn:cen.eu:en16931:2017";
    generatedAt: string;
  };
  document: {
    id: string;
    issueDate: string;
    dueDate: string | null;
    /** Zeitpunkt der Leistung — § 14 Abs. 4 Nr. 6 UStG / BT-72, BG-14. */
    serviceDate: string | null;
    serviceEndDate: string | null;
    currencyCode: "EUR";
    paymentTerms: string | null;
    note: string | null;
  };
  seller: {
    name: string;
    owner: string;
    address: string | null;
    taxNumber: string | null;
    vatId: string | null;
    email: string | null;
    phone: string | null;
    bank: { iban: string | null; bic: string | null; name: string | null };
  };
  buyer: {
    name: string;
    contactPerson: string | null;
    address: string | null;
    vatId: string | null;
    email: string | null;
  };
  items: Array<{
    position: number;
    description: string;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    lineNet: number;
  }>;
  totals: {
    lineNetTotal: number;
    taxBasisTotal: number;
    vatRate: number;
    vatTotal: number;
    grandTotal: number;
  };
};

export function buildZugferdInvoice(args: {
  invoice: Invoice & { items: InvoiceItem[]; client: Client };
  settings: CompanySettings;
}): ZugferdInvoice {
  const { invoice, settings } = args;
  const items = [...invoice.items].sort((a, b) => a.position - b.position);
  const totals = calculateTotals(
    items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
    invoice.vatRate,
  );

  return {
    meta: {
      profile: "BASIC",
      schema: "urn:cen.eu:en16931:2017",
      generatedAt: new Date().toISOString(),
    },
    document: {
      id: invoice.number,
      issueDate: invoice.date.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      // Falls kein Leistungsdatum erfasst ist, gilt das Rechnungsdatum.
      serviceDate: (invoice.serviceDate ?? invoice.date).toISOString(),
      serviceEndDate: invoice.serviceEndDate ? invoice.serviceEndDate.toISOString() : null,
      currencyCode: "EUR",
      paymentTerms: invoice.paymentTerms,
      note: invoice.notes,
    },
    seller: {
      name: settings.companyName,
      owner: settings.owner,
      address: settings.address,
      taxNumber: settings.taxNumber,
      vatId: settings.vatId,
      email: settings.email,
      phone: settings.phone,
      bank: { iban: settings.iban, bic: settings.bic, name: settings.bankName },
    },
    buyer: {
      name: invoice.client.companyName,
      contactPerson: invoice.client.contactPerson,
      address: invoice.client.address,
      vatId: invoice.client.vatId,
      email: invoice.client.email,
    },
    items: items.map((item, idx) => ({
      position: item.position || idx + 1,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      lineNet: totals.itemTotals[idx],
    })),
    totals: {
      lineNetTotal: totals.net,
      taxBasisTotal: totals.net,
      vatRate: invoice.vatRate,
      vatTotal: totals.vat,
      grandTotal: totals.gross,
    },
  };
}
