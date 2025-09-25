import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// PhonePe transaction verification schema
const verifyTransactionSchema = z.object({
  orderId: z.string().min(1),
  merchantTransactionId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    console.log('Verifying PhonePe transaction...');
    
    // Validate request body
    const body = await req.json();
    const validationResult = verifyTransactionSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Transaction verification validation failed:', validationResult.error.issues);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { 
      orderId, 
      merchantTransactionId
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

    // Verify transaction ID matches
    if (order.phonePeMerchantTransactionId !== merchantTransactionId) {
      console.error('Transaction ID mismatch');
      return NextResponse.json(
        { success: false, error: 'Transaction ID mismatch' },
        { status: 400 }
      );
    }

    // Check PhonePe transaction status
    const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/phonepe/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantTransactionId })
    });

    const statusData = await statusResponse.json();
    
    if (!statusData.success || statusData.data?.state !== 'COMPLETED') {
      console.error('PhonePe transaction not completed:', statusData);
      return NextResponse.json(
        { success: false, error: 'Transaction not completed' },
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
          paymentIntentId: statusData.data.transactionId,
          paymentMethod: 'phonepe'
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
            notes: `PhonePe Transaction ID: ${statusData.data.transactionId}`
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

    console.log('PhonePe transaction verified and order updated successfully:', orderId);

    return NextResponse.json({
      success: true,
      message: 'PhonePe transaction verified successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      }
    });

  } catch (error) {
    console.error('PhonePe transaction verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Transaction verification failed';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}