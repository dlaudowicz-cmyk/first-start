import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-border px-8 py-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "error" | "success";
}) {
  const toneClass = {
    default: "text-foreground",
    warning: "text-warning",
    error: "text-error",
    success: "text-success",
  }[tone];

  return (
    <Card className="px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`text-2xl font-semibold mt-1 tabular-nums ${toneClass}`}>{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </Card>
  );
}

const STATUS_LABELS: Record<string, string> = {
  entwurf: "Entwurf",
  in_bearbeitung: "In Bearbeitung",
  review: "Review",
  freigegeben: "Freigegeben",
  archiviert: "Archiviert",
  intern_geprueft: "Intern geprüft",
  fam_geprueft: "FAM geprüft",
  ihk_fassung: "IHK-Fassung",
  offen: "Offen",
  erledigt: "Erledigt",
  abgelehnt: "Abgelehnt",
  aktiv: "Aktiv",
  veraltet: "Veraltet",
  ersetzt: "Ersetzt",
};

const STATUS_TONE: Record<string, string> = {
  entwurf: "bg-border text-muted",
  in_bearbeitung: "bg-warning-bg text-warning",
  review: "bg-warning-bg text-warning",
  freigegeben: "bg-success-bg text-success",
  archiviert: "bg-border text-muted",
  intern_geprueft: "bg-warning-bg text-warning",
  fam_geprueft: "bg-warning-bg text-warning",
  ihk_fassung: "bg-warning-bg text-warning",
  offen: "bg-warning-bg text-warning",
  erledigt: "bg-success-bg text-success",
  abgelehnt: "bg-error-bg text-error",
  aktiv: "bg-success-bg text-success",
  veraltet: "bg-error-bg text-error",
  ersetzt: "bg-border text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "bg-border text-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function WarningList({
  warnings,
}: {
  warnings: { level: "error" | "warning"; message: string }[];
}) {
  if (warnings.length === 0) {
    return (
      <p className="text-sm text-success flex items-center gap-2">
        Keine offenen Warnungen.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {warnings.map((w, i) => (
        <li
          key={i}
          className={`text-sm rounded-md px-3 py-2 ${
            w.level === "error" ? "bg-error-bg text-error" : "bg-warning-bg text-warning"
          }`}
        >
          {w.message}
        </li>
      ))}
    </ul>
  );
}
