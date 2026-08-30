import { PageHeader } from "@/components/page-header";
import { PersonForm } from "../person-form";

export default function NewPersonPage() {
  return (
    <>
      <PageHeader title="Person hinzufügen" description="Gründer, Crew, Freelancer, Partner und Berater." />
      <PersonForm />
    </>
  );
}
