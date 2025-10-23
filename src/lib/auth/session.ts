import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

/**
 * Get user from NextAuth session via request
 * This is used in API routes to authenticate users
 * @param _req - Not used, kept for API compatibility with existing code
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserFromRequest(_req: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }
    
    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    
    if (!user || !user.isActive) {
      return null;
    }
    
    return {
      uid: user.id,
      email: user.email,
      id: user.id,
      role: user.role,
      name: user.name,
    };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Legacy session cookie config - kept for reference but not used anymore
export const SESSION_COOKIE_NAME = "__session"; // Vercel-friendly
export const SESSION_EXPIRES_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
