import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, RotateCw, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { markRotated } from "../actions";

export const dynamic = "force-dynamic";

export default async function CredentialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const credential = await prisma.credential.findUnique({
    where: { id },
    include: { owner: true, venture: true },
  });
  if (!credential) notFound();

  const nextRotation =
    credential.rotatedAt && credential.rotateEveryDays
      ? new Date(credential.rotatedAt.getTime() + credential.rotateEveryDays * 86_400_000)
      : null;

  async function handleRotate() {
    "use server";
    await markRotated(id);
  }

  return (
    <>
      <PageHeader
        title={credential.service}
        description={credential.identifier ?? undefined}
        actions={
          <>
            {credential.url && (
              <a href={credential.url} target="_blank" rel="noreferrer" className="btn-secondary">
                <ExternalLink className="h-4 w-4" /> Öffnen
              </a>
            )}
            <form action={handleRotate}>
              <button type="submit" className="btn-secondary">
                <RotateCw className="h-4 w-4" /> Heute rotiert
              </button>
            </form>
            <Link href={`/vault/${credential.id}/edit`} className="btn-primary">
              <Pencil className="h-4 w-4" /> Bearbeiten
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute">Zugangsdaten</h2>
            <StatusBadge status={credential.criticality} />
          </div>
          <dl className="text-sm space-y-2">
            <Row label="Kategorie" value={credential.category} />
            <Row label="Login" value={credential.identifier} />
            <Row label="URL" value={credential.url} />
            <Row label="Secret lives in" value={credential.storageLocation} />
            <Row label="Pfad im Tresor" value={credential.vaultRef} />
            <Row label="2FA lives in" value={credential.mfaLocation} />
            <Row label="Freigegeben für" value={credential.sharedWith} />
            {credential.notes && <Row label="Notizen" value={credential.notes} multiline />}
          </dl>
          <p className="mt-4 pt-3 border-t border-line-soft text-xs text-ink-mute">
            No secret value is stored in this app — retrieve it from {credential.storageLocation}.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-ink-mute mb-3">Verantwortung & Rotation</h2>
          <dl className="text-sm space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-ink-mute">Owner</dt>
              <dd className="col-span-2">
                {credential.owner ? (
                  <Link href={`/people/${credential.owner.id}`} className="hover:underline">
                    {credential.owner.name}
                  </Link>
                ) : (
                  <span className="text-ink-faint">Nicht zugewiesen</span>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-ink-mute">Venture</dt>
              <dd className="col-span-2">
                {credential.venture ? (
                  <Link href={`/ventures/${credential.venture.slug}`} className="hover:underline">
                    {credential.venture.name}
                  </Link>
                ) : (
                  <span className="text-ink-faint">Unternehmensweit</span>
                )}
              </dd>
            </div>
            <Row label="Zuletzt rotiert" value={credential.rotatedAt ? formatDate(credential.rotatedAt) : null} />
            <Row
              label="Interval"
              value={credential.rotateEveryDays != null ? `every ${credential.rotateEveryDays} days` : null}
            />
            <Row label="Next rotation" value={nextRotation ? formatDate(nextRotation) : null} />
          </dl>
        </section>
      </div>
    </>
  );
}

function Row({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-ink-mute col-span-1">{label}</dt>
      <dd className={`col-span-2 break-words ${multiline ? "whitespace-pre-line" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
