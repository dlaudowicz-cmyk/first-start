"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { contractSchema, type ContractInput } from "@/lib/schemas";
import { de } from "@/lib/labels";
import { CONTRACT_STATUSES, CONTRACT_TYPES } from "@/lib/utils";
import { Field, FormActions, FormSection } from "@/components/form-field";
import { createContract, updateContract, deleteContract } from "./actions";

type Option = { id: string; label: string };

export function ContractForm({
  initial,
  ventures,
  clients,
  people,
}: {
  initial?: Partial<ContractInput> & { id?: string };
  ventures: Option[];
  clients: Option[];
  people: Option[];
}) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractInput>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: initial?.title ?? "",
      type: (initial?.type as ContractInput["type"]) ?? "client",
      status: (initial?.status as ContractInput["status"]) ?? "draft",
      counterparty: initial?.counterparty ?? "",
      signedAt: initial?.signedAt ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      noticePeriodDays: initial?.noticePeriodDays,
      value: initial?.value,
      notes: initial?.notes ?? "",
      ventureId: initial?.ventureId ?? "",
      clientId: initial?.clientId ?? "",
      personId: initial?.personId ?? "",
    },
  });

  const onSubmit = (data: ContractInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) await updateContract(initial.id, data);
      else await createContract(data);
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Vertragseintrag löschen?")) return;
    startTransition(async () => {
      await deleteContract(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <FormSection>
        <Field label="Titel" error={errors.title?.message} className="md:col-span-2">
          <input className="input" {...register("title")} />
        </Field>
        <Field label="Vertragspartner" error={errors.counterparty?.message}>
          <input className="input" {...register("counterparty")} />
        </Field>
        <Field label="Art" error={errors.type?.message}>
          <select className="input" {...register("type")}>
            {CONTRACT_TYPES.map((t) => (
              <option key={t} value={t}>
                {de.contractType(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select className="input" {...register("status")}>
            {CONTRACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {de.contractStatus(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Wert (€)" error={errors.value?.message}>
          <input className="input" type="number" step="0.01" {...register("value")} />
        </Field>
      </FormSection>

      <FormSection title="Termine">
        <Field label="Unterschrieben" error={errors.signedAt?.message}>
          <input className="input" type="date" {...register("signedAt")} />
        </Field>
        <Field label="Kündigungsfrist (Tage)" error={errors.noticePeriodDays?.message}>
          <input className="input" type="number" {...register("noticePeriodDays")} />
        </Field>
        <Field label="Beginn" error={errors.startDate?.message}>
          <input className="input" type="date" {...register("startDate")} />
        </Field>
        <Field label="Ende" error={errors.endDate?.message} hint="Für die Ablaufwarnung in der Liste">
          <input className="input" type="date" {...register("endDate")} />
        </Field>
      </FormSection>

      <FormSection title="Verknüpfungen" description="Attach the contract to a venture and the other party.">
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
        <Field label="Kunde" error={errors.clientId?.message}>
          <select className="input" {...register("clientId")}>
            <option value="">—</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Person" error={errors.personId?.message}>
          <select className="input" {...register("personId")}>
            <option value="">—</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notizen" error={errors.notes?.message} className="md:col-span-2">
          <textarea className="input min-h-[90px]" {...register("notes")} />
        </Field>
      </FormSection>

      <FormActions
        cancelHref="/contracts"
        onDelete={isEdit ? handleDelete : undefined}
        pending={pending}
        submitLabel={isEdit ? "Änderungen speichern" : "Vertrag anlegen"}
      />
    </form>
  );
}
