import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Label + control + error message. Shared by every form in the app. */
export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-graphite-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="card p-6">
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-graphite-500">{title}</h3>
          {description && <p className="mt-1 text-xs text-graphite-500">{description}</p>}
        </div>
      )}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-5", className)}>{children}</div>
    </section>
  );
}

export function FormActions({
  cancelHref,
  onDelete,
  pending,
  submitLabel,
  deleteLabel = "Delete",
}: {
  cancelHref: string;
  onDelete?: () => void;
  pending?: boolean;
  submitLabel: string;
  deleteLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <a href={cancelHref} className="btn-secondary">
          Cancel
        </a>
        {onDelete && (
          <button type="button" onClick={onDelete} className="btn-danger" disabled={pending}>
            {deleteLabel}
          </button>
        )}
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
