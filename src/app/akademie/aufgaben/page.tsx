import {
  getActiveProgram,
  getDemoEnrollment,
  getAllAssignmentsWithContext,
  getSubmissionsForEnrollment,
  getFeedbackForSubmission,
} from "@/lib/academy-data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { createSubmission } from "./actions";

export default async function AufgabenPage() {
  const program = await getActiveProgram();
  if (!program) return null;

  const enrollment = await getDemoEnrollment(program.id);
  if (!enrollment) return null;

  const assignmentsWithContext = await getAllAssignmentsWithContext();
  const submissionList = await getSubmissionsForEnrollment(enrollment.id);

  return (
    <div>
      <PageHeader title="Meine Aufgaben" subtitle={`${assignmentsWithContext.length} Aufgabe(n)`} />
      <div className="p-8 space-y-6">
        {await Promise.all(
          assignmentsWithContext.map(async ({ assignment, lesson }) => {
            const relatedSubmissions = submissionList.filter((s) => s.assignmentId === assignment.id);
            const latest = relatedSubmissions[relatedSubmissions.length - 1];
            const feedbackList = latest ? await getFeedbackForSubmission(latest.id) : [];
            const boundCreate = createSubmission.bind(null, assignment.id, enrollment.id);

            return (
              <Card key={assignment.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-semibold">{assignment.title}</h2>
                    <p className="text-xs text-muted mt-0.5">Lektion: {lesson.title} · Fällig {assignment.dueDate}</p>
                  </div>
                  {latest && <StatusBadge status={latest.status} />}
                </div>
                <p className="text-sm text-muted mb-3">{assignment.description}</p>
                {assignment.rubricCriteria && (
                  <p className="text-xs text-muted mb-4">Bewertungskriterien: {assignment.rubricCriteria}</p>
                )}

                {latest && (
                  <div className="rounded-lg border border-border p-4 mb-4 text-sm space-y-1">
                    <p><span className="text-muted">Abgabe:</span> {latest.content}</p>
                    {latest.toolDocumentation && <p><span className="text-muted">Tools:</span> {latest.toolDocumentation}</p>}
                    {latest.score != null && <p><span className="text-muted">Bewertung:</span> {latest.score}/100</p>}
                    {feedbackList.map((f) => (
                      <p key={f.id} className="text-accent">Feedback: {f.content}</p>
                    ))}
                  </div>
                )}

                {(!latest || latest.status === "ueberarbeitung_erforderlich") && (
                  <form action={boundCreate} className="space-y-3">
                    <textarea
                      name="content"
                      placeholder="Beschreibe deine Abgabe (Links/Dateinamen, da Uploads im Klick-Dummy simuliert sind)"
                      rows={2}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      name="toolDocumentation"
                      placeholder="Verwendete Tools & Prompts"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      name="reflection"
                      placeholder="Kurze Selbstreflexion"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button type="submit" className="text-sm btn-primary">
                      Abgeben
                    </button>
                  </form>
                )}
              </Card>
            );
          }),
        )}
      </div>
    </div>
  );
}
