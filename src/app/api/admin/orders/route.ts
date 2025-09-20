import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { 
          user: { 
            profile: { 
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } }
              ]
            }
          }
        }
      ];
    }

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
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
          },
          shippingAddress: true,
          billingAddress: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get filter options
    const [statusOptions, paymentStatusOptions] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: { paymentStatus: true }
      })
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      },
      filters: {
        status: statusOptions.map(s => ({ value: s.status, count: s._count.status })),
        paymentStatus: paymentStatusOptions.map(p => ({ value: p.paymentStatus, count: p._count.paymentStatus }))
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();

    // Create order (this would typically be done during checkout, but adding for completeness)
    const order = await prisma.order.create({
      data: {
        ...body,
        orderNumber: `ORD-${Date.now()}`,
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(order);

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}