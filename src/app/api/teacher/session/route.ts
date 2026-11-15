import { NextResponse } from "next/server";
import { isTeacherAuthenticated } from "@/lib/teacher-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isTeacherAuthenticated();
  return NextResponse.json({
    authenticated,
    teacherName: authenticated ? "Andrian Dwi Pranata, S.Pd" : null,
  });
}
