import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyRazorpaySignature,
  fetchRazorpayPayment,
} from "@/lib/services/razorpay";

// Validation schema for payment verification
const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpay_order_id: z.string().min(1, "Razorpay order ID is required"),
  razorpay_payment_id: z.string().min(1, "Razorpay payment ID is required"),
  razorpay_signature: z.string().min(1, "Razorpay signature is required"),
});

export async function POST(request: NextRequest) {
  try {
    console.log("Verifying Razorpay payment...");

    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "Payment verification validation failed:",
        validationResult.error.issues
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = validationResult.data;

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      console.error("Invalid Razorpay signature");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature",
        },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchRazorpayPayment(razorpay_payment_id);

    // Check if payment is captured
    if (!paymentDetails.captured) {
      console.error("Payment not captured:", razorpay_payment_id);
      return NextResponse.json(
        {
          success: false,
          error: "Payment not captured",
        },
        { status: 400 }
      );
    }

    // Find the order in database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order and inventory in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentIntentId: razorpay_payment_id,
          paymentMethod: "razorpay",
          razorpayOrderId: razorpay_order_id,
        },
      });

      // Update inventory for each item
      for (const item of order.items) {
        if (item.variantId) {
          // Update variant inventory
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          // Update product inventory
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: -item.quantity,
            reason: `Sale - Order ${order.orderNumber}`,
            orderId: order.id,
            performedBy: order.userId || "guest",
            notes: `Razorpay Payment ID: ${razorpay_payment_id}, Method: ${paymentDetails.method}`,
          },
        });
      }

      // Clear cart items for logged-in users
      if (order.userId) {
        const cartItemIds = order.items.map((item) => item.productId);
        await tx.cartItem.deleteMany({
          where: {
            userId: order.userId,
            productId: {
              in: cartItemIds,
            },
          },
        });
      }
    });

    console.log("Razorpay payment verified and order updated successfully:", {
      orderId,
      razorpay_payment_id,
      method: paymentDetails.method,
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
      payment: {
        id: razorpay_payment_id,
        method: paymentDetails.method,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
      },
    });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Payment verification failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
