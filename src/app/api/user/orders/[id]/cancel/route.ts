import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

/**
 * Cancel Order Endpoint
 * POST /api/user/orders/[id]/cancel
 *
 * Allows users to cancel their own pending orders
 * - Validates user ownership
 * - Only allows cancellation of PENDING or payment FAILED orders
 * - Restores inventory
 * - Creates audit trail via OrderNote
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authenticated user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body (optional)
    let body = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body is fine, just use default empty object
      console.log("No body provided for cancel request");
    }

    const validationResult = cancelOrderSchema.safeParse(body);

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

    const { reason } = validationResult.data;

    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user owns this order
    if (order.userId !== dbUser.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    // Only allow cancellation of pending or failed payment orders
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot cancel order that has been shipped or delivered. Please contact support.",
        },
        { status: 400 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Order is already cancelled",
        },
        { status: 400 }
      );
    }

    // Only allow cancellation if payment is pending or failed
    if (order.paymentStatus !== "PENDING" && order.paymentStatus !== "FAILED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot cancel order with completed payment. Please contact support for refund.",
        },
        { status: 400 }
      );
    }

    // Cancel order and restore inventory in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
        },
      });

      // Restore inventory for each item
      for (const item of order.items) {
        if (item.variantId) {
          // Restore variant inventory
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        } else {
          // Restore product inventory
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "ADJUSTMENT",
            quantity: item.quantity,
            reason: `Order cancelled by user - Order #${order.orderNumber}`,
            orderId: order.id,
            performedBy: dbUser.id,
            notes: reason
              ? `Cancellation reason: ${reason}`
              : "User cancelled order",
          },
        });
      }

      // Create order note
      await tx.orderNote.create({
        data: {
          orderId: id,
          authorName: dbUser.email || "Customer",
          note: `Order cancelled by customer${reason ? `: ${reason}` : ""}`,
          isInternal: false,
        },
      });
    });

    console.log(`Order ${order.orderNumber} cancelled by user ${dbUser.email}`);

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: "CANCELLED",
      },
    });
  } catch (error) {
    console.error("Order cancellation error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel order";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
