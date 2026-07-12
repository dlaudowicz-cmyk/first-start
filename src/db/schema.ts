import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";

/**
 * Schema mirrors the data model in Übergabedokument §11 field-for-field.
 * SQLite/Drizzle today; the column types below map directly onto Postgres
 * types (integer->integer, text->text/enum, real->numeric) for a later
 * Supabase migration — see README "Migration path".
 */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", {
    enum: [
      "admin",
      "autor",
      "pruefer",
      "dozent",
      "leser",
      "academy_admin",
      "course_author",
      "instructor",
      "mentor",
      "teilnehmer",
      "corporate_manager",
      "alumni",
    ],
  })
    .notNull()
    .default("leser"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  institution: text("institution"),
  owner: text("owner").references(() => users.id),
  status: text("status", {
    enum: ["entwurf", "in_bearbeitung", "review", "freigegeben", "archiviert"],
  })
    .notNull()
    .default("entwurf"),
  targetHours: integer("target_hours").notNull().default(400),
  startDate: text("start_date"),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

export const curriculumModules = sqliteTable("curriculum_modules", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  hoursTotal: real("hours_total").notNull().default(0),
  hoursTheory: real("hours_theory").notNull().default(0),
  hoursPractice: real("hours_practice").notNull().default(0),
  learningGoal: text("learning_goal"),
  qualificationContent: text("qualification_content"),
  applicationCompetence: text("application_competence"),
  practicalTask: text("practical_task"),
  learningResult: text("learning_result"),
  assessment: text("assessment"),
  teachingMethods: text("teaching_methods"),
  tools: text("tools"),
  status: text("status", {
    enum: ["entwurf", "in_bearbeitung", "review", "freigegeben"],
  })
    .notNull()
    .default("entwurf"),
  version: integer("version").notNull().default(1),
  orderIndex: integer("order_index").notNull().default(0),
  notes: text("notes"),
  duplicateOfModuleId: text("duplicate_of_module_id"),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

export const curriculumTopics = sqliteTable("curriculum_topics", {
  id: text("id").primaryKey(),
  moduleId: text("module_id")
    .notNull()
    .references(() => curriculumModules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  required: integer("required", { mode: "boolean" }).notNull().default(true),
  notes: text("notes"),
});

export const tools = sqliteTable("tools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider"),
  category: text("category"),
  purpose: text("purpose"),
  pricing: text("pricing"),
  licenseModel: text("license_model"),
  commercialUse: text("commercial_use"),
  privacyNotes: text("privacy_notes"),
  minAge: integer("min_age"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  alternatives: text("alternatives"),
  status: text("status", { enum: ["aktiv", "veraltet", "ersetzt"] })
    .notNull()
    .default("aktiv"),
  lastReviewed: text("last_reviewed"),
});

export const workshopDays = sqliteTable("workshop_days", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  goal: text("goal"),
  hours: real("hours").notNull().default(0),
  theory: text("theory"),
  liveDemo: text("live_demo"),
  exercise: text("exercise"),
  groupTask: text("group_task"),
  output: text("output"),
  requiredTools: text("required_tools"),
  requiredAccounts: text("required_accounts"),
  requiredHardware: text("required_hardware"),
  homework: text("homework"),
  notes: text("notes"),
});

// n:m — a workshop day typically draws on several curriculum modules (see docs/CONCEPT-REVIEW.md §1)
export const workshopDayModules = sqliteTable(
  "workshop_day_modules",
  {
    workshopDayId: text("workshop_day_id")
      .notNull()
      .references(() => workshopDays.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => curriculumModules.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.workshopDayId, t.moduleId] })],
);

export const teachingMaterials = sqliteTable("teaching_materials", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").references(() => curriculumModules.id, {
    onDelete: "cascade",
  }),
  workshopDayId: text("workshop_day_id").references(() => workshopDays.id, {
    onDelete: "cascade",
  }),
  type: text("type"),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  version: integer("version").notNull().default(1),
  status: text("status", { enum: ["entwurf", "freigegeben"] })
    .notNull()
    .default("entwurf"),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  targetType: text("target_type", {
    enum: ["project", "module", "field", "workshop_day", "assessment", "export"],
  }).notNull(),
  targetId: text("target_id").notNull(),
  fieldName: text("field_name"),
  content: text("content").notNull(),
  status: text("status", {
    enum: ["offen", "in_bearbeitung", "erledigt", "abgelehnt"],
  })
    .notNull()
    .default("offen"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  resolvedAt: text("resolved_at"),
});

export const versions = sqliteTable("versions", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  label: text("label"),
  status: text("status", {
    enum: [
      "entwurf",
      "intern_geprueft",
      "fam_geprueft",
      "ihk_fassung",
      "freigegeben",
      "archiviert",
    ],
  })
    .notNull()
    .default("entwurf"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  snapshot: text("snapshot").notNull(),
  changeLog: text("change_log"),
});

