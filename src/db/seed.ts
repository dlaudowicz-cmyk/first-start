import { randomUUID } from "node:crypto";
import { db } from "./index";
import {
  users,
  projects,
  curriculumModules,
  tools,
  workshopDays,
  workshopDayModules,
  versions,
} from "./schema";

const id = () => randomUUID();

// Source: Übergabedokument §6/§7 — module titles, hour split and goals.
const MODULES = [
  {
    number: 1,
    title: "Grundlagen generativer KI",
    hours: 30,
    theoryShare: 0.6,
    summary: "Funktionsweise, Möglichkeiten und Grenzen generativer Systeme, Cloud-Plattformen professionell nutzen.",
    goal: "Teilnehmende verstehen, wie generative KI-Systeme funktionieren und wo sie in der Medienproduktion sinnvoll einsetzbar sind.",
    qualificationContent: "Funktionsprinzipien von Sprach-, Bild- und Videomodellen; Cloud-Plattformen und Account-Verwaltung; typische Fehlerbilder und Grenzen generativer Systeme.",
    applicationCompetence: "Teilnehmende ordnen ein Medienproduktions-Briefing korrekt einem oder mehreren cloudbasierten KI-Werkzeugen zu.",
    practicalTask: "Erstellung einer kurzen Einsatzfeld-Analyse: Für ein vorgegebenes Briefing wird begründet, welche generativen Werkzeuge in welcher Produktionsphase sinnvoll sind.",
    learningResult: "Schriftliche Einsatzfeld-Analyse mit Tool-Zuordnung je Produktionsphase.",
    assessment: "Bewertete Einsatzfeld-Analyse (schriftlich).",
    teachingMethods: "Impulsvortrag, geführte Live-Demo, Einzelarbeit",
    tools: "Gemini, ChatGPT",
  },
  {
    number: 2,
    title: "Prompting und Produktionssteuerung",
    hours: 40,
    theoryShare: 0.3,
    summary: "Strukturierte Prompts, Referenzarbeit, Dokumentation von Varianten, Sprachmodelle zur Produktionsplanung.",
    goal: "Teilnehmende entwickeln strukturierte, wiederverwendbare Prompts und setzen Sprachmodelle zur Produktionssteuerung ein.",
    qualificationContent: "Prompt-Struktur (Rolle, Kontext, Referenz, Format); Referenzbilder und -texte gezielt einsetzen; Versionierung und Dokumentation von Prompt-Varianten.",
    applicationCompetence: "Teilnehmende entwickeln iterativ eine dokumentierte Prompt-Bibliothek für ein konkretes Projekt.",
    practicalTask: "Erarbeitung einer Prompt-Dokumentation mit mindestens 10 getesteten und bewerteten Varianten für ein Teamprojekt.",
    learningResult: "Prompt-Dokumentation mit Varianten, Bewertung und Produktionsplan-Auszug.",
    assessment: "Abgabe und Kurzpräsentation der Prompt-Dokumentation.",
    teachingMethods: "Werkstattarbeit, Peer-Feedback, Live-Demo",
    tools: "Gemini, ChatGPT",
  },
  {
    number: 3,
    title: "Generative Bildproduktion",
    hours: 60,
    theoryShare: 0.25,
    summary: "Einzelbilder und Bildserien, Charakter-/Produkt-/Raumkonsistenz, Bildbearbeitung, Keyframes für Video.",
    goal: "Teilnehmende erzeugen konsistente Bildserien und bereiten Keyframes für die Videoproduktion vor.",
    qualificationContent: "Text-to-Image und Image-to-Image; Techniken für Charakter-, Produkt- und Raumkonsistenz; Bildbearbeitung und -erweiterung; Vorbereitung von Keyframes.",
    applicationCompetence: "Teilnehmende erzeugen eine konsistente Bildserie, die als Grundlage für eine Videoproduktion dient.",
    practicalTask: "Produktion einer konsistenten Bildserie (Key Visual + Storyboard-Frames + Start-/Endbilder) zu einem eigenen Briefing.",
    learningResult: "Konsistente Bildserie inkl. Keyframes für die Videoproduktion.",
    assessment: "Bewertung der Bildserie nach Konsistenz, Bildqualität und Briefing-Treue.",
    teachingMethods: "Live-Demo, praktische Übung, Gruppenfeedback",
    tools: "Nano Banana",
  },
  {
    number: 4,
    title: "Generative Videoproduktion",
    hours: 70,
    theoryShare: 0.25,
    summary: "Text-to-Video und Image-to-Video, Kamerabewegung, Performance-Steuerung, Fehlerbilder, konsistente Sequenzen.",
    goal: "Teilnehmende erzeugen konsistente Videosequenzen und steuern Kamera- und Objektbewegung gezielt.",
    qualificationContent: "Text-to-Video und Image-to-Video; Steuerung von Kamera- und Objektbewegung; First-Frame/Last-Frame-Technik; Erkennen und Beheben typischer Fehlerbilder.",
    applicationCompetence: "Teilnehmende erzeugen aus einer Bildserie eine konsistente, produktionsreife Videosequenz.",
    practicalTask: "Erzeugung mehrerer verwendbarer Video-Shots aus den Keyframes aus Lernbereich 3, inkl. Iteration bei Fehlerbildern.",
    learningResult: "Mehrere produktionsreife Video-Shots für die Postproduktion.",
    assessment: "Bewertung der Shot-Auswahl nach Konsistenz und technischer Sauberkeit.",
    teachingMethods: "Live-Demo, praktische Übung, Shot-Review",
    tools: "Veo",
  },
  {
    number: 5,
    title: "Audio, Sprache und Musik",
    hours: 30,
    theoryShare: 0.3,
    summary: "KI-Stimmen, Sprecherbriefings, Musik- und Sounddesign, Tonfassungen mischen und exportieren.",
    goal: "Teilnehmende erstellen und mischen KI-gestützte Sprach-, Musik- und Soundfassungen.",
    qualificationContent: "KI-Stimmerzeugung und Sprecherbriefing; Musikgenerierung und Sounddesign; Grundlagen der Tonmischung und des Exports.",
    applicationCompetence: "Teilnehmende erstellen eine vollständige, gemischte Tonfassung zu einem Videoprojekt.",
    practicalTask: "Vertonung des eigenen Videoprojekts mit KI-Stimme, Musik und Sounddesign inkl. Mischung.",
    learningResult: "Gemischte, exportierte Tonfassung des Videoprojekts.",
    assessment: "Bewertung der Tonfassung nach Verständlichkeit, Mischung und Stimmigkeit.",
    teachingMethods: "Live-Demo, praktische Übung",
    tools: "ElevenLabs, Suno",
  },
  {
    number: 6,
    title: "Schnitt und Postproduktion",
    hours: 45,
    theoryShare: 0.2,
    summary: "Medien organisieren, schneiden, angleichen, Farbkorrektur, Tonmischung, Masterexport.",
    goal: "Teilnehmende schneiden generierte Medien zu einer konsistenten Masterfassung zusammen.",
    qualificationContent: "Medienorganisation; Schnitttechnik und Timing; Farbkorrektur und Bildangleichung; Tonmischung; Masterexport-Formate.",
    applicationCompetence: "Teilnehmende schneiden generierte Bild-, Video- und Tonelemente zu einer konsistenten Masterfassung zusammen.",
    practicalTask: "Schnitt der generierten Shots und Tonfassung zu einer exportierten Masterfassung des Teamprojekts.",
    learningResult: "Exportierte Masterfassung (Rohschnitt) des Teamprojekts.",
    assessment: "Bewertung der Masterfassung nach Schnitttechnik, Bildangleichung und Tonmischung.",
    teachingMethods: "Live-Demo, praktische Übung, Gruppenarbeit",
    tools: "DaVinci Resolve, Premiere Pro, Frame.io",
  },
  {
    number: 7,
    title: "Konzeption, Storytelling und Dramaturgie",
    hours: 35,
    theoryShare: 0.4,
    summary: "Briefinganalyse, Treatments, Storyboards, dramaturgische Planung kurzer Formate, Generierbarkeit bewerten.",
    goal: "Teilnehmende entwickeln aus einem Briefing ein generierbares, dramaturgisch tragfähiges Konzept.",
    qualificationContent: "Briefinganalyse; Treatment- und Storyboard-Entwicklung; Dramaturgie kurzer Formate; Bewertung der Generierbarkeit von Ideen.",
    applicationCompetence: "Teilnehmende entwickeln aus einem Kundenbriefing ein dramaturgisch tragfähiges, mit KI-Werkzeugen umsetzbares Konzept.",
    practicalTask: "Erstellung eines Treatments und Storyboards für ein kurzes Format auf Basis eines vorgegebenen Briefings.",
    learningResult: "Treatment und Storyboard für ein generierbares Kurzformat.",
    assessment: "Bewertung von Treatment und Storyboard nach dramaturgischer Tragfähigkeit und Generierbarkeit.",
    teachingMethods: "Werkstattarbeit, Gruppendiskussion",
    tools: "Gemini, ChatGPT",
  },
  {
    number: 8,
    title: "Produktionsplanung und Projektmanagement",
    hours: 30,
    theoryShare: 0.5,
    summary: "Workflows planen, Kosten kalkulieren, Risiken bewerten, Kundenkommunikation, Dokumentation.",
    goal: "Teilnehmende planen und kalkulieren eine KI-gestützte Medienproduktion end-to-end.",
    qualificationContent: "Workflow-Planung für KI-gestützte Produktionen; Kostenkalkulation (Credits, Lizenzen, Zeit); Risikobewertung; Kundenkommunikation; Produktionsdokumentation.",
    applicationCompetence: "Teilnehmende erstellen einen belastbaren Produktionsplan inkl. Kosten- und Risikoabschätzung für ein KI-gestütztes Projekt.",
    practicalTask: "Erstellung eines Produktionsplans mit Kostenkalkulation und Risikobewertung für das Abschlussprojekt.",
    learningResult: "Schriftlicher Produktionsplan mit Kostenkalkulation und Risikobewertung.",
    assessment: "Bewertung des Produktionsplans nach Vollständigkeit und Plausibilität.",
    teachingMethods: "Impulsvortrag, Einzelarbeit, Feedback-Runde",
    tools: "",
  },
  {
    number: 9,
    title: "Recht, Ethik und Qualitätssicherung",
    hours: 25,
    theoryShare: 0.7,
    summary: "Urheber-, Marken- und Persönlichkeitsrechte, Datenschutz, Deepfakes/Manipulation, Prüfprozesse.",
    goal: "Teilnehmende erkennen rechtliche und ethische Risiken generierter Inhalte und wenden Prüfprozesse an.",
    qualificationContent: "Urheber-, Marken- und Persönlichkeitsrecht bei generierten Inhalten; Datenschutz; Deepfakes und Manipulation; strukturierte Prüfprozesse vor Veröffentlichung.",
    applicationCompetence: "Teilnehmende führen eine strukturierte rechtliche und ethische Prüfung eines generierten Medienprodukts durch.",
    practicalTask: "Durchführung einer rechtlichen Fallanalyse für ein vorgegebenes, generiertes Medienbeispiel.",
    learningResult: "Schriftliche rechtliche Fallanalyse mit Prüfergebnis und Handlungsempfehlung.",
    assessment: "Bewertung der Fallanalyse nach fachlicher Richtigkeit und Vollständigkeit.",
    teachingMethods: "Impulsvortrag, Fallstudienarbeit, Diskussion",
    tools: "",
  },
  {
    number: 10,
    title: "Abschlussproduktion und Prüfung",
    hours: 35,
    theoryShare: 0.1,
    summary: "Vollständige KI-gestützte Medienproduktion, Konzept/Generierung/Postproduktion/Dokumentation, Präsentation, Fachgespräch.",
    goal: "Teilnehmende setzen eine vollständige KI-gestützte Medienproduktion um und verteidigen sie im Fachgespräch.",
    qualificationContent: "Integration aller vorherigen Lernbereiche in einer vollständigen Produktion; Präsentationstechnik; Fachgesprächsführung.",
    applicationCompetence: "Teilnehmende setzen Konzept, Generierung, Postproduktion und rechtliche Prüfung eigenständig zu einer präsentierbaren Abschlussproduktion um.",
    practicalTask: "Umsetzung einer vollständigen KI-gestützten Abschlussproduktion inkl. Dokumentation und Präsentation.",
    learningResult: "Fertige Abschlussproduktion inkl. Produktionsdokumentation.",
    assessment: "Praktische Prüfung: Abschlussproduktion, Präsentation und Fachgespräch.",
    teachingMethods: "Projektarbeit, Präsentation, Fachgespräch",
    tools: "Nano Banana, Veo, DaVinci Resolve",
  },
];

