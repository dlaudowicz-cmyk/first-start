import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PROJECT_TYPES = [
  "image film",
  "social media campaign",
  "AI film",
  "commercial",
  "documentary",
  "editing",
  "consulting",
] as const;

export const PROJECT_STATUSES = [
  "lead",
  "offer sent",
  "confirmed",
  "in production",
  "delivered",
  "paid",
] as const;

export const OFFER_STATUSES = ["draft", "sent", "accepted", "rejected", "expired"] as const;

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

// ── Company layer ────────────────────────────────────────────────────────────

export const VENTURE_KINDS = ["studio", "brand", "podcast", "product", "internal"] as const;
export const VENTURE_STATUSES = ["active", "incubating", "paused", "archived"] as const;

export const PERSON_TYPES = ["founder", "employee", "freelancer", "partner", "advisor"] as const;
export const PERSON_STATUSES = ["active", "prospect", "inactive"] as const;

export const CONTRACT_TYPES = [
  "client",
  "freelancer",
  "cooperation",
  "nda",
  "license",
  "lease",
  "insurance",
  "other",
] as const;
export const CONTRACT_STATUSES = ["draft", "in review", "signed", "active", "expired", "terminated"] as const;

export const CREDENTIAL_CATEGORIES = [
  "account",
  "api",
  "domain",
  "bank",
  "social",
  "hardware",
  "other",
] as const;
export const CRITICALITY_LEVELS = ["low", "normal", "high", "critical"] as const;

export const TOOL_CATEGORIES = ["ai", "production", "finance", "infra", "comms", "legal", "other"] as const;
export const TOOL_STATUSES = ["active", "evaluating", "paused", "cancelled"] as const;
export const BILLING_CYCLES = ["monthly", "yearly", "usage", "one-off"] as const;

export const TASK_STATUSES = ["open", "in progress", "blocked", "done"] as const;
export const TASK_PRIORITIES = ["low", "normal", "high"] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type OfferStatus = (typeof OFFER_STATUSES)[number];
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Monthly-equivalent cost so yearly/one-off subscriptions can be summed. */
export function monthlyCost(costPerMonth: number | null, billingCycle: string): number {
  if (!costPerMonth) return 0;
  if (billingCycle === "yearly") return costPerMonth / 12;
  if (billingCycle === "one-off") return 0;
  return costPerMonth;
}

/** Days until a date; negative when already past. Null-safe. */
export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return Math.round((startOfDay(d) - startOfDay(new Date())) / 86_400_000);
}

export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", ...opts }).format(d);
}

export function statusTone(status: string): "neutral" | "info" | "warning" | "success" | "danger" {
  const map: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
    lead: "neutral",
    "offer sent": "info",
    confirmed: "info",
    "in production": "warning",
    delivered: "success",
    paid: "success",
    draft: "neutral",
    sent: "info",
    accepted: "success",
    rejected: "danger",
    expired: "danger",
    overdue: "danger",
    cancelled: "neutral",
    // company layer
    active: "success",
    incubating: "info",
    paused: "warning",
    archived: "neutral",
    prospect: "info",
    inactive: "neutral",
    "in review": "warning",
    signed: "success",
    terminated: "danger",
    evaluating: "info",
    open: "neutral",
    "in progress": "warning",
    blocked: "danger",
    done: "success",
    low: "neutral",
    normal: "neutral",
    high: "warning",
    critical: "danger",
  };
  return map[status] ?? "neutral";
}
