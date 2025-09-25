import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  getPhonePeConfig, 
  verifyCallbackSignature, 
  decodeCallbackResponse,
  validatePhonePeConfig 
} from '@/lib/services/phonepe';
import type { PhonePeCallbackPayload, PhonePeDecodedCallback } from '@/lib/types/phonepe';
import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from '@/lib/email/templates';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/phonepe/callback - PhonePe webhook handler
export async function POST(request: NextRequest) {
  try {
    // Validate PhonePe configuration
    const configValidation = validatePhonePeConfig();
    if (!configValidation.isValid) {
      console.error('PhonePe configuration errors:', configValidation.errors);
      return NextResponse.json(
        { success: false, error: "Configuration error" }, 
        { status: 500 }
      );
    }

    // Get PhonePe configuration
    const config = getPhonePeConfig();

    // Get callback payload
    const body: PhonePeCallbackPayload = await request.json();
    const xVerifyHeader = request.headers.get('X-VERIFY');

    if (!xVerifyHeader) {
      console.error('Missing X-VERIFY header in PhonePe callback');
      return NextResponse.json(
        { success: false, error: "Missing verification header" }, 
        { status: 400 }
      );
    }

    // Verify callback signature
    const isValidSignature = verifyCallbackSignature(
      body.response, 
      xVerifyHeader, 
      config.saltKey
    );

    if (!isValidSignature) {
      console.error('Invalid signature in PhonePe callback');
      return NextResponse.json(
        { success: false, error: "Invalid signature" }, 
        { status: 400 }
      );
    }

    // Decode callback response
    let decodedResponse: PhonePeDecodedCallback;
    try {
      decodedResponse = decodeCallbackResponse(body.response);
    } catch (error) {
      console.error('Failed to decode PhonePe callback response:', error);
      return NextResponse.json(
        { success: false, error: "Invalid response format" }, 
        { status: 400 }
      );
    }

    console.log('PhonePe callback received:', {
      merchantTransactionId: decodedResponse.merchantTransactionId,
      state: decodedResponse.state,
      responseCode: decodedResponse.responseCode
    });

    // Handle different payment states
    switch (decodedResponse.state) {
      case 'COMPLETED':
        await handlePaymentSuccess(decodedResponse);
        break;
      case 'FAILED':
        await handlePaymentFailure(decodedResponse);
        break;
      case 'PENDING':
        await handlePaymentPending(decodedResponse);
        break;
      default:
        console.warn('Unknown payment state:', decodedResponse.state);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Callback processed successfully" 
    });

  } catch (error: any) {
    console.error('/api/phonepe/callback error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentSuccess(callbackData: PhonePeDecodedCallback) {
  try {
    // Find order by merchant transaction ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: callbackData.merchantTransactionId },
          // If you store merchantTransactionId in a separate field, uncomment:
          // { merchantTransactionId: callbackData.merchantTransactionId }
        ]
      },
      include: {
        user: {
          include: { profile: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    if (order) {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          // Store PhonePe transaction details
          // phonePeTransactionId: callbackData.transactionId,
          // phonePeResponseCode: callbackData.responseCode,
          updatedAt: new Date()
        }
      });

      // Send confirmation email
      if (order.user?.email) {
        try {
          await sendOrderConfirmationEmail({
            to: order.user.email,
            customerName: `${order.user.profile?.firstName || ''} ${order.user.profile?.lastName || ''}`.trim() || 'Customer',
            orderNumber: order.orderNumber,
            orderItems: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price,
              image: item.product.images?.[0] || ''
            })),
            subtotal: order.totalAmount - (order.shippingAmount || 0),
            totalAmount: order.totalAmount
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      console.log(`Payment successful for order ${order.orderNumber}`);
    } else {
      console.warn(`Order not found for merchant transaction ID: ${callbackData.merchantTransactionId}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailure(callbackData: PhonePeDecodedCallback) {
  try {
    // Find order by merchant transaction ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: callbackData.merchantTransactionId },
          // If you store merchantTransactionId in a separate field, uncomment:
          // { merchantTransactionId: callbackData.merchantTransactionId }
        ]
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    if (order) {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          // Store failure details
          // phonePeResponseCode: callbackData.responseCode,
          updatedAt: new Date()
        }
      });

      // Send failure notification email
      if (order.user?.email) {
        try {
          await sendPaymentFailedEmail({
            to: order.user.email,
            customerName: `${order.user.profile?.firstName || ''} ${order.user.profile?.lastName || ''}`.trim() || 'Customer',
            orderNumber: order.orderNumber,
            amount: order.totalAmount
          });
        } catch (emailError) {
          console.error('Failed to send payment failure email:', emailError);
        }
      }

      console.log(`Payment failed for order ${order.orderNumber}: ${callbackData.responseCode}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle pending payment
async function handlePaymentPending(callbackData: PhonePeDecodedCallback) {
  try {
    // Find order by merchant transaction ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: callbackData.merchantTransactionId },
          // If you store merchantTransactionId in a separate field, uncomment:
          // { merchantTransactionId: callbackData.merchantTransactionId }
        ]
      }
    });

    if (order) {
      // Update order status to pending
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PENDING',
          paymentStatus: 'PENDING',
          updatedAt: new Date()
        }
      });

      console.log(`Payment pending for order ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Error handling payment pending:', error);
  }
}