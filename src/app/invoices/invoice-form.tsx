"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { invoiceSchema, type InvoiceInput } from "@/lib/schemas";
import { INVOICE_STATUSES } from "@/lib/utils";
import { calculateTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import { LineItemsEditor } from "@/components/line-items-editor";
import { createInvoice, updateInvoice, deleteInvoice } from "./actions";

type Props = {
  initial?: Partial<InvoiceInput> & { id?: string };
  clients: { id: string; companyName: string }[];
  projects: { id: string; title: string; clientId: string }[];
  defaultVatRate: number;
};

export function InvoiceForm({ initial, clients, projects, defaultVatRate }: Props) {
  const isEdit = Boolean(initial?.id);
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: initial?.clientId ?? clients[0]?.id ?? "",
      projectId: initial?.projectId ?? "",
      date: initial?.date ?? new Date().toISOString().slice(0, 10),
      dueDate: initial?.dueDate ?? new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      paymentTerms: initial?.paymentTerms ?? "Zahlbar innerhalb 14 Tagen ohne Abzug.",
      notes: initial?.notes ?? "",
      vatRate: initial?.vatRate ?? defaultVatRate,
      status: (initial?.status as InvoiceInput["status"]) ?? "draft",
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

  const onSubmit = (data: InvoiceInput) => {
    startTransition(async () => {
      if (isEdit && initial?.id) {
        await updateInvoice(initial.id, data);
      } else {
        await createInvoice(data);
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    if (!confirm("Delete this invoice?")) return;
    startTransition(async () => {
      await deleteInvoice(initial.id!);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
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
        <Field label="Project (optional)" error={errors.projectId?.message}>
          <select className="input" {...register("projectId")}>
            <option value="">—</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Invoice date" error={errors.date?.message}>
          <input className="input" type="date" {...register("date")} />
        </Field>
        <Field label="Due date" error={errors.dueDate?.message}>
          <input className="input" type="date" {...register("dueDate")} />
        </Field>
        <Field label="VAT rate (%)" error={errors.vatRate?.message}>
          <input className="input" type="number" step="0.01" {...register("vatRate")} />
        </Field>
        <Field label="Payment status" error={errors.status?.message}>
          <select className="input capitalize" {...register("status")}>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
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
              <span className="text-graphite-500">Net</span>
              <span className="tabular-nums">{formatCurrency(totals.net)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graphite-500">VAT {watched.vatRate || 0}%</span>
              <span className="tabular-nums">{formatCurrency(totals.vat)}</span>
            </div>
            <div className="flex justify-between border-t border-graphite-200 pt-1.5 mt-1.5 font-semibold text-base">
              <span>Gross</span>
              <span className="tabular-nums">{formatCurrency(totals.gross)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 grid grid-cols-1 gap-5">
        <Field label="Payment terms" error={errors.paymentTerms?.message}>
          <input className="input" {...register("paymentTerms")} />
        </Field>
        <Field label="Notes" error={errors.notes?.message}>
          <textarea className="input min-h-[80px]" {...register("notes")} />
        </Field>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/invoices" className="btn-secondary">
            Cancel
          </Link>
          {isEdit && (
            <button type="button" onClick={handleDelete} className="btn-danger" disabled={pending}>
              Delete
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create invoice"}
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
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
