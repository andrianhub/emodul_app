import { NextResponse } from "next/server";
import { TEACHER_COOKIE_NAME } from "@/lib/teacher-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    name: TEACHER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
