import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/service';
import { OrderStatus } from '@prisma/client';

// Update shipping information for an order
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const orderId = params.id;
    const body = await request.json();
    
    const { 
      trackingNumber, 
      carrier, 
      estimatedDelivery,
      shippingStatus = 'SHIPPED' 
    } = body;

    // Validate required fields
    if (!trackingNumber || !carrier) {
      return NextResponse.json(
        { error: 'Tracking number and carrier are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(shippingStatus as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Get the order first
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true
              }
            }
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
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order with shipping information
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: shippingStatus as OrderStatus,
        trackingNumber,
        carrier,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        shippedAt: new Date(),
      },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true
              }
            }
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
    });

    // Create shipping log entry
    await prisma.shippingLog.create({
      data: {
        orderId,
        status: shippingStatus,
        trackingNumber,
        carrier,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        notes: `Order shipped via ${carrier}`,
        updatedBy: authResult.firebaseUser?.email || 'admin',
      }
    });

    // Send shipping confirmation email
    try {
      const customerName = order.user.profile?.displayName || 
                          `${order.user.profile?.firstName || ''} ${order.user.profile?.lastName || ''}`.trim() ||
                          'Valued Customer';

      await sendEmail({
        to: order.user.email!,
        subject: `Order Shipped - ${order.orderNumber}`,
        template: 'orderShipped',
        data: {
          customerName,
          orderNumber: order.orderNumber,
          trackingNumber,
          carrier,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : undefined,
          orderItems: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            image: item.product.images[0]
          }))
        }
      });
    } catch (emailError) {
      console.error('Failed to send shipping confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Shipping information updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Shipping update error:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping information' },
      { status: 500 }
    );
  }
}

// Get shipping information for an order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // Get shipping logs for the order
    const shippingLogs = await prisma.shippingLog.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    return NextResponse.json({
      order,
      shippingLogs
    });

  } catch (error) {
    console.error('Get shipping info error:', error);
    return NextResponse.json(
      { error: 'Failed to get shipping information' },
      { status: 500 }
    );
  }
}