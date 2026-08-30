import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { ProjectReport } from "@/lib/project-report";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    color: "#1f1f27",
    fontFamily: "Helvetica",
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  accentBar: { width: 28, height: 3, backgroundColor: "#caff3d", marginBottom: 6 },
  logo: { width: 180, marginBottom: 8 },
  brand: { fontSize: 14, fontWeight: 700, color: "#14141a", letterSpacing: 1 },
  sub: { fontSize: 8, color: "#888893", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  metaCol: { textAlign: "right", fontSize: 9, color: "#454552" },
  title: { fontSize: 20, fontWeight: 700, color: "#14141a", marginTop: 10 },
  subtitle: { fontSize: 11, color: "#5e5e6b", marginTop: 4 },
  sectionTitle: {
    fontSize: 8,
    color: "#888893",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f27",
    paddingBottom: 4,
  },
  paragraph: { fontSize: 10, lineHeight: 1.5, color: "#454552" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeef0", paddingVertical: 5 },
  kvKey: { width: 150, color: "#5e5e6b" },
  kvValue: { flex: 1 },
  th: { fontSize: 8, color: "#888893", textTransform: "uppercase", letterSpacing: 1 },
  thRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeef0", paddingVertical: 5 },
  colWide: { flex: 1, paddingRight: 8 },
  colMed: { width: 96, paddingRight: 8 },
  colNum: { width: 76, textAlign: "right" },
  colSmall: { width: 58 },
  statRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eeeef0",
    borderRadius: 4,
    padding: 10,
  },
  statLabel: { fontSize: 7, color: "#888893", textTransform: "uppercase", letterSpacing: 1 },
  statValue: { fontSize: 13, fontWeight: 700, color: "#14141a", marginTop: 4 },
  barTrack: { height: 6, backgroundColor: "#eeeef0", borderRadius: 3, marginTop: 10 },
  barFill: { height: 6, backgroundColor: "#caff3d", borderRadius: 3 },
  barOver: { height: 6, backgroundColor: "#dc2626", borderRadius: 3 },
  barNote: { fontSize: 8, color: "#888893", marginTop: 4 },
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

const fmtDate = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(d)) : "—";

