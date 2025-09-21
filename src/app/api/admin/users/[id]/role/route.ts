import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction, verifyAdminAuth } from '@/lib/auth/admin';
import { UserRole, AdminLogAction } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get admin authentication details
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth.success || !adminAuth.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { role } = await request.json();
    const userId = id;
    const currentAdminRole = adminAuth.user.role;

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // SECURITY: Role-based authorization checks
    // Only SUPER_ADMIN can promote users to ADMIN or SUPER_ADMIN roles
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      if (currentAdminRole !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only Super Admins can promote users to Admin or Super Admin roles' },
          { status: 403 }
        );
      }
    }

    // Only SUPER_ADMIN can demote other ADMIN or SUPER_ADMIN users
    if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN') {
      if (currentAdminRole !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only Super Admins can demote Admin or Super Admin users' },
          { status: 403 }
        );
      }
    }

    // Prevent Super Admins from demoting themselves
    if (userId === adminAuth.user.id && existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super Admins cannot demote themselves' },
        { status: 403 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: {
        profile: true,
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    });

    // Log admin action
    await logAdminAction(
      adminAuth.user.id,
      AdminLogAction.UPDATE,
      'user',
      userId,
      { oldRole: existingUser.role, newRole: role }
    );

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}