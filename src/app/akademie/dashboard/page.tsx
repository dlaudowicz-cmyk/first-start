import Link from "next/link";
import { getAcademyRole } from "@/lib/academy-role";
import {
  getActiveProgram,
  getDemoEnrollment,
  getCourses,
  getCourseModulesWithLessons,
  getLessonProgressForEnrollment,
  getAllSubmissionsWithContext,
  getCertificatesForEnrollment,
} from "@/lib/academy-data";
import { PageHeader, Card, Stat, StatusBadge } from "@/components/ui";

export default async function AcademyDashboard() {
  const role = await getAcademyRole();
  const program = await getActiveProgram();

  if (!program) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted">Kein Academy-Programm gefunden. Bitte Seed-Daten einspielen.</p>
      </div>
    );
  }

  const courseList = await getCourses(program.id);
  const enrollment = await getDemoEnrollment(program.id);

  if (role === "admin") {
    const allSubmissions = await getAllSubmissionsWithContext();
    return (
      <div>
        <PageHeader title={program.title} subtitle="Academy-Dashboard · Admin-Ansicht" />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Kurse" value={`${courseList.length}`} />
            <Stat label="Zielstunden" value={`${program.targetHours}`} />
            <Stat label="Eingereichte Abgaben" value={`${allSubmissions.length}`} />
            <Stat label="Programmstatus" value={program.status} />
          </div>
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-3">Nächster Schritt</h2>
            <p className="text-sm text-muted mb-3">
              Curriculum-Module aus dem Studio mit Academy-Kursen abgleichen.
            </p>
            <Link href="/akademie/admin" className="text-sm btn-primary">
              Zum Curriculum-Sync
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (role === "dozent") {
    const allSubmissions = await getAllSubmissionsWithContext();
    const pending = allSubmissions.filter((s) => s.submission.status === "eingereicht");
    return (
      <div>
        <PageHeader title={program.title} subtitle="Academy-Dashboard · Dozenten-Ansicht" />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Ungeprüfte Abgaben" value={`${pending.length}`} tone={pending.length > 0 ? "warning" : "success"} />
            <Stat label="Kurse" value={`${courseList.length}`} />
            <Stat label="Kohorte" value="Januar 2027" />
          </div>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Offene Abgaben</h2>
              <Link href="/akademie/dozent" className="text-xs text-accent hover:underline">
                Alle ansehen
              </Link>
            </div>
            {pending.length === 0 ? (
              <p className="text-sm text-success">Keine offenen Abgaben.</p>
            ) : (
              <ul className="space-y-2">
                {pending.map((s) => (
                  <li key={s.submission.id} className="text-sm flex items-center justify-between">
                    <span>{s.assignment.title}</span>
                    <StatusBadge status={s.submission.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Teilnehmer
  let progressPercent = 0;
  let completedLessons = 0;
  let totalLessons = 0;
  if (enrollment) {
    const progress = await getLessonProgressForEnrollment(enrollment.id);
    totalLessons = progress.length;
    completedLessons = progress.filter((p) => p.status === "abgeschlossen").length;
    progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }
  const certs = enrollment ? await getCertificatesForEnrollment(enrollment.id) : [];

  return (
    <div>
      <PageHeader title={program.title} subtitle={`${program.subtitle ?? ""} · Teilnehmer-Dashboard`} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Fortschritt" value={`${progressPercent}%`} hint={`${completedLessons} von ${totalLessons} Lektionen`} tone="success" />
          <Stat label="Kurse" value={`${courseList.length}`} />
          <Stat label="Zertifikate" value={`${certs.length}`} />
          <Stat label="Status" value={enrollment?.status ?? "–"} />
        </div>

        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-4">Meine Kurse</h2>
          <ul className="space-y-2">
            {courseList.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                <Link href={`/akademie/kurse/${c.id}`} className="hover:text-accent transition-colors">
                  {c.title}
                </Link>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-3">Aufgaben & Zertifikate</h2>
          <div className="flex gap-3">
            <Link href="/akademie/aufgaben" className="text-sm btn-primary">
              Zu meinen Aufgaben
            </Link>
            <Link href="/akademie/zertifikate" className="text-sm rounded-md border border-border px-3 py-1.5 font-medium hover:bg-background">
              Zertifikate ansehen
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
