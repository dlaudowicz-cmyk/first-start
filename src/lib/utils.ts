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

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type OfferStatus = (typeof OFFER_STATUSES)[number];
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

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
  };
  return map[status] ?? "neutral";
}
