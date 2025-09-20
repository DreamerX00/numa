import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

    // TODO: handle events like 'payment.captured', 'payment.failed'
    // Example: update Order status in DB using event.payload.payment.entity.order_id

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("/api/razorpay/webhook error", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