// Source: §5.6 — priority tool list, first workshop focus: Nano Banana, Veo, Gemini.
const TOOLS = [
  { name: "Gemini", provider: "Google", category: "Sprachmodell", purpose: "Konzeption, Recherche, Produktionsplanung", pricing: "bezahlt", commercialUse: "ja", minAge: 13, status: "aktiv" as const },
  { name: "Nano Banana", provider: "Google", category: "Bildgenerierung", purpose: "Bildserien, Charakterkonsistenz, Keyframes", pricing: "bezahlt", commercialUse: "ja", minAge: 13, status: "aktiv" as const },
  { name: "Veo", provider: "Google", category: "Videogenerierung", purpose: "Text-to-Video, Image-to-Video", pricing: "bezahlt", commercialUse: "ja", minAge: 18, status: "aktiv" as const },
  { name: "ChatGPT", provider: "OpenAI", category: "Sprachmodell", purpose: "Konzeption, Recherche, Textarbeit", pricing: "bezahlt", commercialUse: "ja", minAge: 13, status: "aktiv" as const },
  { name: "Adobe Creative Cloud", provider: "Adobe", category: "Postproduktion", purpose: "Schnitt, Bildbearbeitung, Layout", pricing: "bezahlt", commercialUse: "ja", minAge: 18, status: "aktiv" as const },
  { name: "DaVinci Resolve", provider: "Blackmagic Design", category: "Postproduktion", purpose: "Schnitt, Farbkorrektur, Ton", pricing: "kostenlos/bezahlt", commercialUse: "ja", minAge: 18, status: "aktiv" as const },
  { name: "Premiere Pro", provider: "Adobe", category: "Postproduktion", purpose: "Schnitt", pricing: "bezahlt", commercialUse: "ja", minAge: 18, status: "aktiv" as const },
  { name: "ElevenLabs", provider: "ElevenLabs", category: "Audio", purpose: "KI-Stimmen, Sprachsynthese", pricing: "bezahlt", commercialUse: "ja", minAge: 18, status: "aktiv" as const },
  { name: "Suno", provider: "Suno", category: "Audio", purpose: "Musikgenerierung", pricing: "bezahlt", commercialUse: "ja", minAge: 18, status: "aktiv" as const },
  { name: "Frame.io", provider: "Adobe", category: "Kollaboration", purpose: "Review, Freigabe, Assetverwaltung", pricing: "bezahlt", commercialUse: "ja", minAge: 18, status: "aktiv" as const },
];

