"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { expenseSchema, type ExpenseInput } from "@/lib/schemas";
import { calculateSpesen } from "@/lib/spesen";
import { SPESEN_RATES } from "@/lib/spesen-rates";
import { formatCurrency } from "@/lib/utils";
import { saveExpense } from "./actions";

type Props = {
  projects: { id: string; title: string }[];
};

export function ExpenseCalculator({ projects }: Props) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      travelDate: new Date().toISOString().slice(0, 10),
      startTime: "08:00",
      endTime: "18:00",
      overnight: false,
      breakfast: false,
      lunch: false,
      dinner: false,
      people: 1,
      projectId: "",
      notes: "",
    },
  });

  const w = watch();
  const breakdown = calculateSpesen({
    startTime: w.startTime || null,
    endTime: w.endTime || null,
    overnight: !!w.overnight,
    breakfast: !!w.breakfast,
    lunch: !!w.lunch,
    dinner: !!w.dinner,
    people: Number(w.people) || 1,
  });

  const onSubmit = (data: ExpenseInput) => {
    startTransition(async () => {
      await saveExpense(data);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 lg:col-span-2 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Reisedatum" error={errors.travelDate?.message}>
            <input className="input" type="date" {...register("travelDate")} />
          </Field>
          <Field label="Projekt (optional)">
            <select className="input" {...register("projectId")}>
              <option value="">—</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Beginn" error={errors.startTime?.message}>
            <input className="input" type="time" {...register("startTime")} />
          </Field>
          <Field label="Ende" error={errors.endTime?.message}>
            <input className="input" type="time" {...register("endTime")} />
          </Field>
          <Field label="Personenzahl">
            <input className="input" type="number" min={1} {...register("people")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <Toggle label="Übernachtung" {...register("overnight")} />
          <Toggle label="Frühstück gestellt" {...register("breakfast")} />
          <Toggle label="Mittag gestellt" {...register("lunch")} />
          <Toggle label="Abendessen gestellt" {...register("dinner")} />
        </div>

        <Field label="Notizen">
          <textarea className="input min-h-[80px]" {...register("notes")} />
        </Field>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Speichere…" : "Spesen speichern"}
          </button>
        </div>
      </div>

      <aside className="card p-6 h-fit space-y-4 sticky top-6">
        <h3 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Spesen-Berechnung</h3>

        <div className="text-sm">
          <div className="text-ink-mute">{breakdown.reason}</div>
          <div className="font-display font-semibold text-3xl mt-3 text-ink tabular-nums">
            {formatCurrency(breakdown.total)}
          </div>
          <div className="text-xs text-ink-mute">
            {formatCurrency(breakdown.perPerson)} × {breakdown.people} {breakdown.people === 1 ? "Person" : "Personen"}
          </div>
        </div>

        <dl className="text-xs space-y-1.5 border-t border-line-soft pt-3">
          <Line label="Basis" value={formatCurrency(breakdown.baseAllowance)} />
          {breakdown.breakfastDeduction > 0 && (
            <Line label={`− Frühstück (${SPESEN_RATES.breakfastReductionPct}%)`} value={`− ${formatCurrency(breakdown.breakfastDeduction)}`} />
          )}
          {breakdown.lunchDeduction > 0 && (
            <Line label={`− Mittagessen (${SPESEN_RATES.lunchReductionPct}%)`} value={`− ${formatCurrency(breakdown.lunchDeduction)}`} />
          )}
          {breakdown.dinnerDeduction > 0 && (
            <Line label={`− Abendessen (${SPESEN_RATES.dinnerReductionPct}%)`} value={`− ${formatCurrency(breakdown.dinnerDeduction)}`} />
          )}
          <Line label="Pro Person" value={formatCurrency(breakdown.perPerson)} bold />
        </dl>

        <p className="text-[11px] text-ink-mute pt-2">
          Sätze konfigurierbar in <code className="font-mono">src/lib/spesen-rates.ts</code> · Voller Tag: {formatCurrency(SPESEN_RATES.fullAllowance)} · 8h+ / Anreise: {formatCurrency(SPESEN_RATES.smallAllowance)}
        </p>
      </aside>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

const Toggle = (
  { label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }
) => (
  <label className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm cursor-pointer hover:bg-surface-2">
    <input type="checkbox" className="accent-neon" {...rest} />
    <span>{label}</span>
  </label>
);

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium pt-1.5 border-t border-line-soft" : ""}`}>
      <dt className="text-ink-mute">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
