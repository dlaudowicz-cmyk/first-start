import { getActiveProgram, getDemoEnrollment, getCertificatesForEnrollment } from "@/lib/academy-data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";

export default async function ZertifikatePage() {
  const program = await getActiveProgram();
  if (!program) return null;
  const enrollment = await getDemoEnrollment(program.id);
  const certs = enrollment ? await getCertificatesForEnrollment(enrollment.id) : [];

  return (
    <div>
      <PageHeader title="Zertifikate" subtitle={`${certs.length} Zertifikat(e)`} />
      <div className="p-8 space-y-4">
        {certs.length === 0 && <p className="text-sm text-muted">Noch keine Zertifikate ausgestellt.</p>}
        {certs.map((c) => (
          <Card key={c.id} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{c.certificateType}</p>
              <p className="text-xs text-muted mt-1">
                Nr. {c.certificateNumber} · Verifikationscode {c.verificationCode}
              </p>
              {c.issuedAt && (
                <p className="text-xs text-muted mt-0.5">
                  Ausgestellt am {new Date(c.issuedAt).toLocaleDateString("de-DE")}
                </p>
              )}
            </div>
            <StatusBadge status={c.status} />
          </Card>
        ))}
      </div>
    </div>
  );
}
