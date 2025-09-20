import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: {
      OR?: Array<{
        email?: { contains: string; mode: 'insensitive' };
        profile?: {
          OR: Array<{
            firstName?: { contains: string; mode: 'insensitive' };
            lastName?: { contains: string; mode: 'insensitive' };
            displayName?: { contains: string; mode: 'insensitive' };
          }>;
        };
      }>;
      role?: UserRole;
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { 
          profile: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { displayName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    if (role !== 'all') {
      where.role = role as UserRole;
    }

    if (status !== 'all') {
      where.isActive = status === 'active';
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          _count: {
            select: {
              orders: true,
              reviews: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Get stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, adminUsers, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      adminUsers,
      newUsersThisMonth
    };

    const pagination = {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };

    return NextResponse.json({
      users,
      pagination,
      stats
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}