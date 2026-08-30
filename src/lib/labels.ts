/**
 * Deutsche Anzeigetexte für die englischen Werte, die in der Datenbank stehen.
 *
 * Die gespeicherten Werte bleiben bewusst englisch: sie sind Schlüssel, keine
 * Texte. Würde man sie übersetzen, müsste jede bestehende Zeile migriert
 * werden, und jede spätere Sprachänderung wäre wieder eine Migration.
 * Unbekannte Werte fallen auf sich selbst zurück, damit nie eine leere Zelle
 * entsteht.
 */

const PROJECT_STATUS: Record<string, string> = {
  lead: "Anfrage",
  "offer sent": "Angebot raus",
  confirmed: "Beauftragt",
  "in production": "In Produktion",
  delivered: "Geliefert",
  paid: "Bezahlt",
};

const PROJECT_TYPE: Record<string, string> = {
  "image film": "Imagefilm",
  "social media campaign": "Social-Media-Kampagne",
  "AI film": "KI-Film",
  commercial: "Werbespot",
  documentary: "Dokumentarisch",
  editing: "Schnitt",
  consulting: "Beratung",
};

const OFFER_STATUS: Record<string, string> = {
  draft: "Entwurf",
  sent: "Verschickt",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
  expired: "Abgelaufen",
};

const INVOICE_STATUS: Record<string, string> = {
  draft: "Entwurf",
  sent: "Verschickt",
  paid: "Bezahlt",
  overdue: "Überfällig",
  cancelled: "Storniert",
};

const VENTURE_KIND: Record<string, string> = {
  studio: "Studio",
  brand: "Marke",
  podcast: "Podcast",
  product: "Produkt",
  internal: "Intern",
};

const VENTURE_STATUS: Record<string, string> = {
  active: "Aktiv",
  incubating: "Im Aufbau",
  paused: "Pausiert",
  archived: "Archiviert",
};

const PERSON_TYPE: Record<string, string> = {
  founder: "Gründer",
  employee: "Angestellt",
  freelancer: "Freelance",
  partner: "Partner",
  advisor: "Berater",
};

const PERSON_STATUS: Record<string, string> = {
  active: "Aktiv",
  prospect: "Interessent",
  inactive: "Inaktiv",
};

const CONTRACT_TYPE: Record<string, string> = {
  client: "Kunde",
  freelancer: "Freelance",
  cooperation: "Kooperation",
  nda: "NDA",
  license: "Lizenz",
  lease: "Miete",
  insurance: "Versicherung",
  other: "Sonstiges",
};

const CONTRACT_STATUS: Record<string, string> = {
  draft: "Entwurf",
  "in review": "In Prüfung",
  signed: "Unterschrieben",
  active: "Laufend",
  expired: "Abgelaufen",
  terminated: "Gekündigt",
};

const CREDENTIAL_CATEGORY: Record<string, string> = {
  account: "Konto",
  api: "API",
  domain: "Domain",
  bank: "Bank",
  social: "Social",
  hardware: "Hardware",
  other: "Sonstiges",
};

const CRITICALITY: Record<string, string> = {
  low: "Gering",
  normal: "Normal",
  high: "Hoch",
  critical: "Kritisch",
};

const TOOL_CATEGORY: Record<string, string> = {
  ai: "KI",
  production: "Produktion",
  finance: "Finanzen",
  infra: "Infrastruktur",
  comms: "Kommunikation",
  legal: "Recht",
  other: "Sonstiges",
};

const TOOL_STATUS: Record<string, string> = {
  active: "Aktiv",
  evaluating: "In Prüfung",
  paused: "Pausiert",
  cancelled: "Gekündigt",
};

const BILLING_CYCLE: Record<string, string> = {
  monthly: "monatlich",
  yearly: "jährlich",
  usage: "nach Verbrauch",
  "one-off": "einmalig",
};

const TASK_STATUS: Record<string, string> = {
  open: "Offen",
  "in progress": "Läuft",
  blocked: "Blockiert",
  done: "Erledigt",
};

const TASK_PRIORITY: Record<string, string> = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
};

/** Ein gemeinsamer Vorrat für Status-Badges, die den Kontext nicht kennen. */
const ANY_STATUS: Record<string, string> = {
  ...PROJECT_STATUS,
  ...OFFER_STATUS,
  ...INVOICE_STATUS,
  ...VENTURE_STATUS,
  ...PERSON_STATUS,
  ...CONTRACT_STATUS,
  ...TOOL_STATUS,
  ...TASK_STATUS,
  ...CRITICALITY,
};

const lookup = (table: Record<string, string>, value: string | null | undefined) =>
  value ? (table[value] ?? value) : "—";

export const de = {
  projectStatus: (v?: string | null) => lookup(PROJECT_STATUS, v),
  projectType: (v?: string | null) => lookup(PROJECT_TYPE, v),
  offerStatus: (v?: string | null) => lookup(OFFER_STATUS, v),
  invoiceStatus: (v?: string | null) => lookup(INVOICE_STATUS, v),
  ventureKind: (v?: string | null) => lookup(VENTURE_KIND, v),
  ventureStatus: (v?: string | null) => lookup(VENTURE_STATUS, v),
  personType: (v?: string | null) => lookup(PERSON_TYPE, v),
  personStatus: (v?: string | null) => lookup(PERSON_STATUS, v),
  contractType: (v?: string | null) => lookup(CONTRACT_TYPE, v),
  contractStatus: (v?: string | null) => lookup(CONTRACT_STATUS, v),
  credentialCategory: (v?: string | null) => lookup(CREDENTIAL_CATEGORY, v),
  criticality: (v?: string | null) => lookup(CRITICALITY, v),
  toolCategory: (v?: string | null) => lookup(TOOL_CATEGORY, v),
  toolStatus: (v?: string | null) => lookup(TOOL_STATUS, v),
  billingCycle: (v?: string | null) => lookup(BILLING_CYCLE, v),
  taskStatus: (v?: string | null) => lookup(TASK_STATUS, v),
  taskPriority: (v?: string | null) => lookup(TASK_PRIORITY, v),
  /** Für Badges, die nur einen Wert bekommen und nicht wissen, woher er stammt. */
  anyStatus: (v?: string | null) => lookup(ANY_STATUS, v),
};
