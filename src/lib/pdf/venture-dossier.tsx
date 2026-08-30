import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { VentureExport } from "@/lib/venture-export";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    color: "#1f1f27",
    fontFamily: "Helvetica",
  },
  accentBar: { width: 28, height: 3, backgroundColor: "#caff3d", marginBottom: 6 },
  logo: { height: 34, maxWidth: 150, objectFit: "contain", marginBottom: 6 },
  holding: { fontSize: 11, fontWeight: 700, color: "#14141a", letterSpacing: 1 },
  sub: { fontSize: 8, color: "#888893", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  title: { fontSize: 26, fontWeight: 700, color: "#14141a", marginTop: 28 },
  tagline: { fontSize: 11, color: "#5e5e6b", marginTop: 4 },
  meta: { fontSize: 9, color: "#888893", marginTop: 14 },
  sectionTitle: {
    fontSize: 8,
    color: "#888893",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f27",
    paddingBottom: 4,
  },
  paragraph: { fontSize: 10, lineHeight: 1.5, color: "#454552" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeef0", paddingVertical: 5 },
  kvKey: { width: 170, color: "#5e5e6b" },
  kvValue: { flex: 1 },
  th: {
    fontSize: 8,
    color: "#888893",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  thRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeef0", paddingVertical: 5 },
  colWide: { flex: 1, paddingRight: 8 },
  colMed: { width: 110, paddingRight: 8 },
  colNum: { width: 80, textAlign: "right" },
  colSmall: { width: 64 },
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
  sharedNote: { fontSize: 9, color: "#7e5a23", marginTop: 6 },
});

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(d)) : "—";

