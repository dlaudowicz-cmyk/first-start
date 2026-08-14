/**
 * Production pipelines — the technical standards a project runs on.
 *
 * Like `spesen-rates.ts` and `project-files.ts`, this is the single place the
 * standard is defined; projects reference a pipeline by key.
 *
 * IMPORTANT: `source` distinguishes what came from the authored specification
 * from what the OS proposes on top of it. Never silently merge the two — when
 * the spec is revised, the reviewer has to be able to tell them apart.
 */

export type SourceKind = "spec" | "recommendation";

export type PipelineRule = { label: string; value: string };

export type PipelineStage = {
  key: string;
  title: string;
  tool?: string;
  detail?: string[];
  /** Which branch of the pipeline this belongs to. */
  track: "source" | "graded" | "ungraded" | "master" | "future";
  optional?: boolean;
};

export type QcGate = {
  key: string;
  title: string;
  when: string;
  checks: string[];
  source: SourceKind;
};

export type OpenDecision = { question: string; options: string; note?: string };

export type Tradeoff = { title: string; detail: string };

export type Pipeline = {
  key: string;
  name: string;
  version: string;
  author: string;
  status: string;
  summary: string;
  rules: PipelineRule[];
  stages: PipelineStage[];
  qcGates: QcGate[];
  openDecisions: OpenDecision[];
  tradeoffs: Tradeoff[];
};