// Source: §8 — 5-Tage-Workshop 04.01.-08.01.2027, ~40 Unterrichtsstunden.
const WORKSHOP_DAYS = [
  { dayNumber: 1, title: "Grundlagen, Briefing und Prompting", goal: "Konzept- und Prompt-Grundlage für ein Teamprojekt erarbeiten.", hours: 8, theory: "Was generative KI leistet, Grenzen und Fehlerbilder", liveDemo: "Briefinganalyse und Prompt-Struktur live vorgeführt", exercise: "Erste Bildtests mit eigenen Prompts", groupTask: "Briefing für Teamprojekt analysieren", output: "Konzept und Prompt-Grundlage für ein Teamprojekt", tools: "Gemini", homework: "Referenzmaterial für eigenes Projekt sichten", moduleNumbers: [1, 2, 7] },
  { dayNumber: 2, title: "Bildentwicklung mit Nano Banana", goal: "Visuelle Bildwelt und Key Visual für das Teamprojekt erzeugen.", hours: 8, theory: "Text-to-Image, Image-to-Image, Konsistenzprinzipien", liveDemo: "Character-, Produkt- und Raumkonsistenz live erzeugen", exercise: "Bildbearbeitung und Keyframes", groupTask: "Storyboard-Frames als Team erstellen", output: "Key Visual, Storyboard-Frames, Start-/Endbilder", tools: "Nano Banana", homework: "Bildserie für Tag 3 vorbereiten", moduleNumbers: [3] },
  { dayNumber: 3, title: "Videogenerierung mit Veo", goal: "Mehrere verwendbare Video-Shots aus den Keyframes erzeugen.", hours: 8, theory: "Image-to-Video, Kamera- und Objektbewegung, Performance", liveDemo: "First Frame/Last Frame, Fehlersuche und Iteration", exercise: "Eigene Shots generieren und iterieren", groupTask: "Shot-Liste als Team abarbeiten", output: "Mehrere verwendbare Shots", tools: "Veo", homework: "Shots sichten und Auswahl treffen", moduleNumbers: [4] },
  { dayNumber: 4, title: "Schnitt, Ton und Fertigstellung", goal: "Rohfassung des Teamfilms fertigstellen.", hours: 8, theory: "Schnittlogik, Timing, Farbangleichung", liveDemo: "Musik, Sprache und Sounddesign einbinden", exercise: "Rohschnitt am eigenen Projekt", groupTask: "Team schneidet gemeinsame Rohfassung", output: "Rohfassung des Teamfilms", tools: "DaVinci Resolve, ElevenLabs, Suno", homework: "Feedback zur Rohfassung einholen", moduleNumbers: [5, 6] },
  { dayNumber: 5, title: "Finalisierung und Präsentation", goal: "30-60-sekündigen Abschlussfilm präsentieren.", hours: 8, theory: "Qualitätskontrolle, rechtliche Prüfung vor Veröffentlichung", liveDemo: "Feinschnitt und Tonmischung", exercise: "Export und letzte Korrekturen", groupTask: "Präsentation vorbereiten und vortragen", output: "30- bis 60-sekündiger Abschlussfilm", tools: "DaVinci Resolve", homework: "-", moduleNumbers: [6, 9, 10] },
];