export function VentureDossierPdf({
  data,
  generatedAt,
  logo,
}: {
  data: NonNullable<VentureExport>;
  generatedAt: Date;
  /** Data URI from `loadLogoDataUri`; null falls back to the text wordmark. */
  logo?: string | null;
}) {
  const { venture: v, summary: s, holding } = data;
  const sharedClients = data.clients.filter((c) => c.shared);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          {logo ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logo} style={styles.logo} />
          ) : (
            <>
              <View style={styles.accentBar} />
              <Text style={styles.holding}>{(holding?.companyName ?? "PUSHLABS").toUpperCase()}</Text>
            </>
          )}
          <Text style={styles.sub}>Venture Dossier</Text>
        </View>

        <Text style={styles.title}>{v.name}</Text>
        {v.tagline && <Text style={styles.tagline}>{v.tagline}</Text>}
        <Text style={styles.meta}>
          {v.kind} · {v.status} · generated {fmtDate(generatedAt)}
        </Text>

        {v.description && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.paragraph}>{v.description}</Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Key figures</Text>
        <Kv label="Revenue (paid Rechnungen)" value={fmt(s.revenuePaid)} />
        <Kv label="Open Rechnungen" value={fmt(s.revenueOpen)} />
        <Kv label="Angebots-Pipeline" value={fmt(s.offerPipeline)} />
        <Kv label="Tool cost per month" value={fmt(s.toolCostPerMonth)} />
        <Kv
          label="Invoicing period"
          value={`${s.firstInvoice ? fmtDate(s.firstInvoice) : "—"} → ${s.lastInvoice ? fmtDate(s.lastInvoice) : "—"}`}
        />
        <Kv label="Gegründet" value={fmtDate(v.foundedAt)} />

        <Text style={styles.sectionTitle}>Scope</Text>
        <Kv
          label="Clients"
          value={`${s.clients}${s.sharedClients > 0 ? ` (${s.sharedClients} shared with other ventures)` : ""}`}
        />
        <Kv label="Team members" value={String(s.teamSize)} />
        <Kv label="Projects" value={String(s.projects)} />
        <Kv label="Offers / Invoices" value={`${s.offers} / ${s.invoices}`} />
        <Kv label="Contracts" value={String(s.contracts)} />
        <Kv label="Tool subscriptions" value={String(s.tools)} />
        <Kv label="Offene Aufgaben" value={`${s.openTasks} of ${s.tasks}`} />

        <View style={styles.footer} fixed>
          <Text>
            {holding?.companyName ?? "Pushlabs"} · {v.name}
          </Text>
          <Text>Confidential — internal venture dossier</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Team</Text>
        {data.people.length === 0 ? (
          <Text style={styles.paragraph}>Niemand zugeordnet.</Text>
        ) : (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colWide]}>Name</Text>
              <Text style={[styles.th, styles.colMed]}>Role in venture</Text>
              <Text style={[styles.th, styles.colSmall]}>Type</Text>
              <Text style={[styles.th, styles.colNum]}>Alloc.</Text>
            </View>
            {data.people.map((p) => (
              <View key={p.id} style={styles.row}>
                <Text style={styles.colWide}>{p.name}</Text>
                <Text style={styles.colMed}>{p.roleInVenture}</Text>
                <Text style={styles.colSmall}>{p.type}</Text>
                <Text style={styles.colNum}>{p.allocation != null ? `${p.allocation}%` : "—"}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Kunden</Text>
        {data.clients.length === 0 ? (
          <Text style={styles.paragraph}>Keine Kunden verknüpft.</Text>
        ) : (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colWide]}>Company</Text>
              <Text style={[styles.th, styles.colMed]}>Contact</Text>
              <Text style={[styles.th, styles.colMed]}>VAT ID</Text>
              <Text style={[styles.th, styles.colSmall]}>Shared</Text>
            </View>
            {data.clients.map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.colWide}>{c.companyName}</Text>
                <Text style={styles.colMed}>{c.contactPerson || "—"}</Text>
                <Text style={styles.colMed}>{c.vatId || "—"}</Text>
                <Text style={styles.colSmall}>{c.shared ? "yes" : "no"}</Text>
              </View>
            ))}
            {sharedClients.length > 0 && (
              <Text style={styles.sharedNote}>
                Shared clients are also active in:{" "}
                {sharedClients.map((c) => `${c.companyName} → ${c.alsoInVentures.join(", ")}`).join(" · ")}
              </Text>
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>Projekte</Text>
        {data.projects.length === 0 ? (
          <Text style={styles.paragraph}>No projects.</Text>
        ) : (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colWide]}>Project</Text>
              <Text style={[styles.th, styles.colMed]}>Client</Text>
              <Text style={[styles.th, styles.colSmall]}>Status</Text>
              <Text style={[styles.th, styles.colNum]}>Budget</Text>
            </View>
            {data.projects.map((p) => (
              <View key={p.id} style={styles.row}>
                <Text style={styles.colWide}>{p.title}</Text>
                <Text style={styles.colMed}>{p.client}</Text>
                <Text style={styles.colSmall}>{p.status}</Text>
                <Text style={styles.colNum}>{p.budget != null ? fmt(p.budget) : "—"}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} fixed>
          <Text>
            {holding?.companyName ?? "Pushlabs"} · {v.name}
          </Text>
          <Text>Confidential — internal venture dossier</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Rechnungen</Text>
        {data.invoices.length === 0 ? (
          <Text style={styles.paragraph}>No Rechnungen.</Text>
        ) : (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colMed]}>Number</Text>
              <Text style={[styles.th, styles.colWide]}>Client</Text>
              <Text style={[styles.th, styles.colSmall]}>Status</Text>
              <Text style={[styles.th, styles.colNum]}>Netto</Text>
              <Text style={[styles.th, styles.colNum]}>Brutto</Text>
            </View>
            {data.invoices.map((i) => (
              <View key={i.id} style={styles.row}>
                <Text style={styles.colMed}>{i.number}</Text>
                <Text style={styles.colWide}>{i.client}</Text>
                <Text style={styles.colSmall}>{i.status}</Text>
                <Text style={styles.colNum}>{fmt(i.net)}</Text>
                <Text style={styles.colNum}>{fmt(i.gross)}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Verträge</Text>
        {data.contracts.length === 0 ? (
          <Text style={styles.paragraph}>Keine Verträge.</Text>
        ) : (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colWide]}>Title</Text>
              <Text style={[styles.th, styles.colMed]}>Counterparty</Text>
              <Text style={[styles.th, styles.colSmall]}>Status</Text>
              <Text style={[styles.th, styles.colNum]}>Ends</Text>
            </View>
            {data.contracts.map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.colWide}>{c.title}</Text>
                <Text style={styles.colMed}>{c.counterparty}</Text>
                <Text style={styles.colSmall}>{c.status}</Text>
                <Text style={styles.colNum}>{fmtDate(c.endDate)}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Access register</Text>
        <Text style={styles.paragraph}>
          {data.credentials.length} vault reference{data.credentials.length === 1 ? "" : "s"}. References only — no
          secret values are stored in the Pushlabs OS.
        </Text>
        {data.credentials.length > 0 && (
          <>
            <View style={styles.thRow}>
              <Text style={[styles.th, styles.colWide]}>Service</Text>
              <Text style={[styles.th, styles.colMed]}>Secret lives in</Text>
              <Text style={[styles.th, styles.colMed]}>Owner</Text>
              <Text style={[styles.th, styles.colSmall]}>Criticality</Text>
            </View>
            {data.credentials.map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.colWide}>{c.service}</Text>
                <Text style={styles.colMed}>{c.storageLocation}</Text>
                <Text style={styles.colMed}>{c.owner || "—"}</Text>
                <Text style={styles.colSmall}>{c.criticality}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} fixed>
          <Text>
            {holding?.companyName ?? "Pushlabs"} · {v.name}
          </Text>
          <Text>Confidential — internal venture dossier</Text>
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
