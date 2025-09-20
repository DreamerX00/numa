import { NextRequest } from "next/server";
import { getFirebaseAdmin } from "../firebase/admin";

// Session cookie config
export const SESSION_COOKIE_NAME = "__session"; // Vercel-friendly
export const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function createSessionCookieValue(idToken: string) {
  const { adminAuth } = getFirebaseAdmin();
  const expiresIn = SESSION_EXPIRES_MS;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  return { sessionCookie, maxAge: Math.floor(expiresIn / 1000) };
}

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const { adminAuth } = getFirebaseAdmin();
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return decoded;
  } catch {
    return null;
  }
}
