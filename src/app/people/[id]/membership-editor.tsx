"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addVentureMember, removeVentureMember } from "@/app/ventures/actions";

type Membership = { id: string; role: string; allocation: number | null; ventureName: string; ventureAccent: string | null };
type VentureOption = { id: string; name: string };

export function MembershipEditor({
  personId,
  memberships,
  ventures,
}: {
  personId: string;
  memberships: Membership[];
  ventures: VentureOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [ventureId, setVentureId] = useState("");
  const [role, setRole] = useState("");
  const [allocation, setAllocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!ventureId || !role.trim()) {
      setError("Pick a venture and enter a role.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await addVentureMember({
        personId,
        ventureId,
        role: role.trim(),
        allocation: allocation === "" ? undefined : Number(allocation),
      });
      setAdding(false);
      setVentureId("");
      setRole("");
      setAllocation("");
    });
  };

  const unassigned = ventures.filter((v) => !memberships.some((m) => m.ventureName === v.name));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-graphite-500">Venture assignments</h2>
        {!adding && unassigned.length > 0 && (
          <button type="button" onClick={() => setAdding(true)} className="btn-secondary text-xs">
            <Plus className="h-3.5 w-3.5" /> Assign
          </button>
        )}
      </div>

      {memberships.length === 0 && !adding && (
        <p className="text-sm text-graphite-500">Not assigned to any venture yet.</p>
      )}

      <ul className="divide-y divide-graphite-100">
        {memberships.map((m) => (
          <li key={m.id} className="py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: m.ventureAccent ?? "#caff3d" }}
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{m.ventureName}</div>
                <div className="text-xs text-graphite-500 truncate">
                  {m.role}
                  {m.allocation != null ? ` · ${m.allocation}%` : ""}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-ghost text-red-600 hover:bg-red-50 shrink-0"
              disabled={pending}
              onClick={() => {
                if (!confirm(`Remove from ${m.ventureName}?`)) return;
                startTransition(async () => {
                  await removeVentureMember(m.id);
                });
              }}
              aria-label={`Remove from ${m.ventureName}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <div className="mt-3 rounded-lg border border-graphite-100 bg-graphite-50/40 p-3 space-y-3">
          <div>
            <label className="label">Venture</label>
            <select className="input" value={ventureId} onChange={(e) => setVentureId(e.target.value)}>
              <option value="">Select…</option>
              {unassigned.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="label">Role</label>
              <input className="input" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div>
              <label className="label">Alloc %</label>
              <input
                className="input text-right"
                type="number"
                min={0}
                max={100}
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary text-xs" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary text-xs" onClick={submit} disabled={pending}>
              {pending ? "Saving…" : "Assign"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
