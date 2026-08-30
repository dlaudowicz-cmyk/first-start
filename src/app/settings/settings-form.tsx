"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Download } from "lucide-react";
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
        <Section title="Unternehmen">
          <Field label="Firma" error={errors.companyName?.message}>
            <input className="input" {...register("companyName")} />
          </Field>
          <Field label="Inhaber" error={errors.owner?.message}>
            <input className="input" {...register("owner")} />
          </Field>
          <Field label="Claim" error={errors.tagline?.message} full>
            <input className="input" placeholder="We make brands move" {...register("tagline")} />
          </Field>
          <Field label="E-Mail" error={errors.email?.message}>
            <input className="input" type="email" {...register("email")} />
          </Field>
          <Field label="Telefon" error={errors.phone?.message}>
            <input className="input" {...register("phone")} />
          </Field>
          <Field label="Website" error={errors.website?.message}>
            <input className="input" {...register("website")} />
          </Field>
          <Field label="Anschrift" full>
            <textarea className="input min-h-[80px]" {...register("address")} />
          </Field>
        </Section>

        <Section title="Steuer">
          <Field label="Steuernummer" error={errors.taxNumber?.message}>
            <input className="input" {...register("taxNumber")} />
          </Field>
          <Field label="USt-IdNr." error={errors.vatId?.message}>
            <input className="input" {...register("vatId")} />
          </Field>
          <Field label="USt-Satz %" error={errors.defaultVatRate?.message}>
            <input className="input" type="number" step="0.01" {...register("defaultVatRate")} />
          </Field>
        </Section>

        <Section title="Bankverbindung">
          <Field label="Bank" error={errors.bankName?.message}>
            <input className="input" {...register("bankName")} />
          </Field>
          <Field label="IBAN" error={errors.iban?.message}>
            <input className="input" {...register("iban")} />
          </Field>
          <Field label="BIC" error={errors.bic?.message}>
            <input className="input" {...register("bic")} />
          </Field>
        </Section>

        <Section title="Nummernkreise">
          <Field label="Rechnungs-Präfix" error={errors.invoicePrefix?.message}>
            <input className="input" {...register("invoicePrefix")} />
          </Field>
          <Field label="Nächste Rechnungsnr." error={errors.nextInvoiceNo?.message}>
            <input className="input" type="number" {...register("nextInvoiceNo")} />
          </Field>
          <Field label="Angebots-Präfix" error={errors.offerPrefix?.message}>
            <input className="input" {...register("offerPrefix")} />
          </Field>
          <Field label="Nächste Angebotsnr." error={errors.nextOfferNo?.message}>
            <input className="input" type="number" {...register("nextOfferNo")} />
          </Field>
        </Section>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Speichere…" : "Einstellungen speichern"}
          </button>
        </div>
      </form>

      <aside className="card p-6 h-fit space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Logo</h3>
        <div className="aspect-square rounded-lg border border-dashed border-line bg-surface-2 flex items-center justify-center overflow-hidden">
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
            <span className="text-ink-faint text-sm">Kein Logo hinterlegt</span>
          )}
        </div>
        <form onSubmit={onLogoSubmit} className="space-y-3">
          <input type="file" name="logo" accept="image/*" className="text-xs w-full text-ink-mute file:mr-3 file:rounded-md file:border-0 file:bg-surface-3 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-line file:cursor-pointer" />
          <button type="submit" className="btn-secondary w-full" disabled={pending}>
            {pending ? "Lade hoch…" : "Logo hochladen"}
          </button>
        </form>
        <p className="text-[11px] text-ink-mute">
          Logos liegen lokal in <code className="font-mono">public/uploads</code>. PNG, JPG, SVG oder WebP.
        </p>
      </aside>

      <aside className="card p-6 h-fit space-y-3 lg:col-start-3">
        <h3 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Sicherung</h3>
        <p className="text-xs text-ink-mute">
          Alle Firmendaten liegen in einer einzigen Datei auf diesem Rechner. Ohne Sicherung sind sie
          weg, wenn der Rechner ausfällt.
        </p>
        <a href="/backup" className="btn-primary w-full">
          <Download className="h-4 w-4" /> Sicherung herunterladen
        </a>
        <p className="text-[11px] text-ink-faint">
          ZIP mit Datenbank und allen Projektdateien. Enthält Kundendaten und Bankverbindung im
          Klartext — an einen Ort legen, den du kontrollierst.
        </p>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h3 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-4">{title}</h3>
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
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
