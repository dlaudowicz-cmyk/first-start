import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <>
      <PageHeader
        title="Einstellungen"
        description="Firmendaten, Bankverbindung, Nummernkreise und Logo. Diese Angaben stehen auf jedem Angebot und jeder Rechnung."
      />
      <SettingsForm
        initial={{
          companyName: settings.companyName,
          owner: settings.owner,
          tagline: settings.tagline ?? "",
          address: settings.address ?? "",
          taxNumber: settings.taxNumber ?? "",
          vatId: settings.vatId ?? "",
          email: settings.email ?? "",
          phone: settings.phone ?? "",
          website: settings.website ?? "",
          bankName: settings.bankName ?? "",
          iban: settings.iban ?? "",
          bic: settings.bic ?? "",
          defaultVatRate: settings.defaultVatRate,
          invoicePrefix: settings.invoicePrefix,
          nextInvoiceNo: settings.nextInvoiceNo,
          offerPrefix: settings.offerPrefix,
          nextOfferNo: settings.nextOfferNo,
        }}
        logoPath={settings.logoPath ?? null}
      />
    </>
  );
}
