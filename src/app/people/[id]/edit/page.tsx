import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { PersonForm } from "../../person-form";

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${person.name}`} />
      <PersonForm
        initial={{
          id: person.id,
          name: person.name,
          type: person.type as never,
          status: person.status as never,
          role: person.role ?? "",
          email: person.email ?? "",
          phone: person.phone ?? "",
          location: person.location ?? "",
          dayRate: person.dayRate ?? undefined,
          skills: person.skills ?? "",
          notes: person.notes ?? "",
        }}
      />
    </>
  );
}