export async function seed() {
  const danielId = id();
  await db.insert(users).values([
    { id: danielId, name: "Daniel Laudowicz", email: "dlaudowicz@googlemail.com", role: "admin" },
  ]);

  const projectId = id();
  await db.insert(projects).values({
    id: projectId,
    title: "AI Creator – Professional Certificate",
    subtitle: "Generative AI for Film, Television & Media",
    institution: "Fernseh Akademie Mitteldeutschland",
    owner: danielId,
    status: "in_bearbeitung",
    targetHours: 400,
    startDate: "2027-01-04",
    description:
      "Cloud-First-Weiterbildung für AI Generated Content in Film, Fernsehen und Medien. Kompetenzorientiertes Curriculum, abgeleiteter 5-Tage-Intensivworkshop, Abstimmung mit der IHK zu Leipzig geplant.",
  });

  const moduleIdByNumber = new Map<number, string>();
  for (const [i, m] of MODULES.entries()) {
    const moduleId = id();
    moduleIdByNumber.set(m.number, moduleId);
    await db.insert(curriculumModules).values({
      id: moduleId,
      projectId,
      number: m.number,
      title: m.title,
      summary: m.summary,
      hoursTotal: m.hours,
      hoursTheory: Math.round(m.hours * m.theoryShare),
      hoursPractice: m.hours - Math.round(m.hours * m.theoryShare),
      learningGoal: m.goal,
      qualificationContent: m.qualificationContent,
      applicationCompetence: m.applicationCompetence,
      practicalTask: m.practicalTask,
      learningResult: m.learningResult,
      assessment: m.assessment,
      teachingMethods: m.teachingMethods,
      tools: m.tools,
      status: "freigegeben",
      orderIndex: i,
    });
  }

  await db.insert(tools).values(TOOLS.map((t) => ({ id: id(), ...t })));

  for (const w of WORKSHOP_DAYS) {
    const dayId = id();
    await db.insert(workshopDays).values({
      id: dayId,
      projectId,
      dayNumber: w.dayNumber,
      title: w.title,
      goal: w.goal,
      hours: w.hours,
      theory: w.theory,
      liveDemo: w.liveDemo,
      exercise: w.exercise,
      groupTask: w.groupTask,
      output: w.output,
      requiredTools: w.tools,
      requiredAccounts: `${w.tools}-Zugang je Teilnehmer`,
      requiredHardware: "Laptop, 16GB+ RAM, Kopfhörer, stabiles Internet",
      homework: w.homework,
    });
    for (const num of w.moduleNumbers) {
      const modId = moduleIdByNumber.get(num);
      if (modId) {
        await db.insert(workshopDayModules).values({ workshopDayId: dayId, moduleId: modId });
      }
    }
  }

  await db.insert(versions).values({
    id: id(),
    projectId,
    versionNumber: 1,
    label: "Initialer Entwurf (Seed)",
    status: "entwurf",
    createdBy: danielId,
    snapshot: JSON.stringify({ note: "Initial seed from Übergabedokument, Juli 2026" }),
    changeLog: "Projekt aus Übergabedokument angelegt.",
  });
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log("Seed complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
