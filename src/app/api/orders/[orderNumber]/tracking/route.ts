import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

// Get tracking information for a customer's order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orderNumber = params.orderNumber;

    // Find the order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: user.id
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        carrier: true,
        estimatedDelivery: true,
        shippedAt: true,
        deliveredAt: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get shipping logs for the order
    const shippingLogs = await prisma.shippingLog.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        carrier: true,
        estimatedDelivery: true,
        notes: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      order,
      shippingLogs
    });

  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}