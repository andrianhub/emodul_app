import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, readingProgress, examSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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
      return NextResponse.json({ error: "Data siswa tidak ditemukan." }, { status: 404 });
    }

    const progress = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.studentId, studentId));

    const [submission] = await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.studentId, studentId))
      .limit(1);

    return NextResponse.json({
      student,
      progress,
      submission: submission ?? null,
    });
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data belajar siswa." },
      { status: 500 }
    );
  }
}
