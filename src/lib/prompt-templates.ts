export type PromptTemplate = {
  id: string;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  build: (input: string) => string;
};

const sys = "You are a senior producer at Pushlabs, an AI-native cinematic production company. Tone: premium, cinematic, clean, minimal.";

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "offer-from-notes",
    title: "Generate offer from rough notes",
    description: "Turn loose notes into a structured client offer with line items, pricing tiers and German payment terms.",
    inputLabel: "Rough notes",
    inputPlaceholder:
      "e.g. 3 day shoot Berlin, 1 director, AI postproduction, 4 cutdowns, deliver in 4 weeks…",
    build: (input) => `${sys}

Generate a clean, professional offer for the client based on the rough notes below.

Return:
- 1-paragraph project summary
- structured line items (description, quantity, unit, unit price in EUR)
- net total, 19% VAT, gross total
- payment terms ("Zahlbar innerhalb 14 Tagen ohne Abzug.")
- 14 days validity
- a short closing sentence inviting questions

Rough notes:
"""
${input.trim() || "<paste notes>"}
"""`,
  },
  {
    id: "invoice-from-spoken",
    title: "Generate invoice from spoken notes",
    description: "Transform a transcribed voice note into a tidy invoice draft with line items.",
    inputLabel: "Transcribed voice note",
    inputPlaceholder:
      "e.g. send invoice to Aurora for the May shoot, 4 days at 9800 each, plus 12k AI post…",
    build: (input) => `${sys}

Turn the spoken notes below into an invoice draft.

Return JSON only with this exact shape:
{
  "client": "<company name guess>",
  "items": [
    { "description": "...", "quantity": 1, "unit": "Pauschale|Tag|Stk.", "unitPrice": 0 }
  ],
  "vatRate": 19,
  "paymentTerms": "Zahlbar innerhalb 14 Tagen ohne Abzug.",
  "notes": null
}

Spoken notes:
"""
${input.trim() || "<paste notes>"}
"""`,
  },
  {
    id: "shooting-schedule",
    title: "Generate shooting schedule",
    description: "Day-by-day shooting plan from a brief — call times, scenes, locations, crew, gear.",
    inputLabel: "Project brief",
    inputPlaceholder:
      "e.g. 3-day automotive shoot, Mojave + studio, hero car beauty + driving + interiors…",
    build: (input) => `${sys}

Produce a detailed shooting schedule for the project below.

Return a markdown table per shoot day with:
| Time | Scene | Description | Location | Cast/Crew | Equipment |

Add a short pre-production checklist at the top and a wrap-up summary at the end.

Brief:
"""
${input.trim() || "<paste brief>"}
"""`,
  },
  {
    id: "storyboard",
    title: "Generate storyboard",
    description: "Shot-by-shot storyboard outline with framing, camera move and visual mood notes.",
    inputLabel: "Concept / treatment",
    inputPlaceholder:
      "e.g. 60s reveal film for an electric car launch, cinematic golden hour, mix live action + AI environments…",
    build: (input) => `${sys}

Create a 12–18 shot storyboard outline based on the treatment below.

For each shot return:
- Shot number
- Framing (ECU/CU/MS/WS/EWS)
- Camera move (static, push-in, dolly, drone, gimbal, etc.)
- Action / subject
- Lighting & mood
- Sound / music cue

Treatment:
"""
${input.trim() || "<paste treatment>"}
"""`,
  },
  {
    id: "linkedin-post",
    title: "Generate LinkedIn post",
    description: "Premium-tone LinkedIn post for case studies, project launches or BTS reels.",
    inputLabel: "What's the post about?",
    inputPlaceholder:
      "e.g. just wrapped Aurora EV-7 reveal film, mixed live action + AI, 4 days Mojave, big team effort…",
    build: (input) => `${sys}

Write a LinkedIn post in Pushlabs voice — premium, cinematic, confident, never hype-y.

Constraints:
- 4–7 short paragraphs
- one strong opening hook
- specific craft details (camera/lens/lighting/AI tooling) where useful
- end with a quiet, considered call-to-action
- no emoji clutter

Topic:
"""
${input.trim() || "<describe the post topic>"}
"""`,
  },
  {
    id: "client-email",
    title: "Generate client email",
    description: "Polished email — onboarding, follow-up, scope discussion, payment reminders.",
    inputLabel: "Context",
    inputPlaceholder:
      "e.g. follow-up to Helix after kickoff call, propose 2 dates for shoot, ask for legal sign-off on lab access…",
    build: (input) => `${sys}

Write a client email matching Pushlabs voice — calm, precise, premium, German if the recipient is German, otherwise English. Mirror the recipient's language.

Include:
- subject line
- greeting
- 2–4 short paragraphs
- one clear next-step ask
- sign-off as "Daniel Laudowicz · Pushlabs"

Context:
"""
${input.trim() || "<describe the email context>"}
"""`,
  },
  {
    id: "qc-ki-schritt",
    title: "QC-Gate nach KI-Schritt",
    description:
      "Prüfprotokoll nach jedem KI-Schritt der Color Pipeline — Framecount, Retiming, Duplikate, Null-Test.",
    inputLabel: "Was wurde gemacht?",
    inputPlaceholder:
      "z.B. Shot 042, Plate 96 Frames inkl. Handles, durch LTX lokal, Output 16bit PNG-Seq, 94 Frames zurück…",
    build: (input) => `${sys}

Du prüfst einen KI-Schritt in der Masterclass Color Pipeline (Timor Kardum, V2).
Arbeite das QC-Gate ab und melde jeden Punkt einzeln als BESTANDEN / FEHLER / UNKLAR.

Pipeline-Regeln, gegen die geprüft wird:
- Handles: 10 Frames je Seite
- Plate inkl. Handles ≥ 3 s @ 24 fps
- PNG 16-bit · MP4 > 50 Mbit · Native-Rez + 4K
- Viewing: BT.1886
- Shots > 30 s sind gechunkt (Seedance 2.5 Max-Länge) + Frame-Bridging

QC-Gate:
1. Framecount — Output gegen Plate. Jede Abweichung ist ein Fehler, auch ±1.
2. Retiming — keine ungewollte Geschwindigkeitsänderung. Prüfe Bewegungsphasen an einem eindeutigen Motiv.
3. Duplikate — keine wiederholten oder ausgelassenen Frames, besonders an Chunk-Grenzen.
4. Null-Test — auf einem unveränderten Frame: geht Rec709 rein und Rec709 identisch raus?
5. Bittiefe — ist irgendwo eine 8-bit- oder MP4-Zwischenstufe entstanden, die später gegradet wird?
6. Chunk-Zuordnung — falls gechunkt: sind alle Teile eindeutig auf den Ursprungs-Shot rückführbar?

Gib zusätzlich an:
- welche Prüfung sich nicht aus den Angaben beantworten lässt und welche Information dafür fehlt
- eine konkrete nächste Aktion pro Fehler, keine allgemeinen Hinweise

Durchgeführter Schritt:
"""
${input.trim() || "<Schritt beschreiben: Shot, Plate-Länge, Tool, Modell, Ein- und Ausgabeformat>"}
"""`,
  },
  {
    id: "qc-master-abnahme",
    title: "QC Master-Abnahme",
    description:
      "Abnahmeprotokoll vor Freigabe des SDR- bzw. HDR-Masters — inklusive Grain-Konsistenz zwischen beiden Pfaden.",
    inputLabel: "Was liegt zur Abnahme vor?",
    inputPlaceholder:
      "z.B. SDR Master Rec709, 42 Shots, davon 12 über Upscale-Zweig und 8 über Nuke-Comp, Rest ungetoucht…",
    build: (input) => `${sys}

Du nimmst einen Master aus der Masterclass Color Pipeline (Timor Kardum, V2) ab.
Melde jeden Punkt als BESTANDEN / FEHLER / UNKLAR mit Begründung.

Kritische Punkte dieser Pipeline:

1. GRAIN-KONSISTENZ (häufigster Fehler)
   Der Upscale-Zweig (KI via API → Topaz → Conform) hat KEIN Re-Grain.
   Der Compositing-Zweig (KI lokal → Nuke) hat eins.
   Laufen beide in dieselbe Timeline, stehen KI-geglättete Shots neben re-gekörnten.
   Das fällt im Schnitt als Schnittfehler auf, nicht als Grainfehler.
   → Prüfe Shot für Shot, über welchen Zweig er kam, und ob die Textur zum Nachbarshot passt.

2. BITTIEFE
   „KI via API" liefert Stills als 8-bit PNG. Prüfe auf Banding in Himmel,
   Hautübergängen und weichen Lichtabfällen — dort zuerst.

3. CHROMA
   MP4-Zwischenstufen bringen 4:2:0. Prüfe gesättigte Kanten und Rot-/Blauflächen
   auf ausgefranste Chroma-Übergänge.

4. VIEWING
   Wurde tatsächlich auf BT.1886 abgenommen?

5. HDR-PASS (falls gefahren)
   Der SDR→HDR-Weg ist inverses Tone-Mapping aus einem SDR-Master.
   Prüfe Spitzlichter auf Clipping-Artefakte und unnatürliche Highlight-Rolloffs.

6. VOLLSTÄNDIGKEIT
   Framecount des Masters gegen die Schnittliste. Handles korrekt abgeschnitten.

Nenne am Ende die Shots, die vor Freigabe zwingend nachbearbeitet werden müssen,
getrennt von denen, die nur beobachtet werden sollten.

Zur Abnahme vorgelegt:
"""
${input.trim() || "<Master beschreiben: Fassung, Shot-Anzahl, welche Shots über welchen Zweig kamen>"}
"""`,
  },
  {
    id: "ai-video-prompt",
    title: "Generate AI video prompt",
    description: "Detailed text prompt for an AI video model (Veo / Runway / Sora-class).",
    inputLabel: "Scene / shot you want to generate",
    inputPlaceholder:
      "e.g. golden-hour aerial pull-back over an electric SUV crossing a salt flat, dust trail, ambient cinematic…",
    build: (input) => `${sys}

Craft a single, detailed AI video generation prompt. Use precise cinematographic language.

Required elements:
- subject + action
- camera (lens, move, framing)
- lighting (time of day, source, mood)
- environment (location, atmosphere, weather)
- color palette / film stock reference
- pacing / shot duration
- audio cue (if relevant)
- negative prompt at the end ("Avoid: …")

Scene:
"""
${input.trim() || "<describe the shot>"}
"""

Return only the final prompt, no commentary.`,
  },
];
