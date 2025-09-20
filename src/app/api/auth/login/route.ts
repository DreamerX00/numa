import { NextRequest, NextResponse } from "next/server";
import { createSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { z } from "zod";

// Input validation schema for login
const loginSchema = z.object({
  idToken: z.string().min(1, "ID token is required")
});

// Rate limiter for login attempts
const loginRateLimit = rateLimit({
  ...rateLimitConfigs.auth,
  keyGenerator: (req: NextRequest) => {
    // Rate limit by IP for login attempts
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return `login:${ip}`;
  },
});

// Client sends ID token from Firebase client SDK after signInWithEmailAndPassword or similar
// Body: { idToken: string }
export async function POST(req: NextRequest) {
  return loginRateLimit(req, async () => {
    try {
      const body = await req.json();
      
      // Validate input
      const validationResult = loginSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validationResult.error.issues },
          { status: 400 }
        );
      }

      const { idToken } = validationResult.data;
      const { sessionCookie, maxAge } = await createSessionCookieValue(idToken);
      
      const res = NextResponse.json({ ok: true });
      res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/",
        maxAge,
      });
      return res;
    } catch (e) {
      console.error("/api/auth/login error", e);
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
  });
}
