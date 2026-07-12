import type { ReactNode } from "react";
import { AnimatedNumber } from "./animated-number";

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
    <div className="animate-fade-up flex items-start justify-between border-b border-border px-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight gradient-text">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-border ${glow ? "card-glow" : "bg-surface"} ${className}`}
    >
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
    default: "gradient-text",
    warning: "text-warning",
    error: "text-error",
    success: "text-success",
  }[tone];

  const numeric = value.match(/^-?\d+(\.\d+)?/);
  const prefix = numeric ? value.slice(0, numeric.index) : "";
  const suffix = numeric ? value.slice((numeric.index ?? 0) + numeric[0].length) : "";

  return (
    <Card className="px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`text-3xl font-semibold mt-1 tabular-nums ${toneClass}`}>
        {numeric ? (
          <>
            {prefix}
            <AnimatedNumber value={Number(numeric[0])} />
            {suffix}
          </>
        ) : (
          value
        )}
      </p>
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

const STATUS_DOT: Record<string, string> = {
  freigegeben: "bg-success",
  erledigt: "bg-success",
  aktiv: "bg-success",
  in_bearbeitung: "bg-warning",
  review: "bg-warning",
  intern_geprueft: "bg-warning",
  fam_geprueft: "bg-warning",
  ihk_fassung: "bg-warning",
  offen: "bg-warning",
  abgelehnt: "bg-error",
  veraltet: "bg-error",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "bg-border text-muted";
  const dot = STATUS_DOT[status] ?? "bg-muted";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
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
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        Keine offenen Warnungen.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {warnings.map((w, i) => (
        <li
          key={i}
          className={`animate-fade-up flex items-start gap-2 text-sm rounded-md px-3 py-2 ${
            w.level === "error" ? "bg-error-bg text-error" : "bg-warning-bg text-warning"
          }`}
          style={{ animationDelay: `${Math.min(i, 12) * 0.03}s` }}
        >
          <span className="mt-0.5 shrink-0">{w.level === "error" ? "⛔" : "⚠️"}</span>
          {w.message}
        </li>
      ))}
    </ul>
  );
}
