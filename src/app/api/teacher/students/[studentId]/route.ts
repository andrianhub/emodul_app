import { NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { isTeacherAuthenticated } from "@/lib/teacher-auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
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

    const deleted = await db
      .delete(students)
      .where(eq(students.id, studentId))
      .returning({ id: students.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, id: studentId });
  } catch (error) {
    console.error("DELETE /api/teacher/students/[studentId] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data siswa." },
      { status: 500 }
    );
  }
}
