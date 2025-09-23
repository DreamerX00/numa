import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug: GET request to Firebase Admin Auth test...');
    
    const { adminAuth } = getFirebaseAdmin();
    console.log('✅ Debug: Firebase Admin Auth initialized');
    
    return NextResponse.json({
      status: "success",
      message: "Firebase Admin Auth is initialized and ready for testing",
      note: "Send a POST request with { idToken: 'your-firebase-id-token' } to test the full auth flow",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Debug: Firebase Admin Auth initialization failed:', {
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string })?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      status: "error",
      message: "Firebase Admin Auth initialization failed",
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: (error as { code?: string })?.code
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;
    
    if (!idToken) {
      return NextResponse.json({ error: "ID token required" }, { status: 400 });
    }
    
    console.log('🔍 Debug: Testing Firebase Admin Auth with ID token...');
    
    const { adminAuth } = getFirebaseAdmin();
    console.log('✅ Debug: Firebase Admin Auth initialized');
    
    // Test 1: Verify ID token
    console.log('🔍 Debug: Verifying ID token...');
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log('✅ Debug: ID token verified for user:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    });
    
    // Test 2: Try to create session cookie
    console.log('🔍 Debug: Creating session cookie...');
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log('✅ Debug: Session cookie created successfully, length:', sessionCookie.length);
    
    // Test 3: Verify the session cookie we just created
    console.log('🔍 Debug: Verifying session cookie...');
    const verifiedSession = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log('✅ Debug: Session cookie verified for user:', verifiedSession.uid);
    
    return NextResponse.json({
      status: "success",
      message: "All Firebase Admin Auth tests passed",
      tests: {
        idTokenVerification: "✅ Passed",
        sessionCookieCreation: "✅ Passed", 
        sessionCookieVerification: "✅ Passed"
      },
      userInfo: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Debug: Firebase Admin Auth test failed:', {
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string })?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      status: "error",
      message: "Firebase Admin Auth test failed",
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: (error as { code?: string })?.code
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}