import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromSession,
  createAuthErrorResponse,
} from "@/lib/auth/userSession";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Cancel Order Endpoint
 *
 * Allows users to cancel their own pending orders (unpaid orders only)
 * Automatically restores inventory when order is cancelled
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const authResult = await getUserFromSession(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { dbUser } = authResult.user;
    const { orderId } = params;

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Validation checks
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order belongs to the user
    if (order.userId !== dbUser.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to cancel this order" },
        { status: 403 }
      );
    }

    // Check if order is already cancelled
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    // Only allow cancellation of pending/unpaid orders
    if (order.paymentStatus !== "PENDING" && order.paymentStatus !== "FAILED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only pending or failed payment orders can be cancelled. Please contact support for paid orders.",
        },
        { status: 400 }
      );
    }

    // Don't allow cancellation if order is already shipped/delivered
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel shipped or delivered orders" },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
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
            reason: `Order cancelled - ${order.orderNumber}`,
            orderId: orderId,
            performedBy: dbUser.id,
            notes: "Inventory restored due to order cancellation",
          },
        });
      }

      // Create order note
      await tx.orderNote.create({
        data: {
          orderId: orderId,
          note: "Order cancelled by customer",
          isInternal: false,
          authorName: dbUser.email || "Customer",
        },
      });
    });

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
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel order. Please try again.",
      },
      { status: 500 }
    );
  }
}
