import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/services/razorpay";

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from header
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Missing Razorpay webhook signature");
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const webhookData = JSON.parse(rawBody);
    const event = webhookData.event;
    const payload = webhookData.payload.payment.entity;

    console.log("Razorpay webhook received:", {
      event,
      payment_id: payload.id,
      order_id: payload.order_id,
      status: payload.status,
    });

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
        await handlePaymentAuthorized(payload);
        break;

      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "refund.created":
        await handleRefundCreated(webhookData.payload.refund.entity);
        break;

      case "refund.processed":
        await handleRefundProcessed(webhookData.payload.refund.entity);
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Razorpay webhook processing error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(payment: Record<string, unknown>) {
  try {
    const notes = payment.notes as Record<string, string> | undefined;
    const orderId = notes?.order_id;

    if (!orderId) {
      console.error("Order ID not found in payment notes");
      return;
    }

    // Update order status to PROCESSING
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        paymentStatus: "PENDING", // Use valid PaymentStatus enum value
        paymentIntentId: payment.id as string,
        razorpayOrderId: payment.order_id as string,
      },
    });

    console.log("Payment authorized for order:", orderId);
  } catch (error) {
    console.error("Failed to handle payment.authorized:", error);
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payment: Record<string, unknown>) {
  try {
    const notes = payment.notes as Record<string, string> | undefined;
    const orderId = notes?.order_id;

    if (!orderId) {
      console.error("Order ID not found in payment notes");
      return;
    }

    // Find the order
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
      console.error("Order not found:", orderId);
      return;
    }

    // Update order and inventory in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentIntentId: payment.id as string,
          paymentMethod: "razorpay",
          razorpayOrderId: payment.order_id as string,
        },
      });

      // Update inventory for each item
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: -item.quantity,
            reason: `Sale - Order ${order.orderNumber}`,
            orderId: order.id,
            performedBy: order.userId || "guest",
            notes: `Razorpay Payment ID: ${payment.id}, Method: ${payment.method}`,
          },
        });
      }

      // Clear cart items
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

    console.log("Payment captured and order confirmed:", orderId);
  } catch (error) {
    console.error("Failed to handle payment.captured:", error);
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payment: Record<string, unknown>) {
  try {
    const notes = payment.notes as Record<string, string> | undefined;
    const orderId = notes?.order_id;

    if (!orderId) {
      console.error("Order ID not found in payment notes");
      return;
    }

    // Update order status to FAILED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
        paymentIntentId: payment.id as string,
      },
    });

    console.log("Payment failed for order:", orderId);
  } catch (error) {
    console.error("Failed to handle payment.failed:", error);
  }
}

/**
 * Handle refund.created event
 */
async function handleRefundCreated(refund: Record<string, unknown>) {
  try {
    const paymentId = refund.payment_id as string;

    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: { paymentIntentId: paymentId },
    });

    if (!order) {
      console.error("Order not found for payment:", paymentId);
      return;
    }

    // Update order status - Use PENDING as there's no REFUND_INITIATED status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PENDING", // Temporary status until refund is processed
      },
    });

    console.log("Refund initiated for order:", order.id);
  } catch (error) {
    console.error("Failed to handle refund.created:", error);
  }
}

/**
 * Handle refund.processed event
 */
async function handleRefundProcessed(refund: Record<string, unknown>) {
  try {
    const paymentId = refund.payment_id as string;

    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: { paymentIntentId: paymentId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.error("Order not found for payment:", paymentId);
      return;
    }

    // Update order and restore inventory in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
        },
      });

      // Restore inventory for each item
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "RETURN",
            quantity: item.quantity,
            reason: `Refund - Order ${order.orderNumber}`,
            orderId: order.id,
            performedBy: "system",
            notes: `Razorpay Refund ID: ${refund.id}`,
          },
        });
      }
    });

    console.log("Refund processed and inventory restored for order:", order.id);
  } catch (error) {
    console.error("Failed to handle refund.processed:", error);
  }
}
