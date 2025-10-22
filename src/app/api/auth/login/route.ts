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
      
      // Create or find user in database with comprehensive error handling
      let dbUser = null;
      
      try {
        // First, try to find user by Firebase UID
        dbUser = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid },
          include: { profile: true }
        });
        
        if (dbUser) {
          console.log('👤 Existing user found by Firebase UID');
          
          // Update email if it has changed in Firebase
          if (dbUser.email !== (decodedToken.email || '')) {
            console.log('📧 Updating user email from Firebase');
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { 
                email: decodedToken.email || '',
                emailVerified: decodedToken.email_verified ? new Date() : null
              },
              include: { profile: true }
            });
          }
          
          // Ensure user has a profile
          if (!dbUser.profile) {
            console.log('👤 Creating missing profile for existing user');
            await prisma.userProfile.create({
              data: {
                userId: dbUser.id,
                displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
                firstName: '',
                lastName: ''
              }
            });
            
            // Refetch user with profile
            dbUser = await prisma.user.findUnique({
              where: { id: dbUser.id },
              include: { profile: true }
            });
          }
        } else {
          console.log('🆕 User not found by Firebase UID, checking email...');
          
          // Check if user exists with this email but different Firebase UID
          const existingEmailUser = await prisma.user.findUnique({
            where: { email: decodedToken.email || '' },
            include: { profile: true }
          });
          
          if (existingEmailUser) {
            console.log('📧 Found user with same email, updating Firebase UID');
            
            // Update the existing user's Firebase UID (user switched auth methods)
            dbUser = await prisma.user.update({
              where: { id: existingEmailUser.id },
              data: {
                firebaseUid: decodedToken.uid,
                emailVerified: decodedToken.email_verified ? new Date() : null
              },
              include: { profile: true }
            });
            
            // Ensure profile exists
            if (!dbUser.profile) {
              await prisma.userProfile.create({
                data: {
                  userId: dbUser.id,
                  displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
                  firstName: '',
                  lastName: ''
                }
              });
              
              // Refetch with profile
              dbUser = await prisma.user.findUnique({
                where: { id: dbUser.id },
                include: { profile: true }
              });
            }
          } else {
            console.log('🆕 Creating completely new user');
            
            // Validate email before creation
            const userEmail = decodedToken.email || '';
            if (!userEmail) {
              throw new Error('Email is required for user creation');
            }
            
            // Generate safe display name
            const displayName = decodedToken.name || 
              (userEmail.includes('@') ? userEmail.split('@')[0] : 'User');
            
            // Use transaction to ensure atomicity
            dbUser = await prisma.$transaction(async (tx) => {
              const newUser = await tx.user.create({
                data: {
                  firebaseUid: decodedToken.uid,
                  email: userEmail,
                  emailVerified: decodedToken.email_verified ? new Date() : null
                }
              });
              
              await tx.userProfile.create({
                data: {
                  userId: newUser.id,
                  displayName: displayName,
                  firstName: '',
                  lastName: ''
                }
              });
              
              return await tx.user.findUnique({
                where: { id: newUser.id },
                include: { profile: true }
              });
            });
            
            console.log('✅ New user and profile created successfully');
          }
        }
        
        if (!dbUser) {
          throw new Error('Failed to create or retrieve user from database');
        }
        
      } catch (error) {
        console.error('💥 Database operation failed:', error);
        
        // Last resort: try to find user again (handle race conditions)
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          console.log('🔄 Handling unique constraint, retrying user lookup...');
          
          // Try to find by Firebase UID first
          dbUser = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
            include: { profile: true }
          });
          
          // If not found, try by email
          if (!dbUser && decodedToken.email) {
            dbUser = await prisma.user.findUnique({
              where: { email: decodedToken.email },
              include: { profile: true }
            });
            
            // Update Firebase UID if found
            if (dbUser) {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { firebaseUid: decodedToken.uid },
                include: { profile: true }
              });
            }
          }
        }
        
        if (!dbUser) {
          throw new Error(`User creation/retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
