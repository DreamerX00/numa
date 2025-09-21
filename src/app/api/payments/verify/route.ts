import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Payment verification schema
const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    console.log('Verifying payment...');
    
    // Validate request body
    const body = await req.json();
    const validationResult = verifyPaymentSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Payment verification validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { 
      orderId, 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = validationResult.data;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Invalid Razorpay signature');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Verify order ID matches
    if (order.razorpayOrderId !== razorpay_order_id) {
      console.error('Order ID mismatch');
      return NextResponse.json(
        { success: false, error: 'Order ID mismatch' },
        { status: 400 }
      );
    }

    // Update order status and inventory
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentIntentId: razorpay_payment_id,
          paymentMethod: 'razorpay'
        }
      });

      // Update inventory for each item
      for (const item of order.items) {
        if (item.variantId) {
          // Update variant inventory
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        } else {
          // Update product inventory
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            reason: `Sale - Order ${order.orderNumber}`,
            orderId: order.id,
            performedBy: order.userId || 'guest',
            notes: `Payment ID: ${razorpay_payment_id}`
          }
        });
      }

      // Clear cart items for logged-in users
      if (order.userId) {
        const cartItemIds = order.items.map(item => item.productId);
        await tx.cartItem.deleteMany({
          where: {
            userId: order.userId,
            productId: {
              in: cartItemIds
            }
          }
        });
      }
    });

    console.log('Payment verified and order updated successfully:', orderId);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}