// ---------------------------------------------------------------------------
// Online Academy (Übergabedokument §23-49, docs/ACADEMY-PLAN.md).
// Click-dummy scope: real schema/persistence, no auth — a single hardcoded
// demo learner stands in for a logged-in user (see academy/lib/role.ts).
// "Module" from §40 is renamed to courseModules here to avoid clashing with
// curriculumModules (see docs/ACADEMY-PLAN.md §2).
// ---------------------------------------------------------------------------

export const programs = sqliteTable("programs", {
  id: text("id").primaryKey(),
  curriculumVersionId: text("curriculum_version_id").references(() => versions.id),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  type: text("type", {
    enum: ["professional_certificate", "bootcamp", "masterclass", "micro_course", "corporate"],
  })
    .notNull()
    .default("professional_certificate"),
  status: text("status", { enum: ["entwurf", "buchbar", "aktiv", "archiviert"] })
    .notNull()
    .default("entwurf"),
  targetHours: integer("target_hours").notNull().default(0),
  certificateType: text("certificate_type"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  curriculumModuleId: text("curriculum_module_id").references(() => curriculumModules.id),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  estimatedHours: real("estimated_hours").notNull().default(0),
  status: text("status", { enum: ["entwurf", "freigegeben"] })
    .notNull()
    .default("entwurf"),
  publishedVersion: integer("published_version").notNull().default(1),
});

export const courseModules = sqliteTable("course_modules", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  estimatedMinutes: integer("estimated_minutes").notNull().default(0),
});

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  courseModuleId: text("course_module_id")
    .notNull()
    .references(() => courseModules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  lessonType: text("lesson_type", {
    enum: ["video", "text", "prompt_block", "assignment_brief"],
  })
    .notNull()
    .default("text"),
  content: text("content"),
  videoUrl: text("video_url"),
  estimatedMinutes: integer("estimated_minutes").notNull().default(0),
  required: integer("required", { mode: "boolean" }).notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  downloadsEnabled: integer("downloads_enabled", { mode: "boolean" }).notNull().default(true),
});

export const cohorts = sqliteTable("cohorts", {
  id: text("id").primaryKey(),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  capacity: integer("capacity"),
  status: text("status", {
    enum: ["geplant", "buchbar", "ausgebucht", "aktiv", "abgeschlossen", "archiviert"],
  })
    .notNull()
    .default("geplant"),
});

export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  cohortId: text("cohort_id").references(() => cohorts.id),
  status: text("status", { enum: ["eingeschrieben", "aktiv", "abgeschlossen", "abgebrochen"] })
    .notNull()
    .default("eingeschrieben"),
  enrolledAt: text("enrolled_at").notNull().default(sql`(current_timestamp)`),
  completedAt: text("completed_at"),
  certificateStatus: text("certificate_status", {
    enum: ["nicht_erreicht", "erreicht", "beantragt", "ausgestellt"],
  })
    .notNull()
    .default("nicht_erreicht"),
});

export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["offen", "in_bearbeitung", "abgeschlossen"] })
    .notNull()
    .default("offen"),
  completedAt: text("completed_at"),
});

export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assignmentType: text("assignment_type", {
    enum: ["text", "file_upload", "image_series", "video", "prompt_documentation", "production_plan"],
  })
    .notNull()
    .default("text"),
  dueDate: text("due_date"),
  rubricCriteria: text("rubric_criteria"),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  enrollmentId: text("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  status: text("status", {
    enum: ["entwurf", "eingereicht", "in_pruefung", "ueberarbeitung_erforderlich", "bestanden", "nicht_bestanden"],
  })
    .notNull()
    .default("eingereicht"),
  submittedAt: text("submitted_at").notNull().default(sql`(current_timestamp)`),
  content: text("content"),
  toolDocumentation: text("tool_documentation"),
  reflection: text("reflection"),
  score: integer("score"),
});

export const submissionFeedback = sqliteTable("submission_feedback", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id").references(() => users.id),
  content: text("content").notNull(),
  score: integer("score"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  certificateType: text("certificate_type").notNull(),
  certificateNumber: text("certificate_number").notNull(),
  issuedAt: text("issued_at"),
  verificationCode: text("verification_code").notNull(),
  status: text("status", { enum: ["beantragt", "ausgestellt", "widerrufen"] })
    .notNull()
    .default("beantragt"),
});

export const exportsTable = sqliteTable("exports", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  exportType: text("export_type", {
    enum: [
      "full_curriculum",
      "compact_overview",
      "hours_overview",
      "workshop_plan",
      "technical_requirements",
      "teaching_manual",
      "marketing_summary",
      "assessment_overview",
    ],
  }).notNull(),
  format: text("format", { enum: ["pdf", "docx", "markdown", "json", "xlsx"] }).notNull(),
  versionId: text("version_id").references(() => versions.id),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  content: text("content"),
});
