import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminAuth(request);
    
    if (!adminAuth.success || !adminAuth.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({
      id: adminAuth.user.id,
      role: adminAuth.user.role,
      isActive: adminAuth.user.isActive
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    );
  }
}