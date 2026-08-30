import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MembershipEditor } from "./membership-editor";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, ventures] = await Promise.all([
    prisma.person.findUnique({
      where: { id },
      include: {
        memberships: { include: { venture: true } },
        ownedCredentials: { orderBy: { service: "asc" } },
        ownedTools: { orderBy: { name: "asc" } },
        tasks: { where: { status: { not: "done" } }, orderBy: { createdAt: "asc" } },
        contracts: true,
      },
    }),
    prisma.venture.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!person) notFound();

  return (
    <>
      <PageHeader
        title={person.name}
        description={person.role ?? undefined}
        actions={
          <Link href={`/people/${person.id}/edit`} className="btn-primary">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Details</h2>
            <StatusBadge status={person.status} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Type" value={person.type} />
            <Row label="Email" value={person.email} />
            <Row label="Phone" value={person.phone} />
            <Row label="Location" value={person.location} />
            <Row label="Day rate" value={person.dayRate != null ? formatCurrency(person.dayRate) : null} />
            <Row label="Skills" value={person.skills} />
            {person.notes && <Row label="Notes" value={person.notes} multiline />}
          </dl>
        </section>

        <section className="card p-5">
          <MembershipEditor
            personId={person.id}
            ventures={ventures}
            memberships={person.memberships.map((m) => ({
              id: m.id,
              role: m.role,
              allocation: m.allocation,
              ventureName: m.venture.name,
              ventureAccent: m.venture.accent,
            }))}
          />
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Open tasks</h2>
          {person.tasks.length === 0 ? (
            <p className="text-sm text-ink-mute">Nothing assigned.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {person.tasks.map((t) => (
                <li key={t.id} className="py-2.5">
                  <Link href={`/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                    {t.title}
                  </Link>
                  <div className="text-xs text-ink-mute">
                    {t.status}
                    {t.dueDate ? ` · due ${formatDate(t.dueDate)}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">
            Owned accesses &amp; tools
          </h2>
          {person.ownedCredentials.length === 0 && person.ownedTools.length === 0 ? (
            <p className="text-sm text-ink-mute">Nothing owned.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-faint mb-1.5">Vault entries</div>
                <ul className="divide-y divide-line-soft">
                  {person.ownedCredentials.map((c) => (
                    <li key={c.id} className="py-2 text-sm">
                      <Link href={`/vault/${c.id}`} className="hover:underline">
                        {c.service}
                      </Link>
                    </li>
                  ))}
                  {person.ownedCredentials.length === 0 && <li className="py-2 text-sm text-ink-faint">—</li>}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-faint mb-1.5">Subscriptions</div>
                <ul className="divide-y divide-line-soft">
                  {person.ownedTools.map((t) => (
                    <li key={t.id} className="py-2 text-sm">
                      <Link href={`/tools/${t.id}`} className="hover:underline">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                  {person.ownedTools.length === 0 && <li className="py-2 text-sm text-ink-faint">—</li>}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Contracts</h2>
          {person.contracts.length === 0 ? (
            <p className="text-sm text-ink-mute">No contracts.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {person.contracts.map((c) => (
                <li key={c.id} className="py-2.5">
                  <Link href={`/contracts/${c.id}`} className="text-sm font-medium hover:underline">
                    {c.title}
                  </Link>
                  <div className="text-xs text-ink-mute capitalize">
                    {c.type} · {c.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Row({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-ink-mute col-span-1">{label}</dt>
      <dd className={`col-span-2 ${multiline ? "whitespace-pre-line" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
