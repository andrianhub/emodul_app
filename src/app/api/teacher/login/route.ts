import { NextResponse } from "next/server";
import {
  TEACHER_COOKIE_NAME,
  createTeacherSessionToken,
  verifyTeacherPassword,
} from "@/lib/teacher-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!verifyTeacherPassword(password)) {
      return NextResponse.json(
        { error: "Password Panel Guru salah. Silakan coba lagi." },
        { status: 401 }
      );
    }

    const token = createTeacherSessionToken();
    const response = NextResponse.json({
      authenticated: true,
      teacherName: "Andrian Dwi Pranata, S.Pd",
    });

    response.cookies.set({
      name: TEACHER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("POST /api/teacher/login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat masuk ke Panel Guru." },
      { status: 500 }
    );
  }
}
