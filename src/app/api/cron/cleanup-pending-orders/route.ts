import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Auto-delete Pending Orders Cron Job
 *
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * to automatically delete orders that have been pending for more than 24 hours
 *
 * Setup:
 * - Add this to vercel.json:
 *   "crons": [{
 *     "path": "/api/cron/cleanup-pending-orders",
 *     "schedule": "0 0 * * *"  // Run daily at midnight (UTC)
 *   }]
 *
 * - Or use a service like cron-job.org to hit this endpoint
 *
 * Note: Vercel Hobby plan only supports daily cron jobs
 * For hourly cleanups, upgrade to Pro or use external cron service
 *
 * Security: Verify request comes from authorized source
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key-here";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Find all pending/failed payment orders older than 24 hours
    const pendingOrders = await prisma.order.findMany({
      where: {
        AND: [
          {
            OR: [{ paymentStatus: "PENDING" }, { paymentStatus: "FAILED" }],
          },
          {
            status: {
              not: "CANCELLED",
            },
          },
          {
            createdAt: {
              lt: twentyFourHoursAgo,
            },
          },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log(`Found ${pendingOrders.length} pending orders to delete`);

    const deletedOrders: string[] = [];
    const errors: Array<{ orderId: string; error: string }> = [];

    // Process each order
    for (const order of pendingOrders) {
      try {
        await prisma.$transaction(async (tx) => {
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
                reason: `Auto-deleted pending order - ${order.orderNumber}`,
                orderId: order.id,
                notes:
                  "Inventory restored due to automatic order deletion (24hr timeout)",
              },
            });
          }

          // Delete order items first (foreign key constraint)
          await tx.orderItem.deleteMany({
            where: { orderId: order.id },
          });

          // Delete order notes
          await tx.orderNote.deleteMany({
            where: { orderId: order.id },
          });

          // Delete shipping logs
          await tx.shippingLog.deleteMany({
            where: { orderId: order.id },
          });

          // Delete the order
          await tx.order.delete({
            where: { id: order.id },
          });
        });

        deletedOrders.push(order.orderNumber);
        console.log(`Deleted order ${order.orderNumber}`);

        // TODO: Optional - Send email notification to user
        // await sendOrderDeletionEmail(order.user.email, order.orderNumber);
      } catch (error) {
        console.error(`Error deleting order ${order.orderNumber}:`, error);
        errors.push({
          orderId: order.orderNumber,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingOrders.length} orders`,
      deleted: deletedOrders.length,
      deletedOrders,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in cleanup-pending-orders cron:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup pending orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (remove in production)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "your-secret-key-here";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Calculate 24 hours ago
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  // Count pending orders
  const count = await prisma.order.count({
    where: {
      AND: [
        {
          OR: [{ paymentStatus: "PENDING" }, { paymentStatus: "FAILED" }],
        },
        {
          status: {
            not: "CANCELLED",
          },
        },
        {
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
      ],
    },
  });

  return NextResponse.json({
    success: true,
    message: `Found ${count} orders that would be deleted`,
    count,
  });
}
