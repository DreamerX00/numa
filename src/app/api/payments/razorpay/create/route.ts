import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRazorpayOrder, rupeesToPaise } from "@/lib/services/razorpay";
import { getCompanySettings } from "@/lib/services/companySettings";

// Validation schema for order creation
const createOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive("Amount must be positive"),
  customerEmail: z.string().email("Valid email required").optional(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { orderId, amount, customerEmail, customerPhone, customerName } =
      validationResult.data;

    // Get company settings for GST calculation
    const companySettings = await getCompanySettings();
    const gstRate = companySettings.gstRate || 0.18; // Default to 18% if not set

    // Calculate GST
    const subtotal = amount;
    const gstAmount = subtotal * gstRate;
    const totalAmount = subtotal + gstAmount;

    // Convert to paise (Razorpay requires amount in paise)
    const amountInPaise = rupeesToPaise(totalAmount);

    // Create order notes with GST breakdown
    const orderNotes = {
      order_id: orderId,
      subtotal: subtotal.toFixed(2),
      gst_rate: (gstRate * 100).toFixed(2) + "%",
      gst_amount: gstAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      ...(customerEmail && { customer_email: customerEmail }),
      ...(customerPhone && { customer_phone: customerPhone }),
      ...(customerName && { customer_name: customerName }),
    };

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId,
      notes: orderNotes,
    });

    console.log("Razorpay order created successfully:", {
      razorpay_order_id: razorpayOrder.id,
      order_id: orderId,
      amount: razorpayOrder.amount,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      breakdown: {
        subtotal: subtotal,
        gstRate: gstRate,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create Razorpay order";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
