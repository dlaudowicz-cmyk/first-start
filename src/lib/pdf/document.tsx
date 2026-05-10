import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Client, CompanySettings, InvoiceItem, OfferItem } from "@prisma/client";
import { calculateTotals } from "@/lib/calculations";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    color: "#1f1f27",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  brand: { fontSize: 16, fontWeight: 700, color: "#14141a", letterSpacing: 1 },
  brandSub: { fontSize: 8, color: "#888893", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  metaCol: { textAlign: "right", fontSize: 9, color: "#454552" },
  twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  col: { flex: 1 },
  label: { fontSize: 8, color: "#888893", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  addressBlock: { fontSize: 10, lineHeight: 1.45 },
  title: { fontSize: 22, fontWeight: 700, color: "#14141a", marginBottom: 4, marginTop: 6 },
  number: { fontSize: 11, color: "#5e5e6b", marginBottom: 18 },
  table: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#1f1f27" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeef0", paddingVertical: 7 },
  th: { fontSize: 8, color: "#888893", textTransform: "uppercase", letterSpacing: 1, paddingVertical: 7 },
  thRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeef0" },
  cellPos: { width: 24 },
  cellDesc: { flex: 1, paddingRight: 8 },
  cellQty: { width: 60, textAlign: "right" },
  cellPrice: { width: 80, textAlign: "right" },
  cellTotal: { width: 90, textAlign: "right" },
  totalsBox: { marginTop: 18, alignSelf: "flex-end", width: 240 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { color: "#5e5e6b" },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f1f27",
    marginTop: 4,
  },
  grandLabel: { fontWeight: 700 },
  grand: { fontWeight: 700, fontSize: 12 },
  notes: { marginTop: 24, fontSize: 9.5, color: "#454552", lineHeight: 1.5 },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#eeeef0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#888893",
  },
});

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(d)) : "—";

type Item = Pick<OfferItem | InvoiceItem, "description" | "quantity" | "unitPrice" | "unit" | "position">;

export type DocumentPdfProps = {
  kind: "Angebot" | "Rechnung";
  number: string;
  date: Date;
  secondaryDate?: { label: string; value: Date | null };
  paymentTerms?: string | null;
  notes?: string | null;
  vatRate: number;
  client: Client;
  settings: CompanySettings;
  items: Item[];
  projectTitle?: string | null;
};

export function DocumentPdf({
  kind,
  number,
  date,
  secondaryDate,
  paymentTerms,
  notes,
  vatRate,
  client,
  settings,
  items,
  projectTitle,
}: DocumentPdfProps) {
  const sortedItems = [...items].sort((a, b) => (a.position || 0) - (b.position || 0));
  const totals = calculateTotals(
    sortedItems.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
    vatRate,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{settings.companyName.toUpperCase()}</Text>
            <Text style={styles.brandSub}>Cinematic Production</Text>
          </View>
          <View style={styles.metaCol}>
            <Text>{settings.owner}</Text>
            {settings.address?.split("\n").map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
            {settings.email && <Text>{settings.email}</Text>}
            {settings.website && <Text>{settings.website}</Text>}
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.label}>Empfänger</Text>
            <View style={styles.addressBlock}>
              <Text style={{ fontWeight: 700 }}>{client.companyName}</Text>
              {client.contactPerson && <Text>{client.contactPerson}</Text>}
              {client.address?.split("\n").map((line, i) => (
                <Text key={i}>{line}</Text>
              ))}
              {client.vatId && <Text style={{ color: "#888893", marginTop: 4 }}>USt-IdNr.: {client.vatId}</Text>}
            </View>
          </View>
          <View style={[styles.col, { alignItems: "flex-end" }]}>
            <Text style={styles.label}>{kind === "Angebot" ? "Angebot Nr." : "Rechnung Nr."}</Text>
            <Text style={{ fontSize: 11, fontWeight: 700 }}>{number}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Datum</Text>
            <Text>{fmtDate(date)}</Text>
            {secondaryDate && (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>{secondaryDate.label}</Text>
                <Text>{fmtDate(secondaryDate.value)}</Text>
              </>
            )}
          </View>
        </View>

        <Text style={styles.title}>{kind}</Text>
        {projectTitle && <Text style={styles.number}>Projekt: {projectTitle}</Text>}

        <View style={styles.thRow}>
          <Text style={[styles.th, styles.cellPos]}>Pos</Text>
          <Text style={[styles.th, styles.cellDesc]}>Leistung</Text>
          <Text style={[styles.th, styles.cellQty]}>Menge</Text>
          <Text style={[styles.th, styles.cellPrice]}>Preis</Text>
          <Text style={[styles.th, styles.cellTotal]}>Summe</Text>
        </View>

        {sortedItems.map((item, idx) => {
          const lineNet = (item.quantity || 0) * (item.unitPrice || 0);
          return (
            <View key={idx} style={styles.tr}>
              <Text style={styles.cellPos}>{idx + 1}</Text>
              <Text style={styles.cellDesc}>{item.description}</Text>
              <Text style={styles.cellQty}>
                {item.quantity} {item.unit || ""}
              </Text>
              <Text style={styles.cellPrice}>{fmt(item.unitPrice)}</Text>
              <Text style={styles.cellTotal}>{fmt(lineNet)}</Text>
            </View>
          );
        })}

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Netto</Text>
            <Text>{fmt(totals.net)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>MwSt {vatRate}%</Text>
            <Text>{fmt(totals.vat)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Gesamt brutto</Text>
            <Text style={styles.grand}>{fmt(totals.gross)}</Text>
          </View>
        </View>

        {(paymentTerms || notes) && (
          <View style={styles.notes}>
            {paymentTerms && <Text>{paymentTerms}</Text>}
            {notes && <Text style={{ marginTop: 8 }}>{notes}</Text>}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>
            {settings.companyName} · {settings.owner}
          </Text>
          <Text>
            {settings.taxNumber ? `St.-Nr.: ${settings.taxNumber} · ` : ""}
            {settings.vatId ? `USt-IdNr.: ${settings.vatId}` : ""}
          </Text>
          <Text>
            {settings.iban ? `IBAN: ${settings.iban}` : ""}
            {settings.bic ? ` · BIC: ${settings.bic}` : ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
