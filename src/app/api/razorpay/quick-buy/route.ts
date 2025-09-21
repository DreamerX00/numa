import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

// Rate limiter for demo/quick payment endpoints
const quickPaymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 5, // 5 attempts per minute for demo
});

// Validation schema for quick buy payments
const quickBuySchema = z.object({
  amount: z.number()
    .min(1, "Amount must be at least ₹1")
    .max(10000000, "Amount cannot exceed ₹1,00,00,000")
    .finite("Amount must be a valid number"),
  currency: z.string()
    .length(3, "Currency must be a 3-character code")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters only")
    .optional()
    .default("INR"),
  receipt: z.string()
    .max(40, "Receipt ID cannot exceed 40 characters")
    .optional(),
});

// Contract
// POST /api/razorpay/quick-buy
// Body: { amount: number; currency?: string; receipt?: string }
// Response: { id: string; amount: number; currency: string; key_id: string }

export async function POST(req: NextRequest) {
  return quickPaymentRateLimit(req, async () => {
    try {
      const body = await req.json();
      
      // Validate input using Zod schema
      const validationResult = quickBuySchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: "Invalid input", details: errors },
          { status: 400 }
        );
      }

      const { amount, currency, receipt } = validationResult.data;
      const finalReceipt = receipt || `quick_${Date.now()}`;

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
        notes: {
          type: 'quick_buy',
          source: 'product_page'
        }
      });

      return NextResponse.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id,
      }, { status: 201 });

    } catch (err: unknown) {
      console.error("/api/razorpay/quick-buy error", err);
      return NextResponse.json({ error: "Failed to create quick buy order" }, { status: 500 });
    }
  });
}