"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { projectSchema, type ProjectInput } from "@/lib/schemas";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/utils";
import { PIPELINES } from "@/lib/pipelines";
import { createProject, updateProject, deleteProject } from "./actions";

type Props = {
  initial?: Partial<ProjectInput> & { id?: string };
  clients: { id: string; companyName: string }[];
  ventures: { id: string; name: string }[];
};

export function ProjectForm({ initial, clients, ventures }: Props) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initial?.title ?? "",
      clientId: initial?.clientId ?? clients[0]?.id ?? "",
      type: (initial?.type as ProjectInput["type"]) ?? "image film",
      status: (initial?.status as ProjectInput["status"]) ?? "lead",
      shootStart: initial?.shootStart ?? "",
      shootEnd: initial?.shootEnd ?? "",
      location: initial?.location ?? "",
      budget: initial?.budget ?? undefined,
      notes: initial?.notes ?? "",
      ventureId: initial?.ventureId ?? "",
      pipelineKey: initial?.pipelineKey ?? "",
    },
  });

  const onSubmit = (data: ProjectInput) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v == null ? "" : String(v)));
    startTransition(async () => {
      if (isEdit && initial?.id) {
        await updateProject(initial.id, fd);
      } else {
        await createProject(fd);
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Delete this project? Offers, invoices and expenses linked to it will be unlinked.")) return;
    startTransition(async () => {
      await deleteProject(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Project title" error={errors.title?.message} className="md:col-span-2">
          <input className="input" {...register("title")} />
        </Field>

        <Field label="Client" error={errors.clientId?.message}>
          <select className="input" {...register("clientId")}>
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Type" error={errors.type?.message}>
          <select className="input capitalize" {...register("type")}>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Venture" error={errors.ventureId?.message}>
          <select className="input" {...register("ventureId")}>
            <option value="">Unassigned</option>
            {ventures.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status" error={errors.status?.message}>
          <select className="input capitalize" {...register("status")}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Budget (€)" error={errors.budget?.message}>
          <input className="input" type="number" step="0.01" {...register("budget")} />
        </Field>

        <Field label="Shoot start" error={errors.shootStart?.message}>
          <input className="input" type="date" {...register("shootStart")} />
        </Field>

        <Field label="Shoot end" error={errors.shootEnd?.message}>
          <input className="input" type="date" {...register("shootEnd")} />
        </Field>

        <Field
          label="Pipeline"
          error={errors.pipelineKey?.message}
          className="md:col-span-2"
        >
          <select className="input" {...register("pipelineKey")}>
            <option value="">Keine Pipeline zugewiesen</option>
            {PIPELINES.map((pl) => (
              <option key={pl.key} value={pl.key}>
                {pl.name} {pl.version} — {pl.author}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location" error={errors.location?.message} className="md:col-span-2">
          <input className="input" {...register("location")} />
        </Field>
      </div>

      <Field label="Notes" error={errors.notes?.message}>
        <textarea className="input min-h-[100px]" {...register("notes")} />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Link href="/projects" className="btn-secondary">
            Cancel
          </Link>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="btn-danger" disabled={pending}>
              Delete
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
