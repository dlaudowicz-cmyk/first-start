"use client";

import { Trash2, Plus } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { calculateItemNet } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

type LineItemFields = {
  items: Array<{ description: string; quantity: number; unitPrice: number; unit?: string }>;
};

type Props = {
  // We accept any RHF Control/Register because this editor is reused for offers
  // & Rechnungen which have different surrounding fields. Field paths under
  // `items.*` are stable so we cast inside.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
  watchItems: LineItemFields["items"];
};

export function LineItemsEditor({ control, register, errors, watchItems }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Positionen</h3>
        <button
          type="button"
          onClick={() => append({ description: "", quantity: 1, unitPrice: 0, unit: "Stk." })}
          className="btn-secondary text-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Position hinzufügen
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, idx) => {
          const item = watchItems?.[idx];
          const lineNet = item ? calculateItemNet({ quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) }) : 0;
          const itemErrors = (errors?.items as Array<Record<string, { message?: string }>> | undefined)?.[idx];
          return (
            <div key={field.id} className="rounded-lg border border-line-soft p-3 bg-surface-2">
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 md:col-span-6">
                  <label className="label">Leistung</label>
                  <input className="input" placeholder="e.g. Drehtag inkl. Crew" {...register(`items.${idx}.description` as const)} />
                  {itemErrors?.description && (
                    <p className="mt-1 text-xs text-danger">{itemErrors.description.message}</p>
                  )}
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="label">Menge</label>
                  <input className="input text-right" type="number" step="0.01" {...register(`items.${idx}.quantity` as const)} />
                </div>
                <div className="col-span-4 md:col-span-1">
                  <label className="label">Einheit</label>
                  <input className="input" {...register(`items.${idx}.unit` as const)} />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="label">Einzelpreis (€)</label>
                  <input className="input text-right" type="number" step="0.01" {...register(`items.${idx}.unitPrice` as const)} />
                </div>
                <div className="col-span-12 md:col-span-1 md:pt-7 flex md:justify-end">
                  <button type="button" onClick={() => remove(idx)} className="btn-ghost text-danger hover:bg-danger/10" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-right text-xs text-ink-mute tabular-nums">
                Positionssumme: <span className="text-ink font-medium">{formatCurrency(lineNet)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {typeof errors?.items?.message === "string" && (
        <p className="mt-2 text-xs text-danger">{errors.items.message}</p>
      )}
    </div>
  );
}
