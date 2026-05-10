import { statusTone } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status);
  const cls = {
    neutral: "badge-neutral",
    info: "badge-info",
    warning: "badge-warning",
    success: "badge-success",
    danger: "badge-danger",
  }[tone];
  return <span className={cn(cls, "capitalize")}>{status}</span>;
}
