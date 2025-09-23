import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, createAuthErrorResponse, getUserPhotoURL } from '@/lib/auth/getUserFromSession';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Profile update validation schema
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  language: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  emailMarketing: z.boolean().optional(),
  smsMarketing: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

// GET user profile - returns authenticated user's profile data
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { firebaseUser, dbUser } = authResult.user;

    // Get Firebase photo URL for avatar
    const photoURL = getUserPhotoURL(firebaseUser);

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        firebaseUid: dbUser.firebaseUid,
        role: dbUser.role,
        isActive: dbUser.isActive,
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: dbUser.updatedAt.toISOString(),
        photoURL, // From Firebase auth
        profile: dbUser.profile ? {
          id: dbUser.profile.id,
          firstName: dbUser.profile.firstName || '',
          lastName: dbUser.profile.lastName || '',
          displayName: dbUser.profile.displayName || '',
          phone: dbUser.profile.phone || '',
          dateOfBirth: dbUser.profile.dateOfBirth || '',
          gender: dbUser.profile.gender || '',
          language: dbUser.profile.language,
          currency: dbUser.profile.currency,
          timezone: dbUser.profile.timezone,
          emailMarketing: dbUser.profile.emailMarketing,
          smsMarketing: dbUser.profile.smsMarketing,
          pushNotifications: dbUser.profile.pushNotifications,
          loyaltyPoints: dbUser.profile.loyaltyPoints,
          loyaltyTier: dbUser.profile.loyaltyTier,
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile data' 
      },
      { status: 500 }
    );
  }
}

// PUT update user profile - updates authenticated user's profile
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const body = await request.json();

    // Validate request body
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid profile data',
          validationErrors: validationResult.error.issues.reduce((acc, issue) => {
            const key = issue.path[0]?.toString() || 'unknown';
            acc[key] = issue.message;
            return acc;
          }, {} as Record<string, string>)
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update or create user profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      update: {
        ...updateData,
        // Auto-generate displayName if not provided
        displayName: updateData.displayName || 
          (updateData.firstName && updateData.lastName 
            ? `${updateData.firstName} ${updateData.lastName}`.trim()
            : undefined)
      },
      create: {
        userId: dbUser.id,
        displayName: updateData.displayName || 
          (updateData.firstName && updateData.lastName 
            ? `${updateData.firstName} ${updateData.lastName}`.trim()
            : dbUser.email.split('@')[0]),
        firstName: updateData.firstName || '',
        lastName: updateData.lastName || '',
        phone: updateData.phone || '',
        dateOfBirth: updateData.dateOfBirth || '',
        gender: updateData.gender || 'PREFER_NOT_TO_SAY',
        language: updateData.language || 'en',
        currency: updateData.currency || 'INR',
        timezone: updateData.timezone || 'Asia/Kolkata',
        emailMarketing: updateData.emailMarketing ?? false,
        smsMarketing: updateData.smsMarketing ?? false,
        pushNotifications: updateData.pushNotifications ?? true,
      },
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
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile' 
      },
      { status: 500 }
    );
  }
}
