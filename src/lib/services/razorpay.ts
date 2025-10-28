import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    // Use RAZORPAY_KEY_ID (without NEXT_PUBLIC prefix) for server-side
    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay credentials not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
      );
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}

export interface RazorpayOrderOptions {
  amount: number; // Amount in paise (₹1 = 100 paise)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
  partial_payment?: boolean;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  created_at: number;
}

/**
 * Create a Razorpay order
 * @param options Order options
 * @returns Created Razorpay order
 */
export async function createRazorpayOrder(
  options: RazorpayOrderOptions
): Promise<RazorpayOrder> {
  try {
    const razorpay = getRazorpayInstance();

    const orderOptions = {
      amount: options.amount, // Amount in paise
      currency: options.currency || "INR",
      receipt: options.receipt,
      notes: options.notes || {},
      partial_payment: options.partial_payment || false,
    };

    const order = await razorpay.orders.create(orderOptions);
    return order as RazorpayOrder;
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create Razorpay order"
    );
  }
}

/**
 * Verify Razorpay payment signature
 * @param orderId Razorpay order ID
 * @param paymentId Razorpay payment ID
 * @param signature Razorpay signature
 * @returns true if signature is valid
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error("Razorpay key secret not configured");
    }

    // Create expected signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    // Compare signatures using constant time comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Fetch payment details from Razorpay
 * @param paymentId Razorpay payment ID
 * @returns Payment details
 */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayPayment> {
  try {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment as RazorpayPayment;
  } catch (error) {
    console.error("Failed to fetch Razorpay payment:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch payment details"
    );
  }
}

/**
 * Capture a payment
 * @param paymentId Razorpay payment ID
 * @param amount Amount to capture in paise
 * @param currency Currency code (default: INR)
 * @returns Captured payment details
 */
export async function captureRazorpayPayment(
  paymentId: string,
  amount: number,
  currency: string = "INR"
): Promise<RazorpayPayment> {
  try {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.capture(
      paymentId,
      amount,
      currency
    );
    return payment as RazorpayPayment;
  } catch (error) {
    console.error("Failed to capture Razorpay payment:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to capture payment"
    );
  }
}

/**
 * Create a refund
 * @param paymentId Razorpay payment ID
 * @param amount Amount to refund in paise (optional, full refund if not provided)
 * @param notes Additional notes
 * @returns Refund details
 */
export async function createRazorpayRefund(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  try {
    const razorpay = getRazorpayInstance();

    const refundOptions: {
      amount?: number;
      notes?: Record<string, string>;
      speed?: "normal" | "optimum";
    } = {
      notes: notes || {},
      speed: "normal" as const, // 'normal' or 'optimum' for instant refunds
    };

    if (amount) {
      refundOptions.amount = amount;
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error("Failed to create Razorpay refund:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create refund"
    );
  }
}

/**
 * Verify webhook signature
 * @param webhookBody Raw webhook body
 * @param signature Razorpay webhook signature from header
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
  webhookBody: string,
  signature: string
): boolean {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Razorpay webhook secret not configured");
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
}

/**
 * Convert rupees to paise
 * @param rupees Amount in rupees
 * @returns Amount in paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees
 * @param paise Amount in paise
 * @returns Amount in rupees
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
