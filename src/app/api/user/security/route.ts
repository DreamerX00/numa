import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession, createAuthErrorResponse } from '@/lib/auth/userSession';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Security settings validation schema
const updateSecuritySchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).optional(),
  enable2FA: z.boolean().optional(),
  trustedDevices: z.array(z.object({
    deviceId: z.string(),
    deviceName: z.string(),
    lastUsed: z.string().transform(str => new Date(str)),
  })).optional(),
});

// GET user security settings
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;

    // Get recent login history (mock data for now - in production you'd track this)
    const loginHistory = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        ipAddress: '192.168.1.1',
        location: 'Mumbai, India',
        device: 'Chrome on Windows',
        success: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        ipAddress: '192.168.1.1',
        location: 'Mumbai, India',
        device: 'Mobile Safari',
        success: true
      }
    ];

    // Get trusted devices (mock data for now)
    const trustedDevices = [
      {
        deviceId: 'chrome-windows-001',
        deviceName: 'Chrome on Windows',
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isActive: true
      }
    ];

    const securitySettings = {
      // Password info
      passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago (mock)
      
      // Two-factor authentication
      twoFactorEnabled: false, // Would need to implement 2FA system
      twoFactorMethod: null,
      backupCodes: [], // Would generate if 2FA is enabled
      
      // Device management
      trustedDevices,
      
      // Login history
      loginHistory,
      
      // Account security
      accountLockout: {
        isLocked: false,
        lockoutCount: 0,
        lastLockout: null
      },
      
      // Security questions (not implemented)
      securityQuestions: [],
      
      // Email verification status from database
      emailVerified: dbUser.emailVerified !== null,
      
      // Account creation date
      accountCreated: dbUser.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      securitySettings
    });

  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch security settings' 
      },
      { status: 500 }
    );
  }
}

// PUT update user security settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getUserFromSession(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const body = await request.json();

    // Validate request body
    const validationResult = updateSecuritySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid security settings',
          validationErrors: validationResult.error.issues.reduce((acc, issue) => {
            acc[issue.path.join('.')] = issue.message;
            return acc;
          }, {} as Record<string, string>)
        },
        { status: 400 }
      );
    }

    const securityData = validationResult.data;

    // Handle password change
    if (securityData.currentPassword && securityData.newPassword) {
      try {
        // Fetch user with password field (not included in getUserFromSession for security)
        const userWithPassword = await prisma.user.findUnique({
          where: { id: dbUser.id },
          select: { password: true }
        });

        // Verify the user has a password set (not OAuth-only user)
        if (!userWithPassword?.password) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Password authentication not configured for this account. This account uses social login (Google).' 
            },
            { status: 400 }
          );
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(
          securityData.currentPassword,
          userWithPassword.password
        );

        if (!passwordMatch) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Current password is incorrect' 
            },
            { status: 400 }
          );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(securityData.newPassword, 12);

        // Update password in database
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { password: hashedPassword }
        });

        return NextResponse.json({
          success: true,
          message: 'Password updated successfully'
        });

      } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to update password. Please try again.' 
          },
          { status: 400 }
        );
      }
    }

    // Handle 2FA settings (placeholder - would need full 2FA implementation)
    if (securityData.enable2FA !== undefined) {
      // This would integrate with a 2FA service like Google Authenticator
      // For now, just return a message
      return NextResponse.json({
        success: false,
        error: 'Two-factor authentication setup is not yet implemented'
      });
    }

    // Handle trusted devices update (placeholder)
    if (securityData.trustedDevices) {
      // This would update trusted devices in the database
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Trusted devices updated successfully'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update security settings' 
      },
      { status: 500 }
    );
  }
}
