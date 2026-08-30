"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import { clientSchema, type ClientInput } from "@/lib/schemas";
import { createClient, updateClient, deleteClient } from "./actions";

type Props = {
  initial?: Partial<ClientInput> & { id?: string };
};

export function ClientForm({ initial }: Props) {
  const isEdit = Boolean(initial?.id);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: initial?.companyName ?? "",
      contactPerson: initial?.contactPerson ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      address: initial?.address ?? "",
      vatId: initial?.vatId ?? "",
      notes: initial?.notes ?? "",
    },
  });

  const onSubmit = (data: ClientInput) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v ?? ""));
    startTransition(async () => {
      if (isEdit && initial?.id) {
        await updateClient(initial.id, fd);
      } else {
        await createClient(fd);
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Delete this client and all associated projects? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteClient(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Company name" error={errors.companyName?.message}>
          <input className="input" {...register("companyName")} />
        </Field>
        <Field label="Contact person" error={errors.contactPerson?.message}>
          <input className="input" {...register("contactPerson")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input className="input" type="email" {...register("email")} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input className="input" {...register("phone")} />
        </Field>
        <Field label="VAT ID" error={errors.vatId?.message}>
          <input className="input" {...register("vatId")} />
        </Field>
      </div>

      <Field label="Address" error={errors.address?.message}>
        <textarea className="input min-h-[80px]" {...register("address")} />
      </Field>

      <Field label="Notes" error={errors.notes?.message}>
        <textarea className="input min-h-[100px]" {...register("notes")} />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Link href="/clients" className="btn-secondary">
            Cancel
          </Link>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="btn-danger" disabled={pending}>
              Delete
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create client"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
