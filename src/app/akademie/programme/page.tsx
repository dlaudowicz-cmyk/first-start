import Link from "next/link";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { getCourses } from "@/lib/academy-data";
import { PageHeader, Card, StatusBadge } from "@/components/ui";

export default async function ProgrammePage() {
  const programList = await db.select().from(programs);

  return (
    <div>
      <PageHeader title="Programme" subtitle={`${programList.length} Programm(e)`} />
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {await Promise.all(
          programList.map(async (p) => {
            const courseList = await getCourses(p.id);
            return (
              <Link key={p.id} href={`/akademie/programme/${p.id}`}>
                <Card className="p-5 h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-base font-semibold">{p.title}</h2>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-muted mb-3">{p.subtitle}</p>
                  <p className="text-sm text-muted">
                    {courseList.length} Kurse · {p.targetHours} Unterrichtsstunden · {p.certificateType}
                  </p>
                </Card>
              </Link>
            );
          }),
        )}
      </div>
    </div>
  );
}
