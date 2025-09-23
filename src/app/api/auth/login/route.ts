import { NextRequest, NextResponse } from "next/server";
import { createSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
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
      
      // Verify the ID token and get user info
      const { adminAuth } = getFirebaseAdmin();
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('👤 User authenticated:', decodedToken.uid);
      
      // Create or find user in database
      let dbUser = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid }
      });
      
      if (!dbUser) {
        console.log('🆕 Creating new user in database...');
        dbUser = await prisma.user.create({
          data: {
            firebaseUid: decodedToken.uid,
            email: decodedToken.email || '',
            emailVerified: decodedToken.email_verified || false,
            profile: {
              create: {
                displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
                firstName: '',
                lastName: ''
              }
            }
          },
          include: {
            profile: true
          }
        });
        console.log('✅ User created in database with profile');
      } else {
        console.log('👤 Existing user found in database');
      }
      
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
