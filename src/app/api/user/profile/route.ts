import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/session';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';

// Input validation schema for profile updates
const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
    .optional(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .optional(),
  displayName: z.string()
    .min(1, "Display name is required")
    .max(100, "Display name cannot exceed 100 characters")
    .optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  dateOfBirth: z.string()
    .datetime("Invalid date format")
    .optional()
    .nullable()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, "Age must be between 13 and 120 years"),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .optional()
    .nullable(),
  language: z.string()
    .length(2, "Language code must be 2 characters")
    .regex(/^[a-z]{2}$/, "Invalid language code")
    .optional(),
  currency: z.string()
    .length(3, "Currency code must be 3 characters")
    .regex(/^[A-Z]{3}$/, "Invalid currency code")
    .optional(),
  timezone: z.string()
    .max(50, "Timezone cannot exceed 50 characters")
    .optional(),
  emailMarketing: z.boolean().optional(),
  smsMarketing: z.boolean().optional(),
  pushNotifications: z.boolean().optional()
});

// Rate limiter for profile updates
const profileRateLimit = rateLimit(rateLimitConfigs.api);

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid },
      include: {
        profile: true,
        addresses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          firebaseUid: user.uid,
          email: user.email || '',
          emailVerified: user.email_verified || false,
          profile: {
            create: {
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              displayName: user.name || '',
            }
          }
        },
        include: {
          profile: true,
          addresses: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        profile: dbUser.profile,
        addresses: dbUser.addresses,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return profileRateLimit(req, async () => {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      
      // Validate input using Zod schema
      const validationResult = profileUpdateSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: "Invalid input", details: errors },
          { status: 400 }
        );
      }

      const { 
        firstName, 
        lastName, 
        displayName, 
        phone, 
        dateOfBirth, 
        gender,
        language,
        currency,
        timezone,
        emailMarketing,
        smsMarketing,
        pushNotifications
      } = validationResult.data;

    // Find existing user
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid },
      include: { profile: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: dbUser.id },
      update: {
        firstName,
        lastName,
        displayName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        language,
        currency,
        timezone,
        emailMarketing,
        smsMarketing,
        pushNotifications
      },
      create: {
        userId: dbUser.id,
        firstName,
        lastName,
        displayName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        language,
        currency,
        timezone,
        emailMarketing,
        smsMarketing,
        pushNotifications
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

    } catch (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}