"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { formatCurrency } from "@/lib/utils";
import { deleteExpense } from "./actions";

type Row = {
  id: string;
  date: string;
  project: string;
  people: number;
  overnight: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  total: number;
  notes: string | null;
};

export function ExpensesList({ rows }: { rows: Row[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="card overflow-hidden">
      <table className="table-base">
        <thead>
          <tr>
            <th>Date</th>
            <th>Project</th>
            <th className="text-right">People</th>
            <th>Meals</th>
            <th className="text-right">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td className="text-ink truncate max-w-[260px]">{r.project}</td>
              <td className="text-right tabular-nums">{r.people}</td>
              <td className="text-ink-mute text-xs">
                {r.overnight && "ÜN "}
                {r.breakfast && "F "}
                {r.lunch && "M "}
                {r.dinner && "A"}
                {!r.overnight && !r.breakfast && !r.lunch && !r.dinner && "—"}
              </td>
              <td className="text-right tabular-nums font-medium">{formatCurrency(r.total)}</td>
              <td className="text-right">
                <button
                  className="btn-ghost text-danger hover:bg-danger/10"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Delete this expense?")) return;
                    start(async () => {
                      await deleteExpense(r.id);
                    });
                  }}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
