import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  className: varchar("class_name", { length: 30 }).notNull().default("Kelas 4A"),
  absenNumber: varchar("absen_number", { length: 15 }),
  usedAudio: boolean("used_audio").notNull().default(false),
  audioMinutes: integer("audio_minutes").notNull().default(0),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
});

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    sectionSlug: varchar("section_slug", { length: 64 }).notNull(),
    isRead: boolean("is_read").notNull().default(true),
    listenedAudio: boolean("listened_audio").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reading_progress_student_section_idx").on(
      table.studentId,
      table.sectionSlug
    ),
  ]
);

export const examSubmissions = pgTable("exam_submissions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .unique()
    .references(() => students.id, { onDelete: "cascade" }),
  answer1: text("answer_1").notNull().default(""),
  answer2: text("answer_2").notNull().default(""),
  answer3: text("answer_3").notNull().default(""),
  answer4: text("answer_4").notNull().default(""),
  answer5: text("answer_5").notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  score1: integer("score_1"),
  score2: integer("score_2"),
  score3: integer("score_3"),
  score4: integer("score_4"),
  score5: integer("score_5"),
  totalScore: integer("total_score"),
  teacherFeedback: text("teacher_feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  gradedAt: timestamp("graded_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type ExamSubmission = typeof examSubmissions.$inferSelect;
