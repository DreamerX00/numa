import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/session";
import { z } from "zod";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";

// Rate limiter for payment endpoints
const paymentRateLimit = rateLimit(rateLimitConfigs.payment);

// Enhanced validation schema for Razorpay order creation
const razorpayOrderSchema = z.object({
  amount: z.number()
    .min(1, "Amount must be at least ₹1")
    .max(10000000, "Amount cannot exceed ₹1,00,00,000") // 1 crore limit
    .finite("Amount must be a valid number"),
  currency: z.string()
    .length(3, "Currency must be a 3-character code")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters only")
    .optional()
    .default("INR"),
  receipt: z.string()
    .max(40, "Receipt ID cannot exceed 40 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Receipt ID can only contain alphanumeric characters, hyphens, and underscores")
    .optional(),
  notes: z.record(z.string(), z.string().max(255, "Note value cannot exceed 255 characters"))
    .optional()
    .refine(
      (notes) => !notes || Object.keys(notes).length <= 15,
      "Cannot have more than 15 notes"
    )
    .refine(
      (notes) => !notes || Object.keys(notes).every(key => key.length <= 50),
      "Note keys cannot exceed 50 characters"
    )
});

// Contract
// POST /api/razorpay/order
// Body: { amount: number; currency?: string; receipt?: string; notes?: Record<string,string> }
// Response: { id: string; amount: number; currency: string; key_id: string }

export async function POST(req: NextRequest) {
  return paymentRateLimit(req, async () => {
    try {
      const body = await req.json();
      
      // Validate input using Zod schema
      const validationResult = razorpayOrderSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: "Invalid input", details: errors },
          { status: 400 }
        );
      }

      const { amount, currency, receipt, notes } = validationResult.data;
      const finalReceipt = receipt || `rcpt_${Date.now()}`;
      const finalNotes = notes || {};

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: finalReceipt,
      notes: finalNotes as Record<string, string>,
    });

    // Get user for order creation
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Persist Order in DB
    const dbOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: dbUser.id,
        subtotal: Number(order.amount) / 100, // Convert from paise to rupees
        totalAmount: Number(order.amount) / 100,
        currency: order.currency,
        status: "PENDING",
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id, // expose public key to client
        order: { id: dbOrder.id },
      },
      { status: 201 },
    );
    } catch (err: unknown) {
      console.error("/api/razorpay/order error", err);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
  });
}