const colorPipelineV2: Pipeline = {
  key: "color-pipeline-v2",
  name: "Masterclass Color Pipeline",
  version: "V2",
  author: "Timor Kardum",
  status: "Stand: August 2026",
  summary:
    "Zwei Pfade ab Conform: graded Rec709 für die KI-Schritte, ungraded ACEScg-EXR als Negativ und Grain-Referenz. " +
    "Danach KI via API oder lokal, Upscale oder Nuke-Comp, zurück in Resolve auf SDR-Master, optional HDR.",

  rules: [
    { label: "Handles", value: "10 Frames je Seite" },
    { label: "Plate-Länge", value: "inkl. Handles ≥ 3 s @ 24 fps" },
    { label: "Export", value: "Native-Rez + 4K-Standard" },
    { label: "MP4", value: "> 50 Mbit" },
    { label: "PNG", value: "16-bit" },
    { label: "Viewing", value: "BT.1886" },
    { label: "Chunking", value: "Shots > 30 s splitten (Seedance 2.5 Max-Länge) + Frame-Bridging" },
  ],

  stages: [
    {
      key: "src-arri",
      title: "ARRI Alexa",
      track: "source",
      detail: ["ARRIRAW / LogC4", "native Rezs"],
    },
    {
      key: "src-ursa",
      title: "Blackmagic URSA Cine 17K",
      track: "source",
      detail: ["BRAW / Film Gen5", "native Rez"],
    },
    {
      key: "src-mobile",
      title: "iPhone / Android",
      track: "source",
      detail: ["Apple Log / Mobile-Log", "→ De-Log"],
    },
    {
      key: "conform",
      title: "Shot Pull / Conform",
      tool: "Resolve / Baselight",
      track: "source",
      detail: ["Handles-Logik anwenden"],
    },
    {
      key: "log-to-rec709",
      title: "Camera-Log → Rec709",
      track: "graded",
      detail: [
        "De-Log",
        "Show-LUT / Pre-Grade",
        "Pre-Grading",
        "Degrain NUR OPTIONAL (wenn ja: Profil sichern)",
        "CDL versioniert im Tracker",
      ],
    },
    {
      key: "plates-rec709",
      title: "Plates Rec709",
      track: "graded",
      detail: ["Degrain optional", "Native-Rez + 4K-Export", "PNG-Seq 16-bit", "MP4 > 50 Mbit"],
    },
    {
      key: "plate-processing",
      title: "Plate Processing (parallel)",
      track: "graded",
      detail: ["First · Middle · Last Frame → PNG", "Keyframe-Refs"],
    },
    {
      key: "ki-api",
      title: "KI via API",
      tool: "fal, Flux",
      track: "graded",
      detail: ["Still Output: 8-bit PNG", "Motion Output: MP4"],
    },
    {
      key: "ki-lokal",
      title: "KI lokal (ComfyUI)",
      tool: "LTX, Minimax, etc. · RTX 5090",
      track: "graded",
      detail: ["Output: 16-bit PNG-Seq"],
    },
    {
      key: "upscale",
      title: "Upscale",
      tool: "Topaz o. Modell",
      track: "graded",
      detail: ["Eingang: MP4", "Export: Rec709 ProRes4444"],
    },
    {
      key: "compositing",
      title: "alternativ: Compositing",
      tool: "Nuke",
      track: "graded",
      detail: ["Eingang: PNGs", "Cleanup", "Re-Grain", "Export: Rec709 ProRes4444"],
    },
    {
      key: "plates-ungraded",
      title: "Plates UNGRADED · mit Grain",
      track: "ungraded",
      detail: ["lineare EXR-Seq", "ACEScg · half-float", "= Negativ + Grain-Referenz", "→ Comp-Ref für Nuke"],
    },
    {
      key: "conform-grading",
      title: "Conform + Grading",
      tool: "Resolve",
      track: "master",
      detail: ["SDR Master Rec709"],
    },
    {
      key: "sdr-hdr",
      title: "SDR → HDR (lokal)",
      tool: "ComfyUI + LTX · Topaz o. anderes Modell",
      track: "master",
      optional: true,
    },
    {
      key: "hdr-grading",
      title: "HDR Grading Pass",
      track: "master",
      optional: true,
      detail: ["HDR Master (PQ)"],
    },
    {
      key: "aces-pipeline",
      title: "ACES-Pipeline (parallel)",
      track: "future",
      detail: ["ACEScg nativ auf EXR", "Tools noch nicht soweit"],
    },
    {
      key: "ki-exr",
      title: "KI nativ auf EXR",
      track: "future",
      detail: ["16-bit float"],
    },
    {
      key: "comp-grade-aces",
      title: "Comp + Grade in ACES",
      track: "future",
      detail: ["HDR nativ", "volle Latitude"],
    },
  ],

  qcGates: [
    {
      key: "qc-ki-schritt",
      title: "QC-Gate nach jedem KI-Schritt",
      when: "Nach jedem KI-Schritt, nicht erst am Ende",
      source: "spec",
      checks: [
        "Framecount gegen die Plate prüfen",
        "Retiming: keine ungewollte Geschwindigkeitsänderung",
        "Duplikate: keine wiederholten oder ausgelassenen Frames",
        "Null-Test auf einem unveränderten Frame",
      ],
    },
    {
      key: "qc-plate-export",
      title: "Plate-Freigabe vor dem KI-Schritt",
      when: "Bevor eine Plate an ein KI-Tool geht",
      source: "recommendation",
      checks: [
        "Handles vorhanden: 10 Frames je Seite",
        "Plate inkl. Handles ≥ 3 s @ 24 fps — kürzere Plates geben dem Modell zu wenig zeitlichen Kontext",
        "Bittiefe wie spezifiziert (PNG 16-bit)",
        "Bei Shots > 30 s: Chunk-Grenzen gesetzt und Frame-Bridging vorbereitet",
        "Chunk-Benennung eindeutig und rückführbar auf den Ursprungs-Shot",
      ],
    },
    {
      key: "qc-null-test-version",
      title: "Null-Test bei Modellwechsel wiederholen",
      when: "Pro Projekt und bei jeder Modell- oder API-Änderung",
      source: "recommendation",
      checks: [
        "Null-Test erneut fahren — API-Modelle werden serverseitig aktualisiert, ohne dass sich der Endpoint ändert",
        "Modellname und Version im Tracker festhalten",
        "Bei Abweichung: betroffene Shots markieren, nicht nur den neuen Shot prüfen",
      ],
    },
    {
      key: "qc-master",
      title: "Master-Abnahme",
      when: "Vor Freigabe des SDR- bzw. HDR-Masters",
      source: "recommendation",
      checks: [
        "Grain-Konsistenz zwischen beiden Pfaden: Upscale-Zweig hat kein Re-Grain, Nuke-Zweig hat eins — im selben Master fällt das als Schnittfehler auf",
        "Viewing-Standard BT.1886 beim Abnehmen tatsächlich aktiv",
        "Bittiefe: keine 8-bit-Zwischenstufe im finalen Grading-Pfad übersehen",
        "Chroma: keine 4:2:0-Artefakte aus MP4-Zwischenstufen im Master",
        "HDR-Pass (falls gefahren): inverse Tone-Mapping-Artefakte in Spitzlichtern",
      ],
    },
  ],

  openDecisions: [
    {
      question: "Show-LUT final",
      options: "ARRI Reveal vs. K1S1",
      note:
        "Empfehlung: Reveal. Bei gemischten Quellen (Alexa, URSA 17K, Mobile) ist die neutralere Basis leichter zu matchen; " +
        "K1S1 legt Kontrast und Wärme drauf, die beim Angleichen wieder herausgerechnet werden müssen.",
    },
    {
      question: "EXR-Kompression",
      options: "ZIP vs. DWAA",
      note:
        "Empfehlung: ZIP für die Plates. Die EXR-Sequenz ist ausdrücklich Negativ und Grain-Referenz — DWAA ist lossy und " +
        "greift genau das Hochfrequente an. DWAA/DWAB nur für Zwischenstände; bei Performance-Problemen ZIPS statt ZIP16.",
    },
    {
      question: "Degrain-Tool + Grain-Matching",
      options: "Neat Video / Resolve NR / Baselight / Nuke",
      note:
        "Empfehlung: Neat Video zum Profilieren (sampelt eine echte flache Fläche), Re-Grain in Nuke wegen der Kontrolle " +
        "über Korngröße und -verteilung. Wer die Kette in Resolve halten will, verliert beim Matching Genauigkeit.",
    },
  ],

  tradeoffs: [
    {
      title: "8-bit-Zwischenstufe im KI-API-Zweig",
      detail:
        "„KI via API“ liefert Stills als 8-bit PNG in eine sonst 16-bit-Kette. Alles, was danach gegradet wird, gradet auf " +
        "8 Bit — Banding-Risiko in Himmel, Hautübergängen und Lichtabfällen. Toolgrenze, kein Denkfehler: wenn die API " +
        "16 Bit kann, nehmen; sonst KI-Schritte vor das schwere Grading legen oder beim Export dithern.",
    },
    {
      title: "MP4 als Intermediate",
      detail:
        "Motion-Output kommt als MP4 und geht durch den Upscale in ProRes4444. Das backt h.264/265-Artefakte und " +
        "4:2:0-Chroma-Subsampling dauerhaft ein; > 50 Mbit hilft gegen Makroblöcke, nicht gegen 4:2:0. Wenn die API " +
        "Bildsequenzen kann, immer die nehmen — MP4 nur als Preview-Pfad.",
    },
    {
      title: "HDR aus dem SDR-Master",
      detail:
        "Der optionale SDR→HDR-Pass erbt die Grenzen des SDR-Masters. Der bessere HDR-Weg führt über den ungraded " +
        "EXR-Zweig — im Diagramm korrekt als [Zukunft] markiert, solange die Tools nicht soweit sind.",
    },
  ],
};

export const PIPELINES: Pipeline[] = [colorPipelineV2];

export function getPipeline(key: string | null | undefined): Pipeline | null {
  if (!key) return null;
  return PIPELINES.find((p) => p.key === key) ?? null;
}

export const TRACK_LABELS: Record<PipelineStage["track"], string> = {
  source: "Quellen & Conform",
  graded: "Graded — Rec709 (KI-Pfad)",
  ungraded: "Ungraded — ACEScg EXR (Negativ)",
  master: "Master",
  future: "Zukunft — noch nicht produktiv",
};
