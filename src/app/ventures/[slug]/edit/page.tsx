import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { dateInput } from "@/lib/form";
import { VentureForm } from "../../venture-form";

export default async function EditVenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venture = await prisma.venture.findUnique({ where: { slug } });
  if (!venture) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${venture.name}`} />
      <VentureForm
        initial={{
          id: venture.id,
          name: venture.name,
          slug: venture.slug,
          kind: venture.kind as never,
          status: venture.status as never,
          tagline: venture.tagline ?? "",
          description: venture.description ?? "",
          accent: venture.accent ?? "#caff3d",
          foundedAt: dateInput(venture.foundedAt),
        }}
      />
    </>
  );
}
