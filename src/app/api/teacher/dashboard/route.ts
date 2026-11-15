import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, readingProgress, examSubmissions } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { isTeacherAuthenticated } from "@/lib/teacher-auth";
import { MODULE_SECTIONS } from "@/lib/module-content";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authenticated = await isTeacherAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "Akses ditolak. Silakan masuk dengan password Panel Guru." },
        { status: 401 }
      );
    }

    await ensureSeeded();

    const [allStudents, allProgress, allExams] = await Promise.all([
      db.select().from(students).orderBy(desc(students.lastActiveAt)),
      db.select().from(readingProgress),
      db.select().from(examSubmissions),
    ]);

    const totalSections = MODULE_SECTIONS.length;

    const progressByStudent = new Map<number, typeof allProgress>();
    for (const row of allProgress) {
      const list = progressByStudent.get(row.studentId) ?? [];
      list.push(row);
      progressByStudent.set(row.studentId, list);
    }

    const examByStudent = new Map<number, (typeof allExams)[number]>();
    for (const exam of allExams) {
      examByStudent.set(exam.studentId, exam);
    }

    const records = allStudents.map((s) => {
      const sProgress = progressByStudent.get(s.id) ?? [];
      const readSections = sProgress.filter((p) => p.isRead);
      const listenedSections = sProgress.filter((p) => p.listenedAudio);
      const submission = examByStudent.get(s.id) ?? null;

      return {
        student: s,
        progress: sProgress,
        readCount: readSections.length,
        totalSections,
        completedReading: readSections.length >= totalSections,
        listenedCount: listenedSections.length,
        submission,
      };
    });

    const gradedScores = records
      .map((r) => r.submission?.totalScore)
      .filter((v): v is number => typeof v === "number");

    const stats = {
      totalStudents: records.length,
      completedAllReading: records.filter((r) => r.completedReading).length,
      usedAudioCount: records.filter((r) => r.student.usedAudio || r.listenedCount > 0).length,
      submittedExamCount: records.filter(
        (r) =>
          r.submission?.status === "submitted" || r.submission?.status === "graded"
      ).length,
      gradedExamCount: records.filter((r) => r.submission?.status === "graded").length,
      averageScore:
        gradedScores.length > 0
          ? Math.round(
              gradedScores.reduce((acc, v) => acc + v, 0) / gradedScores.length
            )
          : null,
    };

    return NextResponse.json({
      teacherName: "Andrian Dwi Pranata, S.Pd",
      stats,
      records,
    });
  } catch (error) {
    console.error("GET /api/teacher/dashboard error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data dashboard guru." },
      { status: 500 }
    );
  }
}
