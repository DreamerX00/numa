import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Starting profile debug...');
    
    // Step 1: Check if we have session cookie
    const sessionCookie = req.cookies.get('__session')?.value;
    console.log('🍪 Session cookie present:', !!sessionCookie);
    if (sessionCookie) {
      console.log('🔍 Session cookie length:', sessionCookie.length);
    }
    
    // Step 2: Try to get user from request
    console.log('👤 Getting user from request...');
    const user = await getUserFromRequest(req);
    console.log('👤 User from request:', user ? {
      uid: user.uid,
      email: user.email,
      hasEmail: !!user.email
    } : 'null');
    
    if (!user) {
      return NextResponse.json({
        status: "error",
        message: "No authenticated user found",
        debug: {
          hasSessionCookie: !!sessionCookie,
          sessionCookieLength: sessionCookie?.length || 0
        }
      });
    }
    
    // Step 3: Try to find user in database
    console.log('🔍 Looking for user in database...');
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid },
      include: {
        profile: true,
        addresses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    console.log('💾 Database user found:', !!dbUser);
    
    // Step 4: Test database connection
    console.log('🔍 Testing database connection...');
    const userCount = await prisma.user.count();
    console.log('📊 Total users in database:', userCount);
    
    return NextResponse.json({
      status: "success",
      message: "Profile debug completed",
      debug: {
        authentication: {
          hasSessionCookie: !!sessionCookie,
          sessionCookieLength: sessionCookie?.length || 0,
          userFromSession: !!user,
          userUid: user?.uid,
          userEmail: user?.email
        },
        database: {
          userFoundInDb: !!dbUser,
          userHasProfile: !!dbUser?.profile,
          userAddressCount: dbUser?.addresses?.length || 0,
          totalUsersInDb: userCount
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('💥 Profile debug failed:', error);
    return NextResponse.json(
      {
        status: "error",
        message: "Profile debug failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}