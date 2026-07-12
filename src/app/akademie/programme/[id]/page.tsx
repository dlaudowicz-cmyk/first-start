import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCourses } from "@/lib/academy-data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [program] = await db.select().from(programs).where(eq(programs.id, id));
  if (!program) notFound();

  const courseList = await getCourses(program.id);

  return (
    <div>
      <PageHeader
        title={program.title}
        subtitle={`${program.subtitle ?? ""} · ${program.targetHours} Unterrichtsstunden`}
      />
      <div className="p-8">
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
                <th className="py-3 px-4">Kurs</th>
                <th className="py-3 px-4 w-32">Stunden</th>
                <th className="py-3 px-4 w-40">Status</th>
              </tr>
            </thead>
            <tbody>
              {courseList.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background/60">
                  <td className="py-3 px-4">
                    <Link href={`/akademie/kurse/${c.id}`} className="font-medium hover:text-accent transition-colors">
                      {c.title}
                    </Link>
                    {c.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{c.description}</p>}
                  </td>
                  <td className="py-3 px-4 tabular-nums">{c.estimatedHours}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
