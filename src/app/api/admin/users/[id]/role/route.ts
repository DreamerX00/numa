import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction, verifyAdminAuth } from '@/lib/auth/admin';
import { UserRole, AdminLogAction } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { role } = await request.json();
    const userId = id;

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
    const adminAuth = await verifyAdminAuth(request);
    if (adminAuth.success && adminAuth.user) {
      await logAdminAction(
        adminAuth.user.id,
        AdminLogAction.UPDATE,
        'user',
        userId,
        { oldRole: existingUser.role, newRole: role }
      );
    }

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