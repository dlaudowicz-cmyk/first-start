import { PageHeader } from "@/components/page-header";
import { PersonForm } from "../person-form";

export default function NewPersonPage() {
  return (
    <>
      <PageHeader title="Add person" description="Founders, crew, freelancers, partners and advisors." />
      <PersonForm />
    </>
  );
}
