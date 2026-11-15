import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, examSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const studentId = Number.parseInt(id, 10);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ error: "ID siswa tidak valid." }, { status: 400 });
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const answer1 = typeof body.answer1 === "string" ? body.answer1.trim() : "";
    const answer2 = typeof body.answer2 === "string" ? body.answer2.trim() : "";
    const answer3 = typeof body.answer3 === "string" ? body.answer3.trim() : "";
    const answer4 = typeof body.answer4 === "string" ? body.answer4.trim() : "";
    const answer5 = typeof body.answer5 === "string" ? body.answer5.trim() : "";
    const isFinalSubmit = Boolean(body.submit);

    if (isFinalSubmit) {
      const answers = [answer1, answer2, answer3, answer4, answer5];
      const missingIndices = answers
        .map((ans, idx) => (ans.length < 5 ? idx + 1 : null))
        .filter((v): v is number => v !== null);

      if (missingIndices.length > 0) {
        return NextResponse.json(
          {
            error: `Mohon lengkapi jawaban soal nomor ${missingIndices.join(", ")} terlebih dahulu (minimal 5 karakter per uraian).`,
          },
          { status: 400 }
        );
      }
    }

    const [existing] = await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.studentId, studentId))
      .limit(1);

    if (existing && existing.status === "graded") {
      return NextResponse.json(
        { error: "Ulangan Harian kamu sudah dinilai oleh Bapak Guru dan tidak dapat diubah lagi." },
        { status: 400 }
      );
    }

    const now = new Date();
    const nextStatus = isFinalSubmit
      ? "submitted"
      : existing?.status === "submitted"
        ? "submitted"
        : "draft";

    let saved;

    if (existing) {
      const [updated] = await db
        .update(examSubmissions)
        .set({
          answer1,
          answer2,
          answer3,
          answer4,
          answer5,
          status: nextStatus,
          submittedAt: isFinalSubmit ? now : existing.submittedAt,
          updatedAt: now,
        })
        .where(eq(examSubmissions.id, existing.id))
        .returning();
      saved = updated;
    } else {
      const [inserted] = await db
        .insert(examSubmissions)
        .values({
          studentId,
          answer1,
          answer2,
          answer3,
          answer4,
          answer5,
          status: nextStatus,
          submittedAt: isFinalSubmit ? now : null,
          updatedAt: now,
        })
        .returning();
      saved = inserted;
    }

    await db
      .update(students)
      .set({ lastActiveAt: now })
      .where(eq(students.id, studentId));

    return NextResponse.json({ submission: saved });
  } catch (error) {
    console.error("POST /api/students/[id]/exam error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban Ulangan Harian." },
      { status: 500 }
    );
  }
}
