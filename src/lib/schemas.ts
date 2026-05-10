import { z } from "zod";
import { PROJECT_STATUSES, PROJECT_TYPES, OFFER_STATUSES, INVOICE_STATUSES } from "./utils";

export const clientSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  vatId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
export type ClientInput = z.infer<typeof clientSchema>;

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().min(1, "Client is required"),
  type: z.enum(PROJECT_TYPES),
  status: z.enum(PROJECT_STATUSES),
  shootStart: z.string().optional().or(z.literal("")),
  shootEnd: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().optional(),
  notes: z.string().optional().or(z.literal("")),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const lineItemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().min(0, "≥ 0"),
  unitPrice: z.coerce.number().min(0, "≥ 0"),
  unit: z.string().optional().or(z.literal("")),
});
export type LineItemInput = z.infer<typeof lineItemSchema>;

export const offerSchema = z.object({
  clientId: z.string().min(1, "Client required"),
  projectId: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Date required"),
  validUntil: z.string().optional().or(z.literal("")),
  paymentTerms: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  vatRate: z.coerce.number().min(0).max(100),
  status: z.enum(OFFER_STATUSES),
  items: z.array(lineItemSchema).min(1, "At least one line item required"),
});
export type OfferInput = z.infer<typeof offerSchema>;

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client required"),
  projectId: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Date required"),
  dueDate: z.string().optional().or(z.literal("")),
  paymentTerms: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  vatRate: z.coerce.number().min(0).max(100),
  status: z.enum(INVOICE_STATUSES),
  items: z.array(lineItemSchema).min(1, "At least one line item required"),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const expenseSchema = z.object({
  travelDate: z.string().min(1, "Date required"),
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().optional().or(z.literal("")),
  overnight: z.boolean(),
  breakfast: z.boolean(),
  lunch: z.boolean(),
  dinner: z.boolean(),
  people: z.coerce.number().int().min(1),
  projectId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const settingsSchema = z.object({
  companyName: z.string().min(1),
  owner: z.string().min(1),
  tagline: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxNumber: z.string().optional().or(z.literal("")),
  vatId: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  iban: z.string().optional().or(z.literal("")),
  bic: z.string().optional().or(z.literal("")),
  defaultVatRate: z.coerce.number().min(0).max(100),
  invoicePrefix: z.string().min(1),
  nextInvoiceNo: z.coerce.number().int().min(0),
  offerPrefix: z.string().min(1),
  nextOfferNo: z.coerce.number().int().min(0),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
