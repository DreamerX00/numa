import { NextRequest } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedUser {
  // Firebase user data
  firebaseUser: DecodedIdToken;
  // Database user data with profile
  dbUser: {
    id: string;
    email: string;
    emailVerified: Date | null;  // Changed from boolean to Date | null
    firebaseUid: string | null;  // Made optional for NextAuth migration
    name: string | null;  // Added for NextAuth
    image: string | null;  // Added for NextAuth
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    profile: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      displayName: string | null;
      phone: string | null;
      dateOfBirth: Date | null;
      gender: string | null;
      language: string;
      currency: string;
      timezone: string;
      emailMarketing: boolean;
      smsMarketing: boolean;
      pushNotifications: boolean;
      loyaltyPoints: number;
      loyaltyTier: string;
    } | null;
  };
}

export interface AuthResult {
  success: true;
  user: AuthenticatedUser;
}

export interface AuthError {
  success: false;
  error: string;
  statusCode: 401 | 403 | 500;
}

/**
 * Authenticates a user from a Next.js request and returns both Firebase and database user data
 * Used across all /api/user/* endpoints for consistent authentication
 */
export async function getUserFromSession(request: NextRequest): Promise<AuthResult | AuthError> {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get('__session')?.value;
    
    if (!sessionCookie) {
      return {
        success: false,
        error: 'Authentication required. Please log in.',
        statusCode: 401
      };
    }

    // Verify Firebase session cookie
    const { adminAuth } = getFirebaseAdmin();
    let firebaseUser: DecodedIdToken;
    
    try {
      firebaseUser = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (firebaseError) {
      console.error('Firebase session verification failed:', firebaseError);
      return {
        success: false,
        error: 'Invalid or expired session. Please log in again.',
        statusCode: 401
      };
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUser.uid },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            language: true,
            currency: true,
            timezone: true,
            emailMarketing: true,
            smsMarketing: true,
            pushNotifications: true,
            loyaltyPoints: true,
            loyaltyTier: true,
          }
        }
      }
    });

    if (!dbUser) {
      console.error('User not found in database for Firebase UID:', firebaseUser.uid);
      return {
        success: false,
        error: 'User account not found. Please contact support.',
        statusCode: 403
      };
    }

    if (!dbUser.isActive) {
      return {
        success: false,
        error: 'Account is deactivated. Please contact support.',
        statusCode: 403
      };
    }

    return {
      success: true,
      user: {
        firebaseUser,
        dbUser
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication system error. Please try again.',
      statusCode: 500
    };
  }
}

/**
 * Helper function to extract user ID from authenticated request
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const authResult = await getUserFromSession(request);
  return authResult.success ? authResult.user.dbUser.id : null;
}

/**
 * Helper function to check if user has specific role
 */
export async function userHasRole(request: NextRequest, requiredRole: string[]): Promise<boolean> {
  const authResult = await getUserFromSession(request);
  if (!authResult.success) return false;
  
  return requiredRole.includes(authResult.user.dbUser.role);
}

/**
 * Helper function to get user's Firebase photo URL for avatar
 */
export function getUserPhotoURL(firebaseUser: DecodedIdToken): string | undefined {
  return firebaseUser.picture || undefined;
}

/**
 * Create standardized error response for authentication failures
 */
export function createAuthErrorResponse(authError: AuthError) {
  return new Response(
    JSON.stringify({ 
      success: false,
      error: authError.error 
    }),
    { 
      status: authError.statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}