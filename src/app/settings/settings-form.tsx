"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useTransition } from "react";
import { settingsSchema, type SettingsInput } from "@/lib/schemas";
import { updateSettings, uploadLogo } from "./actions";

type Props = {
  initial: SettingsInput;
  logoPath: string | null;
};

export function SettingsForm({ initial, logoPath }: Props) {
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial,
  });

  const onSubmit = (data: SettingsInput) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v == null ? "" : String(v)));
    startTransition(async () => {
      await updateSettings(fd);
    });
  };

  const onLogoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await uploadLogo(fd);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
        <Section title="Company">
          <Field label="Company name" error={errors.companyName?.message}>
            <input className="input" {...register("companyName")} />
          </Field>
          <Field label="Owner" error={errors.owner?.message}>
            <input className="input" {...register("owner")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input className="input" type="email" {...register("email")} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input className="input" {...register("phone")} />
          </Field>
          <Field label="Website" error={errors.website?.message}>
            <input className="input" {...register("website")} />
          </Field>
          <Field label="Address" full>
            <textarea className="input min-h-[80px]" {...register("address")} />
          </Field>
        </Section>

        <Section title="Tax">
          <Field label="Tax number" error={errors.taxNumber?.message}>
            <input className="input" {...register("taxNumber")} />
          </Field>
          <Field label="VAT ID" error={errors.vatId?.message}>
            <input className="input" {...register("vatId")} />
          </Field>
          <Field label="Default VAT %" error={errors.defaultVatRate?.message}>
            <input className="input" type="number" step="0.01" {...register("defaultVatRate")} />
          </Field>
        </Section>

        <Section title="Banking">
          <Field label="Bank name" error={errors.bankName?.message}>
            <input className="input" {...register("bankName")} />
          </Field>
          <Field label="IBAN" error={errors.iban?.message}>
            <input className="input" {...register("iban")} />
          </Field>
          <Field label="BIC" error={errors.bic?.message}>
            <input className="input" {...register("bic")} />
          </Field>
        </Section>

        <Section title="Numbering">
          <Field label="Invoice prefix" error={errors.invoicePrefix?.message}>
            <input className="input" {...register("invoicePrefix")} />
          </Field>
          <Field label="Next invoice number" error={errors.nextInvoiceNo?.message}>
            <input className="input" type="number" {...register("nextInvoiceNo")} />
          </Field>
          <Field label="Offer prefix" error={errors.offerPrefix?.message}>
            <input className="input" {...register("offerPrefix")} />
          </Field>
          <Field label="Next offer number" error={errors.nextOfferNo?.message}>
            <input className="input" type="number" {...register("nextOfferNo")} />
          </Field>
        </Section>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>

      <aside className="card p-6 h-fit space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-graphite-500">Logo</h3>
        <div className="aspect-square rounded-lg border border-dashed border-graphite-200 bg-graphite-50 flex items-center justify-center overflow-hidden">
          {logoPath ? (
            <Image
              src={logoPath}
              alt="Pushlabs logo"
              width={240}
              height={240}
              className="object-contain max-h-full max-w-full"
              unoptimized
            />
          ) : (
            <span className="text-graphite-400 text-sm">No logo uploaded</span>
          )}
        </div>
        <form onSubmit={onLogoSubmit} className="space-y-3">
          <input type="file" name="logo" accept="image/*" className="text-xs w-full" />
          <button type="submit" className="btn-secondary w-full" disabled={pending}>
            {pending ? "Uploading…" : "Upload logo"}
          </button>
        </form>
        <p className="text-[11px] text-graphite-500">
          Logos are stored locally in <code className="font-mono">public/uploads</code>. PNG, JPG, SVG or WebP.
        </p>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h3 className="text-sm font-medium uppercase tracking-wider text-graphite-500 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
