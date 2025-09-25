import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';
import { z } from 'zod';
import { ReturnStatus, ReturnReason } from '@prisma/client';

const createReturnSchema = z.object({
  orderId: z.string(),
  reason: z.string(),
  reasonCategory: z.nativeEnum(ReturnReason),
  returnItems: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1),
    reason: z.string().optional()
  })),
  customerNotes: z.string().optional()
});



export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (status && Object.values(ReturnStatus).includes(status as ReturnStatus)) {
      where.status = status as ReturnStatus;
    }

    if (search) {
      where.OR = [
        { returnNumber: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { order: { user: { email: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const [returns, totalCount] = await Promise.all([
      prisma.return.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                include: {
                  profile: true
                }
              },
              items: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.return.count({ where })
    ]);

    // Calculate stats
    const stats = await prisma.return.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const statusStats = stats.reduce((acc: Record<string, number>, stat: { status: string; _count: { status: number } }) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      returns,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: statusStats
    });

  } catch (error) {
    console.error('Get returns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const data = createReturnSchema.parse(body);

    // Verify order exists and belongs to authenticated user or admin
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        items: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate return items
    for (const returnItem of data.returnItems) {
      const orderItem = order.items.find(item => item.id === returnItem.itemId);
      if (!orderItem) {
        return NextResponse.json(
          { error: `Order item ${returnItem.itemId} not found` },
          { status: 400 }
        );
      }
      
      if (returnItem.quantity > orderItem.quantity) {
        return NextResponse.json(
          { error: `Cannot return more than ordered quantity for item ${returnItem.itemId}` },
          { status: 400 }
        );
      }
    }

    // Generate return number
    const returnCount = await prisma.return.count();
    const returnNumber = `RET-${new Date().getFullYear()}-${String(returnCount + 1).padStart(6, '0')}`;

    // Calculate initial refund amount (can be adjusted by admin)
    const refundAmount = data.returnItems.reduce((total, returnItem) => {
      const orderItem = order.items.find(item => item.id === returnItem.itemId);
      return total + (orderItem ? orderItem.price * returnItem.quantity : 0);
    }, 0);

    // Create return record
    const returnRecord = await prisma.return.create({
      data: {
        orderId: data.orderId,
        returnNumber,
        reason: data.reason,
        reasonCategory: data.reasonCategory,
        returnItems: data.returnItems,
        refundAmount,
        customerNotes: data.customerNotes,
        status: 'REQUESTED'
      },
      include: {
        order: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    // TODO: Send notification to customer and admin

    return NextResponse.json(returnRecord, { status: 201 });

  } catch (error) {
    console.error('Create return error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create return' },
      { status: 500 }
    );
  }
}