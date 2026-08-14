import { z } from "zod";
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  OFFER_STATUSES,
  INVOICE_STATUSES,
  VENTURE_KINDS,
  VENTURE_STATUSES,
  PERSON_TYPES,
  PERSON_STATUSES,
  CONTRACT_TYPES,
  CONTRACT_STATUSES,
  CREDENTIAL_CATEGORIES,
  CRITICALITY_LEVELS,
  TOOL_CATEGORIES,
  TOOL_STATUSES,
  BILLING_CYCLES,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from "./utils";

/** Optional text field: empty string is allowed and later normalized to null. */
const optionalText = z.string().optional().or(z.literal(""));
/** Optional number that tolerates an empty form field. */
const optionalNumber = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().optional(),
);
const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().optional(),
);

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
  ventureId: optionalText,
  pipelineKey: optionalText,
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

// ─────────────────────────────── COMPANY LAYER ───────────────────────────────

export const ventureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  kind: z.enum(VENTURE_KINDS),
  status: z.enum(VENTURE_STATUSES),
  tagline: optionalText,
  description: optionalText,
  accent: optionalText,
  foundedAt: optionalText,
});
export type VentureInput = z.infer<typeof ventureSchema>;

export const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(PERSON_TYPES),
  status: z.enum(PERSON_STATUSES),
  role: optionalText,
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: optionalText,
  location: optionalText,
  dayRate: optionalNumber,
  skills: optionalText,
  notes: optionalText,
});
export type PersonInput = z.infer<typeof personSchema>;

export const ventureMemberSchema = z.object({
  personId: z.string().min(1, "Person is required"),
  ventureId: z.string().min(1, "Venture is required"),
  role: z.string().min(1, "Role is required"),
  allocation: optionalInt,
});
export type VentureMemberInput = z.infer<typeof ventureMemberSchema>;

export const contractSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(CONTRACT_TYPES),
  status: z.enum(CONTRACT_STATUSES),
  counterparty: z.string().min(1, "Counterparty is required"),
  signedAt: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  noticePeriodDays: optionalInt,
  value: optionalNumber,
  notes: optionalText,
  ventureId: optionalText,
  clientId: optionalText,
  personId: optionalText,
});
export type ContractInput = z.infer<typeof contractSchema>;

/**
 * Vault entries are references only — there is deliberately no field for a
 * secret value. `vaultRef` points at where the secret actually lives.
 */
export const credentialSchema = z.object({
  service: z.string().min(1, "Service is required"),
  category: z.enum(CREDENTIAL_CATEGORIES),
  criticality: z.enum(CRITICALITY_LEVELS),
  url: optionalText,
  identifier: optionalText,
  storageLocation: z.string().min(1, "Where the secret lives is required"),
  vaultRef: optionalText,
  mfaLocation: optionalText,
  sharedWith: optionalText,
  rotatedAt: optionalText,
  rotateEveryDays: optionalInt,
  notes: optionalText,
  ownerId: optionalText,
  ventureId: optionalText,
});
export type CredentialInput = z.infer<typeof credentialSchema>;

export const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(TOOL_CATEGORIES),
  status: z.enum(TOOL_STATUSES),
  billingCycle: z.enum(BILLING_CYCLES),
  plan: optionalText,
  seats: optionalInt,
  costPerMonth: optionalNumber,
  renewalDate: optionalText,
  url: optionalText,
  notes: optionalText,
  ownerId: optionalText,
  ventureId: optionalText,
});
export type ToolInput = z.infer<typeof toolSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  detail: optionalText,
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: optionalText,
  source: optionalText,
  assigneeId: optionalText,
  assigneeLabel: optionalText,
  ventureId: optionalText,
  projectId: optionalText,
});
export type TaskInput = z.infer<typeof taskSchema>;
