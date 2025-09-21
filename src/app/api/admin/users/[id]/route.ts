import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction, verifyAdminAuth } from '@/lib/auth/admin';
import { AdminLogAction } from '@prisma/client';

export async function DELETE(
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

    const userId = id;
    const currentAdminRole = adminAuth.user.role;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        orders: { select: { id: true } },
        reviews: { select: { id: true } }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // SECURITY: Only SUPER_ADMIN can delete ADMIN or SUPER_ADMIN users
    if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN') {
      if (currentAdminRole !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only Super Admins can delete Admin or Super Admin users' },
          { status: 403 }
        );
      }
    }

    // Prevent Super Admins from deleting themselves
    if (userId === adminAuth.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    // Check if user has orders or reviews (you might want to prevent deletion)
    if (existingUser.orders.length > 0 || existingUser.reviews.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing orders or reviews. Consider deactivating instead.' },
        { status: 400 }
      );
    }

    // Delete user profile first (if exists)
    if (existingUser.profile) {
      await prisma.userProfile.delete({
        where: { userId: userId }
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log admin action
    await logAdminAction(
      adminAuth.user.id,
      AdminLogAction.DELETE,
      'user',
      userId,
      { 
        deletedUser: {
          email: existingUser.email,
          role: existingUser.role
        }
      }
    );

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}