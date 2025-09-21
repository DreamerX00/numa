import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { sendEmail, verifyEmailConfig } from '@/lib/email/service';
import { sendOrderConfirmationEmail, sendPaymentFailedEmail, sendShippingConfirmationEmail } from '@/lib/email/templates';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Email test schema
const testEmailSchema = z.object({
  type: z.enum(['test', 'order_confirmation', 'payment_failed', 'shipping_confirmation']),
  to: z.string().email(),
  orderId: z.string().optional()
});

// Contract
// POST /api/admin/email/test
// Body: { type: string, to: string, orderId?: string }
// Response: { success: boolean, messageId?: string, error?: string }

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const validationResult = testEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        { error: "Invalid request", details: errors },
        { status: 400 }
      );
    }

    const { type, to, orderId } = validationResult.data;

    let result;

    switch (type) {
      case 'test':
        result = await sendEmail({
          to,
          subject: 'NUMA Email Test',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #E7654D;">Email Configuration Test</h1>
              <p>This is a test email from your NUMA store to verify email configuration.</p>
              <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
              <p>If you received this email, your email configuration is working correctly!</p>
            </div>
          `,
          text: 'NUMA Email Test - If you received this email, your configuration is working!'
        });
        break;

      case 'order_confirmation':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required for order confirmation test' }, { status: 400 });
        }
        
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: { include: { profile: true } },
            items: { include: { product: true } },
            shippingAddress: true
          }
        });

        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        result = await sendOrderConfirmationEmail({
          to,
          customerName: order.user.profile?.firstName || 'Customer',
          orderNumber: order.orderNumber,
          orderItems: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.product.images[0] || ''
          })),
          subtotal: order.subtotal,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress ? {
            firstName: order.shippingAddress.firstName,
            lastName: order.shippingAddress.lastName,
            address: order.shippingAddress.address1,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country
          } : undefined
        });
        break;

      case 'payment_failed':
        result = await sendPaymentFailedEmail({
          to,
          customerName: 'Test Customer',
          orderNumber: 'ORD-TEST-123',
          amount: 2500.00
        });
        break;

      case 'shipping_confirmation':
        result = await sendShippingConfirmationEmail({
          to,
          customerName: 'Test Customer',
          orderNumber: 'ORD-TEST-123',
          trackingNumber: 'TRK123456789',
          estimatedDelivery: '3-5 business days'
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `${type} email sent successfully`
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    }, { status: 500 });
  }
}

// GET /api/admin/email/test - Check email configuration
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const isConfigured = await verifyEmailConfig();
    
    return NextResponse.json({
      configured: isConfigured,
      settings: {
        host: process.env.SMTP_HOST || 'Not configured',
        port: process.env.SMTP_PORT || 'Not configured',
        user: process.env.SMTP_USER ? '****' + process.env.SMTP_USER.slice(-10) : 'Not configured',
        fromEmail: process.env.FROM_EMAIL || 'Not configured',
        fromName: process.env.FROM_NAME || 'Not configured'
      }
    });
  } catch (error) {
    return NextResponse.json({
      configured: false,
      error: error instanceof Error ? error.message : 'Configuration check failed'
    }, { status: 500 });
  }
}