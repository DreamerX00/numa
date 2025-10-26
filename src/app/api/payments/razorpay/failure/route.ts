import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for payment failure logging
const failureLogSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  error: z.object({
    code: z.string(),
    description: z.string(),
    source: z.string().optional(),
    step: z.string().optional(),
    reason: z.string().optional(),
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = failureLogSchema.safeParse(body);

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

    const { orderId, error, metadata } = validationResult.data;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status to FAILED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
      },
    });

    // Create order note with failure details
    const errorDetails = [
      `Payment failed: ${error.description || error.code}`,
      `Error Code: ${error.code}`,
      error.source && `Source: ${error.source}`,
      error.step && `Step: ${error.step}`,
      error.reason && `Reason: ${error.reason}`,
      metadata && `Metadata: ${JSON.stringify(metadata)}`,
    ]
      .filter(Boolean)
      .join("\n");

    await prisma.orderNote.create({
      data: {
        orderId: orderId,
        authorName: "System",
        note: errorDetails,
        isInternal: true,
      },
    });

    console.log("Razorpay payment failure logged:", {
      orderId,
      error_code: error.code,
      error_description: error.description,
    });

    return NextResponse.json({
      success: true,
      message: "Payment failure logged successfully",
    });
  } catch (error) {
    console.error("Failed to log Razorpay payment failure:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to log payment failure";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
