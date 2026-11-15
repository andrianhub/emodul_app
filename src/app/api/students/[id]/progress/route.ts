import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, readingProgress } from "@/db/schema";
import { MODULE_SECTIONS } from "@/lib/module-content";
import { and, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VALID_SLUGS = new Set(MODULE_SECTIONS.map((s) => s.slug));

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

    const [existingStudent] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!existingStudent) {
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const sectionSlug =
      typeof body.sectionSlug === "string" ? body.sectionSlug.trim() : null;
    const isRead = typeof body.isRead === "boolean" ? body.isRead : undefined;
    const listenedAudio =
      typeof body.listenedAudio === "boolean" ? body.listenedAudio : false;
    const usedAudio =
      typeof body.usedAudio === "boolean" ? body.usedAudio : listenedAudio;
    const addAudioMinutes =
      typeof body.addAudioMinutes === "number" && body.addAudioMinutes > 0
        ? Math.min(Math.round(body.addAudioMinutes), 30)
        : 0;

    if (sectionSlug) {
      if (!VALID_SLUGS.has(sectionSlug)) {
        return NextResponse.json(
          { error: "Bagian materi tidak valid." },
          { status: 400 }
        );
      }

      const existingProgress = await db
        .select()
        .from(readingProgress)
        .where(
          and(
            eq(readingProgress.studentId, studentId),
            eq(readingProgress.sectionSlug, sectionSlug)
          )
        )
        .limit(1);

      if (existingProgress[0]) {
        await db
          .update(readingProgress)
          .set({
            isRead: isRead !== undefined ? isRead : existingProgress[0].isRead,
            listenedAudio: existingProgress[0].listenedAudio || listenedAudio,
            completedAt: new Date(),
          })
          .where(eq(readingProgress.id, existingProgress[0].id));
      } else {
        await db.insert(readingProgress).values({
          studentId,
          sectionSlug,
          isRead: isRead !== undefined ? isRead : true,
          listenedAudio,
          completedAt: new Date(),
        });
      }
    }

    const [updatedStudent] = await db
      .update(students)
      .set({
        lastActiveAt: new Date(),
        usedAudio: existingStudent.usedAudio || usedAudio,
        audioMinutes:
          addAudioMinutes > 0
            ? sql`${students.audioMinutes} + ${addAudioMinutes}`
            : existingStudent.audioMinutes,
      })
      .where(eq(students.id, studentId))
      .returning();

    const progress = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.studentId, studentId));

    return NextResponse.json({
      student: updatedStudent,
      progress,
    });
  } catch (error) {
    console.error("POST /api/students/[id]/progress error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan progres membaca." },
      { status: 500 }
    );
  }
}