export function ProjectReportPdf({
  data,
  generatedAt,
  logo,
}: {
  data: ProjectReport;
  generatedAt: Date;
  /** Data URI from `loadLogoDataUri`; null falls back to the text wordmark. */
  logo?: string | null;
}) {
  const { project: p, client, venture, settings, totals } = data;
  const companyName = settings?.companyName ?? "Pushlabs";
  // Clamp the bar at 100% and flag overruns in red instead of overflowing.
  const usedPct = totals.budgetUsedPct;
  const barPct = usedPct == null ? null : Math.min(usedPct, 100);
  const overBudget = usedPct != null && usedPct > 100;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {logo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logo} style={styles.logo} />
            ) : (
              <>
                <View style={styles.accentBar} />
                <Text style={styles.brand}>{companyName.toUpperCase()}</Text>
              </>
            )}
            <Text style={styles.sub}>Projektstatusbericht</Text>
          </View>
          <View style={styles.metaCol}>
            <Text>{settings?.owner ?? ""}</Text>
            {settings?.email && <Text>{settings.email}</Text>}
            <Text>Stand: {fmtDate(generatedAt)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{p.title}</Text>
        <Text style={styles.subtitle}>
          {client.companyName}
          {venture ? ` · ${venture.name}` : ""}
        </Text>

        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.statValue}>{p.status}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Abgerechnet netto</Text>
            <Text style={styles.statValue}>{fmt(totals.invoicedNet)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Bezahlt brutto</Text>
            <Text style={styles.statValue}>{fmt(totals.paidGross)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Offen brutto</Text>
            <Text style={styles.statValue}>{fmt(totals.openGross)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Projektdaten</Text>
        <Kv label="Kunde" value={client.companyName} />
        {client.contactPerson && <Kv label="Ansprechpartner" value={client.contactPerson} />}
        <Kv label="Leistungsart" value={p.type} />
        <Kv label="Status" value={p.status} />
        <Kv label="Drehzeitraum" value={`${fmtDate(p.shootStart)} → ${fmtDate(p.shootEnd)}`} />
        <Kv label="Drehort" value={p.location || "—"} />
        <Kv label="Budget (netto)" value={p.budget != null ? fmt(p.budget) : "—"} />

        {p.budget != null && p.budget > 0 && (
          <>
            <View style={styles.barTrack}>
              <View style={[overBudget ? styles.barOver : styles.barFill, { width: `${barPct}%` }]} />
            </View>
            <Text style={styles.barNote}>
              {`${usedPct}% des Budgets abgerechnet · ${
                totals.budgetRemaining != null && totals.budgetRemaining >= 0
                  ? `${fmt(totals.budgetRemaining)} verbleibend`
                  : `${fmt(Math.abs(totals.budgetRemaining ?? 0))} über Budget`
              }`}
            </Text>
          </>
        )}

        {p.notes && (
          <>
            <Text style={styles.sectionTitle}>Anmerkungen</Text>
            <Text style={styles.paragraph}>{p.notes}</Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Angebote</Text>
        {data.offers.length === 0 ? (
          <Text style={styles.paragraph}>Keine Angebote erfasst.</Text>
        ) : (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colMed]}>Nummer</Text>
              <Text style={[styles.th, styles.colMed]}>Datum</Text>
              <Text style={[styles.th, styles.colWide]}>Status</Text>
              <Text style={[styles.th, styles.colNum]}>Netto</Text>
              <Text style={[styles.th, styles.colNum]}>Brutto</Text>
            </View>
            {data.offers.map((o) => (
              <View key={o.id} style={styles.row}>
                <Text style={styles.colMed}>{o.number}</Text>
                <Text style={styles.colMed}>{fmtDate(o.date)}</Text>
                <Text style={styles.colWide}>{o.status}</Text>
                <Text style={styles.colNum}>{fmt(o.net)}</Text>
                <Text style={styles.colNum}>{fmt(o.gross)}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Rechnungen</Text>
        {data.invoices.length === 0 ? (
          <Text style={styles.paragraph}>Noch nicht abgerechnet.</Text>
        ) : (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colMed]}>Nummer</Text>
              <Text style={[styles.th, styles.colMed]}>Datum</Text>
              <Text style={[styles.th, styles.colWide]}>Status</Text>
              <Text style={[styles.th, styles.colNum]}>Netto</Text>
              <Text style={[styles.th, styles.colNum]}>Brutto</Text>
            </View>
            {data.invoices.map((i) => (
              <View key={i.id} style={styles.row}>
                <Text style={styles.colMed}>{i.number}</Text>
                <Text style={styles.colMed}>{fmtDate(i.date)}</Text>
                <Text style={styles.colWide}>
                  {i.status}
                  {i.paidAt ? ` (${fmtDate(i.paidAt)})` : ""}
                </Text>
                <Text style={styles.colNum}>{fmt(i.net)}</Text>
                <Text style={styles.colNum}>{fmt(i.gross)}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={[styles.colMed, { fontWeight: 700 }]}>Summe</Text>
              <Text style={styles.colMed} />
              <Text style={styles.colWide} />
              <Text style={[styles.colNum, { fontWeight: 700 }]}>{fmt(totals.invoicedNet)}</Text>
              <Text style={[styles.colNum, { fontWeight: 700 }]}>{fmt(totals.invoicedGross)}</Text>
            </View>
          </>
        )}

        {data.expenses.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Spesen</Text>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colMed]}>Datum</Text>
              <Text style={[styles.th, styles.colWide]}>Notiz</Text>
              <Text style={[styles.th, styles.colSmall]}>Pers.</Text>
              <Text style={[styles.th, styles.colNum]}>Pauschale</Text>
            </View>
            {data.expenses.map((e) => (
              <View key={e.id} style={styles.row}>
                <Text style={styles.colMed}>{fmtDate(e.travelDate)}</Text>
                <Text style={styles.colWide}>{e.notes || (e.overnight ? "mit Übernachtung" : "—")}</Text>
                <Text style={styles.colSmall}>{e.people}</Text>
                <Text style={styles.colNum}>{fmt(e.allowance)}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={[styles.colMed, { fontWeight: 700 }]}>Summe</Text>
              <Text style={styles.colWide} />
              <Text style={styles.colSmall} />
              <Text style={[styles.colNum, { fontWeight: 700 }]}>{fmt(totals.expenseTotal)}</Text>
            </View>
          </>
        )}

        {data.tasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Aufgaben ({totals.openTaskCount} offen, {totals.doneTaskCount} erledigt)
            </Text>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colWide]}>Aufgabe</Text>
              <Text style={[styles.th, styles.colMed]}>Zuständig</Text>
              <Text style={[styles.th, styles.colSmall]}>Status</Text>
              <Text style={[styles.th, styles.colNum]}>Fällig</Text>
            </View>
            {data.tasks.map((t) => (
              <View key={t.id} style={styles.row}>
                <Text style={styles.colWide}>{t.title}</Text>
                <Text style={styles.colMed}>{t.assignee || "—"}</Text>
                <Text style={styles.colSmall}>{t.status}</Text>
                <Text style={styles.colNum}>{fmtDate(t.dueDate)}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} fixed>
          <Text>
            {companyName} · {p.title}
          </Text>
          <Text>Stand {fmtDate(generatedAt)}</Text>
        </View>
      </Page>
    </Document>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.kvKey}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}
