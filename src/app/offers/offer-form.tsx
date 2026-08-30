"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { offerSchema, type OfferInput } from "@/lib/schemas";
import { de } from "@/lib/labels";
import { OFFER_STATUSES } from "@/lib/utils";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { LineItemsEditor } from "@/components/line-items-editor";
import { createOffer, updateOffer, deleteOffer } from "./actions";

type Props = {
  initial?: Partial<OfferInput> & { id?: string };
  clients: { id: string; companyName: string }[];
  projects: { id: string; title: string; clientId: string }[];
  defaultVatRate: number;
};

export function OfferForm({ initial, clients, projects, defaultVatRate }: Props) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OfferInput>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      clientId: initial?.clientId ?? clients[0]?.id ?? "",
      projectId: initial?.projectId ?? "",
      date: initial?.date ?? new Date().toISOString().slice(0, 10),
      validUntil: initial?.validUntil ?? "",
      paymentTerms: initial?.paymentTerms ?? "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      notes: initial?.notes ?? "",
      vatRate: initial?.vatRate ?? defaultVatRate,
      status: (initial?.status as OfferInput["status"]) ?? "draft",
      items:
        initial?.items && initial.items.length > 0
          ? initial.items
          : [{ description: "", quantity: 1, unitPrice: 0, unit: "Stk." }],
    },
  });

  const watched = watch();
  const totals = calculateTotals(
    (watched.items || []).map((i) => ({
      description: i.description || "",
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unitPrice) || 0,
    })),
    Number(watched.vatRate) || 0,
  );

  const filteredProjects = projects.filter((p) => !watched.clientId || p.clientId === watched.clientId);

  const onSubmit = (data: OfferInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) {
        await updateOffer(initial.id, data);
      } else {
        await createOffer(data);
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Angebot löschen?")) return;
    startTransition(async () => {
      await deleteOffer(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Kunde" error={errors.clientId?.message}>
          <select className="input" {...register("clientId")}>
            <option value="">Kunde wählen…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Projekt (optional)" error={errors.projectId?.message}>
          <select className="input" {...register("projectId")}>
            <option value="">—</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Datum" error={errors.date?.message}>
          <input className="input" type="date" {...register("date")} />
        </Field>
        <Field label="Gültig bis" error={errors.validUntil?.message}>
          <input className="input" type="date" {...register("validUntil")} />
        </Field>
        <Field label="USt-Satz (%)" error={errors.vatRate?.message}>
          <input className="input" type="number" step="0.01" {...register("vatRate")} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select className="input" {...register("status")}>
            {OFFER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {de.offerStatus(s)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="card p-6">
        <LineItemsEditor control={control} register={register} errors={errors} watchItems={watched.items} />

        <div className="mt-6 flex justify-end">
          <div className="w-72 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-mute">Netto</span>
              <span className="tabular-nums">{formatCurrency(totals.net)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-mute">MwSt {watched.vatRate || 0}%</span>
              <span className="tabular-nums">{formatCurrency(totals.vat)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5 mt-1.5 font-semibold text-base">
              <span>Brutto</span>
              <span className="tabular-nums">{formatCurrency(totals.gross)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 grid grid-cols-1 gap-5">
        <Field label="Zahlungsbedingungen" error={errors.paymentTerms?.message}>
          <input className="input" {...register("paymentTerms")} />
        </Field>
        <Field label="Notizen" error={errors.notes?.message}>
          <textarea className="input min-h-[80px]" {...register("notes")} />
        </Field>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/offers" className="btn-secondary">
            Abbrechen
          </Link>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="btn-danger" disabled={pending}>
              Löschen
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Speichere…" : isEdit ? "Änderungen speichern" : "Angebot anlegen"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
