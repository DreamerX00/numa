import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction, verifyAdminAuth } from '@/lib/auth/admin';
import { AdminLogAction } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { isActive } = await request.json();
    const userId = id;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid status value' },
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

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
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
        { oldStatus: existingUser.isActive, newStatus: isActive }
      );
    }

    return NextResponse.json({
      message: 'User status updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}