import { PageHeader } from "@/components/page-header";
import { ClientForm } from "../client-form";

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="Neuer Kunde" description="Firma in die Kundendatenbank aufnehmen." />
      <ClientForm />
    </>
  );
}
