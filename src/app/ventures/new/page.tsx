import { PageHeader } from "@/components/page-header";
import { VentureForm } from "../venture-form";

export default function NewVenturePage() {
  return (
    <>
      <PageHeader
        title="Neues Venture"
        description="Ein Venture ist eine Geschäftslinie unter dem Pushlabs-Dach — ein Agenturzweig, eine eigene Marke, ein Format."
      />
      <VentureForm />
    </>
  );
}
