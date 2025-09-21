import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from "@/lib/email/templates";

// Contract
// POST /api/razorpay/webhook
// Razorpay sends payload with signature header: 'x-razorpay-signature'
// We'll verify signature using RAZORPAY_WEBHOOK_SECRET and return 200 if valid.

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const text = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(text);
    const digest = hmac.digest("hex");

    const verified = digest === signature;
    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(text);

    // Handle key events
    const type: string = event.event;
    const payment = event?.payload?.payment?.entity;
    const orderIdFromGateway: string | undefined = payment?.order_id;

    if (type === "payment.captured" && orderIdFromGateway) {
      await handlePaymentCaptured(payment, orderIdFromGateway);
    }

    if (type === "payment.failed" && orderIdFromGateway) {
      await handlePaymentFailed(payment, orderIdFromGateway);
    }

    return NextResponse.json({ received: true, type });
  } catch (err: unknown) {
    console.error("/api/razorpay/webhook error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Handle successful payment
async function handlePaymentCaptured(payment: { id: string; order_id: string; amount: number }, orderIdFromGateway: string) {
  const razorpayPaymentId = String(payment.id);

  // Use transaction to ensure data consistency
  await prisma.$transaction(async (tx) => {
    // Find order with full details
    const order = await tx.order.findFirst({ 
      where: { razorpayOrderId: orderIdFromGateway },
      include: {
        user: {
          include: { profile: true }
        },
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true
      }
    });

    if (!order) {
      throw new Error(`Order not found for payment: ${razorpayPaymentId}`);
    }

    // Update order payment status
    await tx.order.update({
      where: { id: order.id },
      data: { 
        paymentStatus: "PAID",
        paymentMethod: "razorpay",
        paymentIntentId: razorpayPaymentId,
        status: "CONFIRMED",
        updatedAt: new Date()
      }
    });

    // Deduct inventory for each order item
    for (const item of order.items) {
      if (item.product.trackQuantity) {
        // Check if sufficient stock exists
        const currentProduct = await tx.product.findUnique({
          where: { id: item.product.id },
          select: { quantity: true, name: true }
        });

        if (!currentProduct || currentProduct.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${currentProduct?.name || item.product.name}`);
        }

        // Deduct inventory atomically
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            quantity: {
              decrement: item.quantity
            },
            updatedAt: new Date()
          }
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.product.id,
            type: 'SALE',
            quantity: -item.quantity,
            reason: `Order ${order.orderNumber}`,
            orderId: order.id
          }
        }).catch(() => {
          // Inventory log is optional, don't fail transaction
          console.log('Failed to create inventory log for product:', item.product.id);
        });
      }
    }

    // Send order confirmation email (async, don't block webhook)
    setImmediate(async () => {
      try {
        await sendOrderConfirmationEmail({
          to: order.user.email,
          customerName: order.user.profile?.firstName || order.user.email.split('@')[0],
          orderNumber: order.orderNumber,
          orderItems: order.items.map(item => ({
            name: item.product.name,
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
        console.log(`Order confirmation email sent for order ${order.orderNumber}`);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }
    });
  });

  console.log(`Payment captured and order confirmed: ${razorpayPaymentId}`);
}

// Handle failed payment
async function handlePaymentFailed(payment: { id: string; order_id: string }, orderIdFromGateway: string) {
  const razorpayPaymentId = String(payment.id);
  
  const order = await prisma.order.findFirst({ 
    where: { razorpayOrderId: orderIdFromGateway },
    include: {
      user: {
        include: { profile: true }
      }
    }
  });

  if (!order) {
    console.error(`Order not found for failed payment: ${razorpayPaymentId}`);
    return;
  }

  // Update order payment status to failed
  await prisma.order.update({
    where: { id: order.id },
    data: { 
      paymentStatus: "FAILED",
      paymentMethod: "razorpay",
      paymentIntentId: razorpayPaymentId,
      status: "CANCELLED",
      updatedAt: new Date()
    }
  });

  // Send payment failed email (async, don't block webhook)
  setImmediate(async () => {
    try {
      await sendPaymentFailedEmail({
        to: order.user.email,
        customerName: order.user.profile?.firstName || order.user.email.split('@')[0],
        orderNumber: order.orderNumber,
        amount: order.totalAmount
      });
      console.log(`Payment failed email sent for order ${order.orderNumber}`);
    } catch (emailError) {
      console.error('Failed to send payment failed email:', emailError);
    }
  });

  console.log(`Payment failed and order cancelled: ${razorpayPaymentId}`);
}
