import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    
    // Get user from request
    const user = await getUserFromRequest(req);
    
    // Find the order by order number
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            },
            variant: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            email: true,
            displayName: true
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

    // Check authorization
    if (order.userId && user) {
      const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: user.uid }
      });

      if (!dbUser || order.userId !== dbUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else if (order.userId && !user) {
      // Order belongs to a user but no user is authenticated
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Format order data
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // Customer info
      customer: {
        email: order.guestEmail || order.user?.email,
        name: order.guestName || order.user?.displayName,
        phone: order.guestPhone
      },

      // Items
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        selectedAttributes: item.selectedAttributes,
        product: {
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images.slice(0, 1) // Just first image
        },
        variant: item.variant ? {
          name: item.variant.name,
          sku: item.variant.sku
        } : null
      })),

      // Addresses
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,

      // Pricing
      pricing: {
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        currency: 'INR'
      },

      // Payment
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus,
        razorpayOrderId: order.razorpayOrderId,
        paymentIntentId: order.paymentIntentId
      },

      // Shipping
      shipping: {
        method: order.shippingMethod,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      },

      // Status timeline
      statusTimeline: getStatusTimeline(order)
    };

    return NextResponse.json({
      order: orderData
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

function getStatusTimeline(order: {
  createdAt: Date;
  updatedAt: Date;
  status: string;
  paymentStatus: string;
  trackingNumber?: string | null;
}) {
  const timeline = [
    {
      status: 'PENDING',
      label: 'Order Placed',
      description: 'Your order has been placed successfully',
      timestamp: order.createdAt,
      completed: true
    }
  ];

  if (order.paymentStatus === 'PAID') {
    timeline.push({
      status: 'PAID',
      label: 'Payment Confirmed',
      description: 'Your payment has been processed',
      timestamp: order.updatedAt,
      completed: true
    });
  }

  if (order.status === 'CONFIRMED') {
    timeline.push({
      status: 'CONFIRMED',
      label: 'Order Confirmed',
      description: 'Your order has been confirmed and is being prepared',
      timestamp: order.updatedAt,
      completed: true
    });
  }

  if (order.status === 'PROCESSING') {
    timeline.push({
      status: 'PROCESSING',
      label: 'Processing',
      description: 'Your order is being processed',
      timestamp: order.updatedAt,
      completed: true
    });
  }

  if (order.status === 'SHIPPED') {
    timeline.push({
      status: 'SHIPPED',
      label: 'Shipped',
      description: `Your order has been shipped${order.trackingNumber ? ` - Tracking: ${order.trackingNumber}` : ''}`,
      timestamp: order.updatedAt,
      completed: true
    });
  }

  if (order.status === 'DELIVERED') {
    timeline.push({
      status: 'DELIVERED',
      label: 'Delivered',
      description: 'Your order has been delivered',
      timestamp: order.updatedAt,
      completed: true
    });
  }

  // Add pending states
  const futureStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
  
  for (const status of futureStatuses) {
    if (!timeline.some(item => item.status === status)) {
      const statusLabels: Record<string, { label: string; description: string }> = {
        PROCESSING: {
          label: 'Processing',
          description: 'Your order will be processed'
        },
        SHIPPED: {
          label: 'Shipped',
          description: 'Your order will be shipped'
        },
        DELIVERED: {
          label: 'Delivered',
          description: 'Your order will be delivered'
        }
      };

      timeline.push({
        status,
        label: statusLabels[status].label,
        description: statusLabels[status].description,
        timestamp: null,
        completed: false
      });
    }
  }

  return timeline;
}