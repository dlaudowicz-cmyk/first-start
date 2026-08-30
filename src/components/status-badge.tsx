import { statusTone, cn } from "@/lib/utils";
import { de } from "@/lib/labels";

/**
 * Zeigt einen gespeicherten Statuswert deutsch an. Der Wert selbst bleibt
 * englisch — er ist der Schlüssel, nicht der Text.
 */
export function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status);
  const cls = {
    neutral: "badge-neutral",
    info: "badge-info",
    warning: "badge-warning",
    success: "badge-success",
    danger: "badge-danger",
  }[tone];
  return <span className={cn(cls, "whitespace-nowrap")}>{de.anyStatus(status)}</span>;
}
