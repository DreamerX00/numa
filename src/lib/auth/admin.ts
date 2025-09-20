import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { AdminLogAction, UserRole } from '@prisma/client';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Prisma } from '@prisma/client';

interface AdminAuthResult {
  success: boolean;
  user?: {
    id: string;
    role: UserRole;
    isActive: boolean;
  };
  firebaseUser?: DecodedIdToken;
  error?: string;
}

export async function verifyAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user exists in database and has admin role
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid },
      select: { 
        id: true, 
        role: true, 
        isActive: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!dbUser || !dbUser.isActive) {
      return { success: false, error: 'User not found or inactive' };
    }

    if (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN') {
      // Log unauthorized access attempt
      await logSecurityEvent(req, {
        type: 'UNAUTHORIZED_ADMIN_ACCESS',
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role
      });
      
      return { success: false, error: 'Insufficient permissions' };
    }

    // Log successful admin access
    await logSecurityEvent(req, {
      type: 'ADMIN_ACCESS_SUCCESS',
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role
    });

    return { 
      success: true, 
      user: {
        id: dbUser.id,
        role: dbUser.role,
        isActive: dbUser.isActive
      },
      firebaseUser: user 
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { success: false, error: 'Authentication system error' };
  }
}

export async function requireAdmin(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  // Return null if successful (no error response), allowing the route to continue
  return null;
}

export async function requireSuperAdmin(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  if (authResult.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
  }

  return null;
}

export async function logAdminAction(
  userId: string, 
  action: AdminLogAction, 
  resource: string, 
  resourceId?: string, 
  details?: Record<string, unknown>,
  req?: NextRequest
) {
  try {
    await prisma.adminLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: details as Prisma.JsonValue,
        ipAddress: getClientIP(req),
        userAgent: req?.headers.get('user-agent') || 'unknown',
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

async function logSecurityEvent(req: NextRequest, event: {
  type: string;
  userId?: string;
  email?: string;
  role?: UserRole;
}) {
  try {
    // Log to console for immediate monitoring
    console.log(`[SECURITY] ${event.type}`, {
      timestamp: new Date().toISOString(),
      ip: getClientIP(req),
      userAgent: req.headers.get('user-agent'),
      ...event
    });

    // In a real application, you might also:
    // - Send to a security monitoring system
    // - Create security alerts
    // - Store in a dedicated security log table
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

function getClientIP(req?: NextRequest): string {
  if (!req) return 'unknown';
  
  return (
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown'
  );
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  // For enhanced security, you could implement API key validation
  // This is useful for service-to-service communication
  try {
    // Check if API key exists and is active
    const key = await prisma.systemSetting.findUnique({
      where: { key: 'admin_api_key' }
    });
    
    return key?.value === apiKey;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

export function rateLimitCheck(req: NextRequest): boolean {
  // Simple rate limiting placeholder
  // In production, use Redis or similar for proper rate limiting
  
  // Example of what a real implementation might look like:
  // const ip = getClientIP(req);
  // const now = Date.now();
  // const windowMs = 60 * 60 * 1000; // 1 hour
  
  // This is a simplified implementation
  // In real scenarios, use proper rate limiting middleware like:
  // - express-rate-limit with Redis store
  // - Upstash Rate Limit
  // - Custom implementation with Redis/Memcached
  
  // For development, we'll log the request and always allow
  console.log(`[RATE_LIMIT] Request from ${getClientIP(req)}`);
  
  // TODO: Implement proper rate limiting
  return true;
}