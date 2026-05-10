import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { ClientForm } from "../../client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <>
      <PageHeader title={`Edit · ${client.companyName}`} />
      <ClientForm
        initial={{
          id: client.id,
          companyName: client.companyName,
          contactPerson: client.contactPerson ?? "",
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: client.address ?? "",
          vatId: client.vatId ?? "",
          notes: client.notes ?? "",
        }}
      />
    </>
  );
}
