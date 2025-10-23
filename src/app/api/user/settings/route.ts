import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, createAuthErrorResponse } from '@/lib/auth/userSession';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Settings update validation schema
const updateSettingsSchema = z.object({
  language: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  // Additional settings can be added here
});

// GET user account settings
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const userProfile = dbUser.profile;

    // Return user's current settings or defaults
    const accountSettings = {
      language: userProfile?.language || 'en',
      currency: userProfile?.currency || 'INR',
      timezone: userProfile?.timezone || 'Asia/Kolkata',
      theme: 'light', // This could be stored in profile if needed
      
      // Notification preferences
      emailMarketing: userProfile?.emailMarketing || false,
      smsMarketing: userProfile?.smsMarketing || false,
      pushNotifications: userProfile?.pushNotifications || true,
    };

    return NextResponse.json({
      success: true,
      accountSettings
    });

  } catch (error) {
    console.error('Error fetching account settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch account settings' 
      },
      { status: 500 }
    );
  }
}

// PUT update user account settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const body = await request.json();

    // Validate request body
    const validationResult = updateSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid settings data',
          validationErrors: validationResult.error.issues.reduce((acc, issue) => {
            const key = issue.path[0]?.toString() || 'unknown';
            acc[key] = issue.message;
            return acc;
          }, {} as Record<string, string>)
        },
        { status: 400 }
      );
    }

    const settingsData = validationResult.data;

    // Update user profile with new settings
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      update: {
        language: settingsData.language,
        currency: settingsData.currency,
        timezone: settingsData.timezone,
        // Note: theme would need to be added to the profile schema if you want to persist it
      },
      create: {
        userId: dbUser.id,
        displayName: dbUser.email.split('@')[0],
        firstName: '',
        lastName: '',
        language: settingsData.language || 'en',
        currency: settingsData.currency || 'INR',
        timezone: settingsData.timezone || 'Asia/Kolkata',
      },
      select: {
        language: true,
        currency: true,
        timezone: true,
        emailMarketing: true,
        smsMarketing: true,
        pushNotifications: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      accountSettings: {
        language: updatedProfile.language,
        currency: updatedProfile.currency,
        timezone: updatedProfile.timezone,
        theme: settingsData.theme || 'light',
        emailMarketing: updatedProfile.emailMarketing,
        smsMarketing: updatedProfile.smsMarketing,
        pushNotifications: updatedProfile.pushNotifications,
      }
    });

  } catch (error) {
    console.error('Error updating account settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings' 
      },
      { status: 500 }
    );
  }
}
