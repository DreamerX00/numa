import { NextRequest, NextResponse } from "next/server";
import { createSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Client sends ID token from Firebase client SDK after signInWithEmailAndPassword or similar
// Body: { idToken: string }
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    const { sessionCookie, maxAge } = await createSessionCookieValue(idToken);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch (e) {
    console.error("/api/auth/login error", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
