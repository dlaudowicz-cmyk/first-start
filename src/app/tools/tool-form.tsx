"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toolSchema, type ToolInput } from "@/lib/schemas";
import { de } from "@/lib/labels";
import { BILLING_CYCLES, TOOL_CATEGORIES, TOOL_STATUSES, formatCurrency, monthlyCost } from "@/lib/utils";
import { Field, FormActions, FormSection } from "@/components/form-field";
import { createTool, updateTool, deleteTool } from "./actions";

type Option = { id: string; label: string };

export function ToolForm({
  initial,
  ventures,
  people,
}: {
  initial?: Partial<ToolInput> & { id?: string };
  ventures: Option[];
  people: Option[];
}) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ToolInput>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: initial?.name ?? "",
      category: (initial?.category as ToolInput["category"]) ?? "production",
      status: (initial?.status as ToolInput["status"]) ?? "active",
      billingCycle: (initial?.billingCycle as ToolInput["billingCycle"]) ?? "monthly",
      plan: initial?.plan ?? "",
      seats: initial?.seats,
      costPerMonth: initial?.costPerMonth,
      renewalDate: initial?.renewalDate ?? "",
      url: initial?.url ?? "",
      notes: initial?.notes ?? "",
      ownerId: initial?.ownerId ?? "",
      ventureId: initial?.ventureId ?? "",
    },
  });

  const w = watch();
  const normalized = monthlyCost(Number(w.costPerMonth) || 0, w.billingCycle);

  const onSubmit = (data: ToolInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) await updateTool(initial.id, data);
      else await createTool(data);
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Abo-Eintrag löschen?")) return;
    startTransition(async () => {
      await deleteTool(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <FormSection>
        <Field label="Werkzeug" error={errors.name?.message}>
          <input className="input" {...register("name")} />
        </Field>
        <Field label="Tarif" error={errors.plan?.message}>
          <input className="input" {...register("plan")} />
        </Field>
        <Field label="Kategorie" error={errors.category?.message}>
          <select className="input" {...register("category")}>
            {TOOL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {de.toolCategory(c)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select className="input" {...register("status")}>
            {TOOL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {de.toolStatus(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="URL" error={errors.url?.message} className="md:col-span-2">
          <input className="input" {...register("url")} />
        </Field>
      </FormSection>

      <FormSection
        title="Kosten"
        description={`Normalized to ${formatCurrency(normalized)} per month for the company-wide rollup.`}
      >
        <Field label="Kosten" error={errors.costPerMonth?.message} hint="Amount per billing cycle">
          <input className="input" type="number" step="0.01" {...register("costPerMonth")} />
        </Field>
        <Field label="Abrechnung" error={errors.billingCycle?.message}>
          <select className="input" {...register("billingCycle")}>
            {BILLING_CYCLES.map((b) => (
              <option key={b} value={b}>
                {de.billingCycle(b)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Plätze" error={errors.seats?.message}>
          <input className="input" type="number" {...register("seats")} />
        </Field>
        <Field label="Verlängert am" error={errors.renewalDate?.message}>
          <input className="input" type="date" {...register("renewalDate")} />
        </Field>
      </FormSection>

      <FormSection title="Ownership">
        <Field label="Inhaber" error={errors.ownerId?.message}>
          <select className="input" {...register("ownerId")}>
            <option value="">Nicht zugewiesen</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Venture" error={errors.ventureId?.message}>
          <select className="input" {...register("ventureId")}>
            <option value="">Unternehmensweit</option>
            {ventures.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notizen" error={errors.notes?.message} className="md:col-span-2">
          <textarea className="input min-h-[90px]" {...register("notes")} />
        </Field>
      </FormSection>

      <FormActions
        cancelHref="/tools"
        onDelete={isEdit ? handleDelete : undefined}
        pending={pending}
        submitLabel={isEdit ? "Änderungen speichern" : "Werkzeug anlegen"}
      />
    </form>
  );
}
