import crypto from "crypto";
import { cookies } from "next/headers";

export const TEACHER_COOKIE_NAME = "ski_guru_session";
const EXPECTED_PASSWORD = process.env.TEACHER_PASSWORD || "123123";
const SESSION_SECRET =
  process.env.TEACHER_SESSION_SECRET || "mi-sirojul-huda-ski-k4-andrian-secret-2026";

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
}

export function verifyTeacherPassword(input: string): boolean {
  const cleanInput = input.trim();
  if (cleanInput.length !== EXPECTED_PASSWORD.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(cleanInput, "utf8"),
    Buffer.from(EXPECTED_PASSWORD, "utf8")
  );
}

export function createTeacherSessionToken(): string {
  const issuedAt = Date.now().toString();
  const payload = `guru:${issuedAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function validateTeacherSessionToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload.startsWith("guru:")) return false;
  const expectedSig = signPayload(payload);
  if (signature.length !== expectedSig.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(signature, "utf8"),
    Buffer.from(expectedSig, "utf8")
  );
}

export async function isTeacherAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEACHER_COOKIE_NAME)?.value;
  return validateTeacherSessionToken(token);
}
