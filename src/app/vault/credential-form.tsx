"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { credentialSchema, type CredentialInput } from "@/lib/schemas";
import { CREDENTIAL_CATEGORIES, CRITICALITY_LEVELS } from "@/lib/utils";
import { Field, FormActions, FormSection } from "@/components/form-field";
import { createCredential, updateCredential, deleteCredential } from "./actions";

type Option = { id: string; label: string };

export function CredentialForm({
  initial,
  ventures,
  people,
}: {
  initial?: Partial<CredentialInput> & { id?: string };
  ventures: Option[];
  people: Option[];
}) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialInput>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      service: initial?.service ?? "",
      category: (initial?.category as CredentialInput["category"]) ?? "account",
      criticality: (initial?.criticality as CredentialInput["criticality"]) ?? "normal",
      url: initial?.url ?? "",
      identifier: initial?.identifier ?? "",
      storageLocation: initial?.storageLocation ?? "1Password",
      vaultRef: initial?.vaultRef ?? "",
      mfaLocation: initial?.mfaLocation ?? "",
      sharedWith: initial?.sharedWith ?? "",
      rotatedAt: initial?.rotatedAt ?? "",
      rotateEveryDays: initial?.rotateEveryDays,
      notes: initial?.notes ?? "",
      ownerId: initial?.ownerId ?? "",
      ventureId: initial?.ventureId ?? "",
    },
  });

  const onSubmit = (data: CredentialInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) await updateCredential(initial.id, data);
      else await createCredential(data);
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Delete this vault entry? This only removes the reference, not the actual credential.")) return;
    startTransition(async () => {
      await deleteCredential(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="card p-4 border-ok/30 bg-ok/10">
        <div className="flex items-start gap-2.5 text-sm">
          <ShieldCheck className="h-4 w-4 text-ok mt-0.5 shrink-0" />
          <p className="text-ink">
            <span className="font-medium">No secrets are stored here.</span> This form has no password or key field by
            design. Record <em>where</em> the credential lives so the team can find it — the actual secret stays in
            your password manager.
          </p>
        </div>
      </div>

      <FormSection>
        <Field label="Service" error={errors.service?.message} hint="e.g. Google Workspace, Anthropic API">
          <input className="input" {...register("service")} />
        </Field>
        <Field label="Login / identifier" error={errors.identifier?.message} hint="Username or email — not the password">
          <input className="input" {...register("identifier")} />
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <select className="input capitalize" {...register("category")}>
            {CREDENTIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Criticality" error={errors.criticality?.message}>
          <select className="input capitalize" {...register("criticality")}>
            {CRITICALITY_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="URL" error={errors.url?.message} className="md:col-span-2">
          <input className="input" {...register("url")} />
        </Field>
      </FormSection>

      <FormSection title="Where the secret lives">
        <Field label="Storage location" error={errors.storageLocation?.message} hint="e.g. 1Password, Bitwarden, bank app">
          <input className="input" {...register("storageLocation")} />
        </Field>
        <Field label="Vault path" error={errors.vaultRef?.message} hint="e.g. 1Password → Pushlabs → Google">
          <input className="input" {...register("vaultRef")} />
        </Field>
        <Field label="Where 2FA lives" error={errors.mfaLocation?.message}>
          <input className="input" {...register("mfaLocation")} />
        </Field>
        <Field label="Shared with" error={errors.sharedWith?.message} hint="Who has access today">
          <input className="input" {...register("sharedWith")} />
        </Field>
      </FormSection>

      <FormSection title="Rotation & ownership">
        <Field label="Last rotated" error={errors.rotatedAt?.message}>
          <input className="input" type="date" {...register("rotatedAt")} />
        </Field>
        <Field label="Rotate every (days)" error={errors.rotateEveryDays?.message}>
          <input className="input" type="number" {...register("rotateEveryDays")} />
        </Field>
        <Field label="Owner" error={errors.ownerId?.message}>
          <select className="input" {...register("ownerId")}>
            <option value="">Unassigned</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Venture" error={errors.ventureId?.message}>
          <select className="input" {...register("ventureId")}>
            <option value="">Company-wide</option>
            {ventures.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes" error={errors.notes?.message} className="md:col-span-2">
          <textarea className="input min-h-[90px]" {...register("notes")} />
        </Field>
      </FormSection>

      <FormActions
        cancelHref="/vault"
        onDelete={isEdit ? handleDelete : undefined}
        pending={pending}
        submitLabel={isEdit ? "Save changes" : "Add vault entry"}
      />
    </form>
  );
}
