import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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
      const razorpayPaymentId = String(payment.id);

      const order = await prisma.order.findFirst({ where: { razorpayOrderId: orderIdFromGateway } });
      if (order) {
        // Update order payment status
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            paymentStatus: "PAID",
            paymentMethod: "razorpay",
            paymentIntentId: razorpayPaymentId
          }
        });

        // Update order status to CONFIRMED
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "CONFIRMED" }
        });
      }
    }

    if (type === "payment.failed" && orderIdFromGateway) {
      const razorpayPaymentId = String(payment.id);
      const order = await prisma.order.findFirst({ where: { razorpayOrderId: orderIdFromGateway } });
      if (order) {
        // Update order payment status to failed
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            paymentStatus: "FAILED",
            paymentMethod: "razorpay",
            paymentIntentId: razorpayPaymentId
          }
        });

        // Update order status to CANCELLED
        await prisma.order.update({ 
          where: { id: order.id }, 
          data: { status: "CANCELLED" } 
        });
      }
    }

    return NextResponse.json({ received: true, type });
  } catch (err: unknown) {
    console.error("/api/razorpay/webhook error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
