import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

// Contract
// POST /api/razorpay/order
// Body: { amount: number; currency?: string; receipt?: string; notes?: Record<string,string> }
// Response: { id: string; amount: number; currency: string; key_id: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = Number(body?.amount);
    const currency = (body?.currency || "INR").toUpperCase();
    const receipt = body?.receipt || `rcpt_${Date.now()}`;
    const notes = body?.notes || {};

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt,
      notes,
    });

    return NextResponse.json(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id, // expose public key to client
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("/api/razorpay/order error", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
