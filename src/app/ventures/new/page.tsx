import { PageHeader } from "@/components/page-header";
import { VentureForm } from "../venture-form";

export default function NewVenturePage() {
  return (
    <>
      <PageHeader
        title="New venture"
        description="A venture is a business line under the Pushlabs roof — an agency arm, an own brand, a format."
      />
      <VentureForm />
    </>
  );
}
