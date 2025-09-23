import { NextRequest, NextResponse } from "next/server";
import { createSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { z } from "zod";

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
      console.log('🔐 Processing login with ID token length:', idToken.length);
      
      const { sessionCookie, maxAge } = await createSessionCookieValue(idToken);
      console.log('✅ Session cookie created, setting response cookies...');
      
      const res = NextResponse.json({ ok: true });
      res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/",
        maxAge,
      });
      
      console.log('✅ Login successful, returning response');
      return res;
    } catch (e) {
      console.error("/api/auth/login error details:", {
        message: e instanceof Error ? e.message : String(e),
        code: (e as { code?: string })?.code,
        stack: e instanceof Error ? e.stack : undefined,
        name: e instanceof Error ? e.name : undefined
      });
      return NextResponse.json({ 
        error: "Login failed",
        details: e instanceof Error ? e.message : String(e)
      }, { status: 500 });
    }
  });
}
