import { NextResponse } from "next/server";
import { db } from "@/db";
import { examSubmissions } from "@/db/schema";
import { isTeacherAuthenticated } from "@/lib/teacher-auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function clampScore(value: unknown, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.max(0, Math.min(max, Math.round(num)));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const authenticated = await isTeacherAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const { studentId: rawId } = await context.params;
    const studentId = Number.parseInt(rawId, 10);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ error: "ID siswa tidak valid." }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.studentId, studentId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Siswa ini belum mengumpulkan jawaban Ulangan Harian." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const s1 = clampScore(body.score1, 20);
    const s2 = clampScore(body.score2, 20);
    const s3 = clampScore(body.score3, 20);
    const s4 = clampScore(body.score4, 20);
    const s5 = clampScore(body.score5, 20);

    const hasAllPerQuestion =
      s1 !== null && s2 !== null && s3 !== null && s4 !== null && s5 !== null;

    let totalScore: number | null = hasAllPerQuestion
      ? s1 + s2 + s3 + s4 + s5
      : clampScore(body.totalScore, 100);

    if (totalScore === null) {
      const partial = [s1, s2, s3, s4, s5].filter((v): v is number => v !== null);
      if (partial.length > 0) {
        totalScore = Math.min(
          100,
          partial.reduce((acc, v) => acc + v, 0)
        );
      }
    }

    if (totalScore === null) {
      return NextResponse.json(
        { error: "Mohon isi nilai (0–20 per soal atau total 0–100)." },
        { status: 400 }
      );
    }

    const teacherFeedback =
      typeof body.teacherFeedback === "string"
        ? body.teacherFeedback.trim().slice(0, 1000)
        : null;

    const now = new Date();
    const [updated] = await db
      .update(examSubmissions)
      .set({
        score1: s1,
        score2: s2,
        score3: s3,
        score4: s4,
        score5: s5,
        totalScore,
        teacherFeedback,
        status: "graded",
        gradedAt: now,
        updatedAt: now,
      })
      .where(eq(examSubmissions.id, existing.id))
      .returning();

    return NextResponse.json({ submission: updated });
  } catch (error) {
    console.error("PATCH /api/teacher/submissions/[studentId] error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan penilaian guru." },
      { status: 500 }
    );
  }
}
