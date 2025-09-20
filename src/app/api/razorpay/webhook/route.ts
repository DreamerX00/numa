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
      const amount = Number(payment.amount); // in paise
      const currency = String(payment.currency || "INR");
      const razorpayPaymentId = String(payment.id);
      const razorpaySignature = signature;

      const order = await prisma.order.findUnique({ where: { razorpayOrderId: orderIdFromGateway } });
      if (order) {
        // create payment if not exists
        await prisma.payment.upsert({
          where: { razorpayPaymentId },
          create: {
            orderId: order.id,
            amount,
            currency,
            status: "CAPTURED",
            razorpayPaymentId,
            razorpaySignature,
          },
          update: {
            status: "CAPTURED",
          },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
      }
    }

    if (type === "payment.failed" && orderIdFromGateway) {
      const razorpayPaymentId = String(payment.id);
      const order = await prisma.order.findUnique({ where: { razorpayOrderId: orderIdFromGateway } });
      if (order) {
        await prisma.payment.upsert({
          where: { razorpayPaymentId },
          create: {
            orderId: order.id,
            amount: Number(payment.amount),
            currency: String(payment.currency || "INR"),
            status: "FAILED",
            razorpayPaymentId,
            razorpaySignature: signature,
          },
          update: { status: "FAILED" },
        });
        await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      }
    }

    return NextResponse.json({ received: true, type });
  } catch (err: unknown) {
    console.error("/api/razorpay/webhook error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
