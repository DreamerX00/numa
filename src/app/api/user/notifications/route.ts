import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, createAuthErrorResponse } from '@/lib/auth/getUserFromSession';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Notification preferences validation schema
const updateNotificationsSchema = z.object({
  email: z.object({
    orderUpdates: z.boolean().optional(),
    promotions: z.boolean().optional(),
    newsletter: z.boolean().optional(),
    security: z.boolean().optional(),
    reminders: z.boolean().optional(),
  }).optional(),
  sms: z.object({
    orderUpdates: z.boolean().optional(),
    promotions: z.boolean().optional(),
    security: z.boolean().optional(),
  }).optional(),
  push: z.object({
    orderUpdates: z.boolean().optional(),
    promotions: z.boolean().optional(),
    reminders: z.boolean().optional(),
    general: z.boolean().optional(),
  }).optional(),
});

// GET user notification preferences
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const userProfile = dbUser.profile;

    // Build notification preferences object
    // For now, we'll use the basic preferences from the profile
    // In a full implementation, you might have a separate NotificationPreferences table
    const notificationSettings = {
      email: {
        orderUpdates: true, // Always enabled for important updates
        promotions: userProfile?.emailMarketing || false,
        newsletter: userProfile?.emailMarketing || false,
        security: true, // Always enabled for security
        reminders: userProfile?.emailMarketing || false,
      },
      sms: {
        orderUpdates: userProfile?.smsMarketing || false,
        promotions: userProfile?.smsMarketing || false,
        security: userProfile?.smsMarketing || false,
      },
      push: {
        orderUpdates: userProfile?.pushNotifications || true,
        promotions: userProfile?.pushNotifications || false,
        reminders: userProfile?.pushNotifications || true,
        general: userProfile?.pushNotifications || true,
      },
      
      // Marketing consent tracking (for compliance)
      marketingConsent: {
        email: {
          consented: userProfile?.emailMarketing || false,
          consentDate: userProfile ? new Date().toISOString() : null, // This would come from a proper consent tracking system
        },
        sms: {
          consented: userProfile?.smsMarketing || false,
          consentDate: userProfile ? new Date().toISOString() : null,
        }
      }
    };

    return NextResponse.json({
      success: true,
      notificationSettings
    });

  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notification preferences' 
      },
      { status: 500 }
    );
  }
}

// PUT update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const body = await request.json();

    // Validate request body
    const validationResult = updateNotificationsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid notification preferences',
          validationErrors: validationResult.error.issues.reduce((acc, issue) => {
            acc[issue.path.join('.')] = issue.message;
            return acc;
          }, {} as Record<string, string>)
        },
        { status: 400 }
      );
    }

    const notificationData = validationResult.data;

    // Map notification preferences to profile fields
    // In a full implementation, you'd have more granular controls
    const updateData: Record<string, boolean | undefined> = {};

    // Email marketing consent
    if (notificationData.email?.promotions !== undefined || notificationData.email?.newsletter !== undefined) {
      updateData.emailMarketing = notificationData.email.promotions || notificationData.email.newsletter || false;
    }

    // SMS marketing consent
    if (notificationData.sms?.promotions !== undefined) {
      updateData.smsMarketing = notificationData.sms.promotions;
    }

    // Push notifications
    if (notificationData.push?.general !== undefined) {
      updateData.pushNotifications = notificationData.push.general;
    }

    // Update user profile with notification preferences
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      update: updateData,
      create: {
        userId: dbUser.id,
        displayName: dbUser.email.split('@')[0],
        firstName: '',
        lastName: '',
        emailMarketing: updateData.emailMarketing || false,
        smsMarketing: updateData.smsMarketing || false,
        pushNotifications: updateData.pushNotifications !== undefined ? updateData.pushNotifications : true,
      },
      select: {
        emailMarketing: true,
        smsMarketing: true,
        pushNotifications: true,
      }
    });

    // Build response with updated preferences
    const updatedNotificationSettings = {
      email: {
        orderUpdates: true,
        promotions: updatedProfile.emailMarketing,
        newsletter: updatedProfile.emailMarketing,
        security: true,
        reminders: updatedProfile.emailMarketing,
      },
      sms: {
        orderUpdates: updatedProfile.smsMarketing,
        promotions: updatedProfile.smsMarketing,
        security: updatedProfile.smsMarketing,
      },
      push: {
        orderUpdates: updatedProfile.pushNotifications,
        promotions: updatedProfile.pushNotifications,
        reminders: updatedProfile.pushNotifications,
        general: updatedProfile.pushNotifications,
      },
      marketingConsent: {
        email: {
          consented: updatedProfile.emailMarketing,
          consentDate: new Date().toISOString(),
        },
        sms: {
          consented: updatedProfile.smsMarketing,
          consentDate: new Date().toISOString(),
        }
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      notificationSettings: updatedNotificationSettings
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update notification preferences' 
      },
      { status: 500 }
    );
  }
}
