"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { ventureSchema, type VentureInput } from "@/lib/schemas";
import { VENTURE_KINDS, VENTURE_STATUSES } from "@/lib/utils";
import { slugify } from "@/lib/form";
import { Field, FormActions, FormSection } from "@/components/form-field";
import { createVenture, updateVenture, deleteVenture } from "./actions";

export function VentureForm({ initial }: { initial?: Partial<VentureInput> & { id?: string } }) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<VentureInput>({
    resolver: zodResolver(ventureSchema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      kind: (initial?.kind as VentureInput["kind"]) ?? "studio",
      status: (initial?.status as VentureInput["status"]) ?? "active",
      tagline: initial?.tagline ?? "",
      description: initial?.description ?? "",
      accent: initial?.accent ?? "#caff3d",
      foundedAt: initial?.foundedAt ?? "",
    },
  });

  const onSubmit = (data: VentureInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) await updateVenture(initial.id, data);
      else await createVenture(data);
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (
      !confirm(
        "Delete this venture? Projects, invoices and other records stay intact but become company-wide (unassigned).",
      )
    )
      return;
    startTransition(async () => {
      await deleteVenture(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <FormSection>
        <Field label="Venture name" error={errors.name?.message}>
          <input
            className="input"
            {...register("name", {
              // Auto-fill the slug while creating, but never overwrite on edit.
              onBlur: (e) => {
                if (!isEdit && !getValues("slug")) setValue("slug", slugify(e.target.value));
              },
            })}
          />
        </Field>
        <Field label="Slug" error={errors.slug?.message} hint="Used in URLs and exports">
          <input className="input font-mono text-[13px]" {...register("slug")} />
        </Field>
        <Field label="Kind" error={errors.kind?.message}>
          <select className="input capitalize" {...register("kind")}>
            {VENTURE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select className="input capitalize" {...register("status")}>
            {VENTURE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Founded" error={errors.foundedAt?.message}>
          <input className="input" type="date" {...register("foundedAt")} />
        </Field>
        <Field label="Accent colour" error={errors.accent?.message} hint="Shown as a dot in the venture switcher">
          <input className="input h-10 p-1" type="color" {...register("accent")} />
        </Field>
        <Field label="Tagline" error={errors.tagline?.message} className="md:col-span-2">
          <input className="input" {...register("tagline")} />
        </Field>
        <Field label="Description" error={errors.description?.message} className="md:col-span-2">
          <textarea className="input min-h-[90px]" {...register("description")} />
        </Field>
      </FormSection>

      <FormActions
        cancelHref="/ventures"
        onDelete={isEdit ? handleDelete : undefined}
        pending={pending}
        submitLabel={isEdit ? "Save changes" : "Create venture"}
      />
    </form>
  );
}
