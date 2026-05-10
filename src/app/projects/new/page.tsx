import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  const clients = await prisma.client.findMany({ orderBy: { companyName: "asc" }, select: { id: true, companyName: true } });
  if (clients.length === 0) {
    return (
      <>
        <PageHeader title="New project" />
        <EmptyState
          title="Add a client first"
          description="Projects must belong to a client."
          action={
            <Link href="/clients/new" className="btn-primary">
              Create a client
            </Link>
          }
        />
      </>
    );
  }
  return (
    <>
      <PageHeader title="New project" />
      <ProjectForm clients={clients} />
    </>
  );
}
