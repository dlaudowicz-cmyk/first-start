import { getAllSubmissionsWithContext, getFeedbackForSubmission } from "@/lib/academy-data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { submitFeedback } from "./actions";

const STATUS_OPTIONS = ["in_pruefung", "ueberarbeitung_erforderlich", "bestanden", "nicht_bestanden"];

export default async function DozentPage({
  searchParams,
}: {
  searchParams: Promise<{ submission?: string }>;
}) {
  const { submission: submissionParam } = await searchParams;
  const all = await getAllSubmissionsWithContext();
  const active = all.find((s) => s.submission.id === submissionParam) ?? all[0];
  const feedbackList = active ? await getFeedbackForSubmission(active.submission.id) : [];
  const boundSubmit = active ? submitFeedback.bind(null, active.submission.id) : undefined;

  return (
    <div>
      <PageHeader title="Abgaben-Queue" subtitle={`${all.length} Abgabe(n) insgesamt`} />
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-2 lg:col-span-1 h-fit">
          {all.map(({ submission, assignment }) => (
            <a
              key={submission.id}
              href={`/akademie/dozent?submission=${submission.id}`}
              className={`block rounded-md px-3 py-2.5 mb-1 text-sm transition-colors ${
                active?.submission.id === submission.id
                  ? "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]"
                  : "hover:bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{assignment.title}</span>
                <StatusBadge status={submission.status} />
              </div>
              <p className="text-xs text-muted mt-0.5">
                Eingereicht am {new Date(submission.submittedAt).toLocaleDateString("de-DE")}
              </p>
            </a>
          ))}
        </Card>

        <Card className="p-6 lg:col-span-2">
          {active ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{active.assignment.title}</h2>
                  <p className="text-xs text-muted mt-1">{active.assignment.description}</p>
                </div>
                <StatusBadge status={active.submission.status} />
              </div>

              <div className="rounded-lg border border-border p-4 mb-4 text-sm space-y-1">
                <p><span className="text-muted">Abgabe:</span> {active.submission.content}</p>
                {active.submission.toolDocumentation && (
                  <p><span className="text-muted">Tools:</span> {active.submission.toolDocumentation}</p>
                )}
                {active.submission.reflection && (
                  <p><span className="text-muted">Reflexion:</span> {active.submission.reflection}</p>
                )}
              </div>

              {feedbackList.length > 0 && (
                <div className="mb-4 space-y-2">
                  {feedbackList.map((f) => (
                    <p key={f.id} className="text-sm rounded-md bg-success-bg text-success px-3 py-2">
                      {f.content} {f.score != null && `(${f.score}/100)`}
                    </p>
                  ))}
                </div>
              )}

              {boundSubmit && (
                <form action={boundSubmit} className="space-y-3">
                  <textarea
                    name="content"
                    placeholder="Feedback"
                    rows={3}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex gap-3">
                    <input
                      name="score"
                      type="number"
                      placeholder="Punkte (0-100)"
                      className="w-40 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <select name="status" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="text-sm btn-primary">
                    Feedback speichern
                  </button>
                </form>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Keine Abgaben vorhanden.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
