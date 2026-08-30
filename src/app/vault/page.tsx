import Link from "next/link";
import { Plus, ShieldCheck, RotateCw } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { VentureBadge } from "@/components/venture-badge";
import { getActiveVenture, ventureScope } from "@/lib/venture-context";
import { formatDate, daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** A credential is due when last rotation + interval has passed. */
function rotationDue(rotatedAt: Date | null, rotateEveryDays: number | null): boolean {
  if (!rotatedAt || !rotateEveryDays) return false;
  const due = new Date(rotatedAt.getTime() + rotateEveryDays * 86_400_000);
  const d = daysUntil(due);
  return d != null && d <= 0;
}

export default async function VaultPage() {
  const active = await getActiveVenture();
  const credentials = await prisma.credential.findMany({
    where: ventureScope(active),
    orderBy: [{ criticality: "asc" }, { service: "asc" }],
    include: { owner: true, venture: true },
  });

  const due = credentials.filter((c) => rotationDue(c.rotatedAt, c.rotateEveryDays));

  return (
    <>
      <PageHeader
        title="Zugänge"
        description="Welche Konten, APIs und Zugänge es gibt — und wo das jeweilige Secret liegt."
        actions={
          <Link href="/vault/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Zugang hinzufügen
          </Link>
        }
      />

      <div className="card p-4 mb-6 border-ok/30 bg-ok/10">
        <div className="flex items-start gap-2.5 text-sm">
          <ShieldCheck className="h-4 w-4 text-ok mt-0.5 shrink-0" />
          <p className="text-ink">
            <span className="font-medium">Verweis-Tresor — hier stehen keine Passwörter.</span> This register tracks what
            exists, who owns it and where the secret lives. The secrets themselves stay in your password manager, so a
            copy of this database never exposes company access.
          </p>
        </div>
      </div>

      {due.length > 0 && (
        <div className="card p-4 mb-6 border-warn/30 bg-warn/10">
          <div className="flex items-start gap-2.5 text-sm">
            <RotateCw className="h-4 w-4 text-warn mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-warn">
                {due.length} credential{due.length === 1 ? "" : "s"} due for rotation
              </span>
              <ul className="mt-1 text-ink space-y-0.5">
                {due.map((c) => (
                  <li key={c.id}>
                    <Link href={`/vault/${c.id}`} className="underline hover:no-underline">
                      {c.service}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {credentials.length === 0 ? (
        <EmptyState
          title="Keine Zugänge erfasst"
          description="Zuerst die kritischen Zugänge: E-Mail, Domain, Bank, wichtige APIs."
          action={
            <Link href="/vault/new" className="btn-primary">
              <Plus className="h-4 w-4" /> Zugang hinzufügen
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Dienst</th>
                <th>Kategorie</th>
                <th>Login</th>
                <th>Secret liegt in</th>
                <th>Verantwortlich</th>
                {!active && <th>Venture</th>}
                <th>Rotiert</th>
                <th>Kritikalität</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">
                    <Link href={`/vault/${c.id}`} className="hover:underline">
                      {c.service}
                    </Link>
                  </td>
                  <td className="capitalize text-ink">{c.category}</td>
                  <td className="text-ink-mute text-xs">{c.identifier || "—"}</td>
                  <td className="text-ink text-xs">{c.storageLocation}</td>
                  <td className="text-ink">
                    {c.owner ? (
                      <Link href={`/people/${c.owner.id}`} className="hover:underline">
                        {c.owner.name}
                      </Link>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  {!active && (
                    <td>
                      <VentureBadge name={c.venture?.name} accent={c.venture?.accent} muted />
                    </td>
                  )}
                  <td className="text-xs text-ink-mute">
                    {c.rotatedAt ? formatDate(c.rotatedAt) : "—"}
                    {rotationDue(c.rotatedAt, c.rotateEveryDays) && (
                      <span className="ml-1.5 text-warn font-medium">due</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={c.criticality} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
