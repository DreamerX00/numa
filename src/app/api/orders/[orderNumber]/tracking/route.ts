import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

// Generate tracking URL for different carriers
function generateTrackingUrl(carrier: string, trackingNumber: string): string {
  const trackingUrls: Record<string, string> = {
    'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'UPS': `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`,
    'DHL': `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
    'India Post': `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackingparcel.aspx?pnumber=${trackingNumber}`,
    'BlueDart': `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${trackingNumber}`,
    'DTDC': `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strTtype=AWB%20No.&TrkType=awb_no&strCnno=${trackingNumber}`,
    'Ecom Express': `https://ecomexpress.in/tracking/?awb_field=${trackingNumber}`,
    'Delhivery': `https://www.delhivery.com/track?waybill=${trackingNumber}`,
    'Xpressbees': `https://www.xpressbees.com/courier-tracking?awb=${trackingNumber}`,
  };
  
  return trackingUrls[carrier] || `https://google.com/search?q=${carrier}+tracking+${trackingNumber}`;
}

// Get tracking information for a customer's order (authenticated)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.toUpperCase(),
        userId: user.id
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        fulfillmentStatus: true,
        trackingNumber: true,
        carrier: true,
        estimatedDelivery: true,
        shippedAt: true,
        deliveredAt: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
        shippingAddress: {
          select: {
            firstName: true,
            lastName: true,
            address1: true,
            address2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true
          }
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
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
        createdAt: true,
        updatedBy: true
      }
    });

    // Prepare response with tracking URL and formatted items
    const responseData = {
      order: {
        ...order,
        trackingUrl: order.trackingNumber && order.carrier 
          ? generateTrackingUrl(order.carrier, order.trackingNumber)
          : null,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images[0] || null
        }))
      },
      shippingLogs
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}

// Public tracking endpoint with email verification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required for order verification' },
        { status: 400 }
      );
    }

    // Find order by order number and verify email
    const order = await prisma.order.findFirst({
      where: { 
        orderNumber: orderNumber.toUpperCase(),
        user: {
          email: email.toLowerCase()
        }
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        fulfillmentStatus: true,
        trackingNumber: true,
        carrier: true,
        estimatedDelivery: true,
        shippedAt: true,
        deliveredAt: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
        shippingAddress: {
          select: {
            firstName: true,
            lastName: true,
            address1: true,
            address2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true
          }
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
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
        { error: 'Order not found or email does not match' },
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
        createdAt: true,
        updatedBy: true
      }
    });

    const responseData = {
      order: {
        ...order,
        trackingUrl: order.trackingNumber && order.carrier 
          ? generateTrackingUrl(order.carrier, order.trackingNumber)
          : null,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images[0] || null
        }))
      },
      shippingLogs
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Order tracking verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify and fetch tracking information' },
      { status: 500 }
    );
  }
}