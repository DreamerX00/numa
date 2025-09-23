import { NextRequest } from "next/server";
import { getFirebaseAdmin } from "../firebase/admin";

// Session cookie config
export const SESSION_COOKIE_NAME = "__session"; // Vercel-friendly
export const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function createSessionCookieValue(idToken: string) {
  try {
    console.log('🔐 Starting session cookie creation...');
    
    const { adminAuth } = getFirebaseAdmin();
    console.log('✅ Firebase Admin Auth initialized');
    
    const expiresIn = SESSION_EXPIRES_MS;
    console.log(`⏰ Session expires in: ${expiresIn}ms (${Math.floor(expiresIn / 1000)}s)`);
    
    // First verify the ID token is valid
    console.log('🔍 Verifying ID token...');
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log('✅ ID token verified for user:', decodedToken.uid);
    
    // Create session cookie
    console.log('🍪 Creating session cookie...');
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log('✅ Session cookie created successfully');
    
    return { sessionCookie, maxAge: Math.floor(expiresIn / 1000) };
  } catch (error) {
    console.error('💥 Session cookie creation failed:', {
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string })?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
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
