"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { personSchema, type PersonInput } from "@/lib/schemas";
import { de } from "@/lib/labels";
import { PERSON_STATUSES, PERSON_TYPES } from "@/lib/utils";
import { Field, FormActions, FormSection } from "@/components/form-field";
import { createPerson, updatePerson, deletePerson } from "./actions";

export function PersonForm({ initial }: { initial?: Partial<PersonInput> & { id?: string } }) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: initial?.name ?? "",
      type: (initial?.type as PersonInput["type"]) ?? "freelancer",
      status: (initial?.status as PersonInput["status"]) ?? "active",
      role: initial?.role ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      location: initial?.location ?? "",
      dayRate: initial?.dayRate,
      skills: initial?.skills ?? "",
      notes: initial?.notes ?? "",
    },
  });

  const onSubmit = (data: PersonInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) await updatePerson(initial.id, data);
      else await createPerson(data);
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Person entfernen? Zugeordnete Einträge bleiben bestehen, verlieren aber die Zuordnung.")) return;
    startTransition(async () => {
      await deletePerson(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <FormSection>
        <Field label="Name" error={errors.name?.message}>
          <input className="input" {...register("name")} />
        </Field>
        <Field label="Rolle" error={errors.role?.message} hint="e.g. DOP, Editor, Executive Producer">
          <input className="input" {...register("role")} />
        </Field>
        <Field label="Art" error={errors.type?.message}>
          <select className="input" {...register("type")}>
            {PERSON_TYPES.map((t) => (
              <option key={t} value={t}>
                {de.personType(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select className="input" {...register("status")}>
            {PERSON_STATUSES.map((s) => (
              <option key={s} value={s}>
                {de.personStatus(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="E-Mail" error={errors.email?.message}>
          <input className="input" type="email" {...register("email")} />
        </Field>
        <Field label="Telefon" error={errors.phone?.message}>
          <input className="input" {...register("phone")} />
        </Field>
        <Field label="Drehort" error={errors.location?.message}>
          <input className="input" {...register("location")} />
        </Field>
        <Field label="Tagessatz (€)" error={errors.dayRate?.message}>
          <input className="input" type="number" step="0.01" {...register("dayRate")} />
        </Field>
        <Field label="Fähigkeiten" error={errors.skills?.message} className="md:col-span-2" hint="Komma-getrennt">
          <input className="input" {...register("skills")} />
        </Field>
        <Field label="Notizen" error={errors.notes?.message} className="md:col-span-2">
          <textarea className="input min-h-[90px]" {...register("notes")} />
        </Field>
      </FormSection>

      <FormActions
        cancelHref="/people"
        onDelete={isEdit ? handleDelete : undefined}
        pending={pending}
        submitLabel={isEdit ? "Änderungen speichern" : "Person anlegen"}
        deleteLabel="Entfernen"
      />
    </form>
  );
}
