"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { taskSchema, type TaskInput } from "@/lib/schemas";
import { de } from "@/lib/labels";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils";
import { Field, FormActions, FormSection } from "@/components/form-field";
import { createTask, updateTask, deleteTask } from "./actions";

type Option = { id: string; label: string };

export function TaskForm({
  initial,
  ventures,
  people,
  projects,
}: {
  initial?: Partial<TaskInput> & { id?: string };
  ventures: Option[];
  people: Option[];
  projects: Option[];
}) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initial?.title ?? "",
      detail: initial?.detail ?? "",
      status: (initial?.status as TaskInput["status"]) ?? "open",
      priority: (initial?.priority as TaskInput["priority"]) ?? "normal",
      dueDate: initial?.dueDate ?? "",
      source: initial?.source ?? "",
      assigneeId: initial?.assigneeId ?? "",
      assigneeLabel: initial?.assigneeLabel ?? "",
      ventureId: initial?.ventureId ?? "",
      projectId: initial?.projectId ?? "",
    },
  });

  const onSubmit = (data: TaskInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) await updateTask(initial.id, data);
      else await createTask(data);
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Aufgabe löschen?")) return;
    startTransition(async () => {
      await deleteTask(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <FormSection>
        <Field label="Titel" error={errors.title?.message} className="md:col-span-2">
          <input className="input" {...register("title")} />
        </Field>
        <Field label="Details" error={errors.detail?.message} className="md:col-span-2">
          <textarea className="input min-h-[100px]" {...register("detail")} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select className="input" {...register("status")}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {de.taskStatus(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priorität" error={errors.priority?.message}>
          <select className="input" {...register("priority")}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {de.taskPriority(p)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fällig am" error={errors.dueDate?.message}>
          <input className="input" type="date" {...register("dueDate")} />
        </Field>
        <Field label="Herkunft" error={errors.source?.message} hint="e.g. the meeting this came from">
          <input className="input" {...register("source")} />
        </Field>
      </FormSection>

      <FormSection title="Assignment">
        <Field label="Zuständig" error={errors.assigneeId?.message}>
          <select className="input" {...register("assigneeId")}>
            <option value="">Nicht zugewiesen</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Zuständig (frei)"
          error={errors.assigneeLabel?.message}
          hint='For groups or externals, e.g. "Die Gruppe"'
        >
          <input className="input" {...register("assigneeLabel")} />
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
        <Field label="Projekt" error={errors.projectId?.message}>
          <select className="input" {...register("projectId")}>
            <option value="">—</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

      <FormActions
        cancelHref="/tasks"
        onDelete={isEdit ? handleDelete : undefined}
        pending={pending}
        submitLabel={isEdit ? "Änderungen speichern" : "Aufgabe anlegen"}
      />
    </form>
  );
}
