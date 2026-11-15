import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, readingProgress, examSubmissions } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { and, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await ensureSeeded();

    const body = await request.json();
    const rawName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const rawClass =
      typeof body.className === "string" && body.className.trim().length > 0
        ? body.className.trim()
        : "Kelas 4A";
    const rawAbsen =
      typeof body.absenNumber === "string" ? body.absenNumber.trim().slice(0, 15) : null;

    if (rawName.length < 2) {
      return NextResponse.json(
        { error: "Mohon tuliskan nama lengkap siswa minimal 2 huruf." },
        { status: 400 }
      );
    }

    if (rawName.length > 120) {
      return NextResponse.json(
        { error: "Nama siswa maksimal 120 karakter." },
        { status: 400 }
      );
    }

    // Check if student with same name & class already exists (case-insensitive)
    const existing = await db
      .select()
      .from(students)
      .where(
        and(
          sql`lower(${students.fullName}) = lower(${rawName})`,
          eq(students.className, rawClass)
        )
      )
      .limit(1);

    let student = existing[0];
    let isReturning = false;

    if (student) {
      isReturning = true;
      const [updated] = await db
        .update(students)
        .set({
          lastActiveAt: new Date(),
          ...(rawAbsen ? { absenNumber: rawAbsen } : {}),
        })
        .where(eq(students.id, student.id))
        .returning();
      student = updated;
    } else {
      const [created] = await db
        .insert(students)
        .values({
          fullName: rawName,
          className: rawClass,
          absenNumber: rawAbsen || null,
          joinedAt: new Date(),
          lastActiveAt: new Date(),
        })
        .returning();
      student = created;
    }

    const progress = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.studentId, student.id));

    const [submission] = await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.studentId, student.id))
      .limit(1);

    return NextResponse.json({
      student,
      progress,
      submission: submission ?? null,
      isReturning,
    });
  } catch (error) {
    console.error("POST /api/students/session error:", error);
    return NextResponse.json(
      { error: "Gagal mencatat sesi belajar siswa. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
