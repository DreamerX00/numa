import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    // Get dashboard statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      userGrowth,
      salesData,
    ] = await Promise.all([
      // Total users (all roles)
      prisma.user.count(),

      // Total products
      prisma.product.count({ where: { isActive: true } }),

      // Total orders
      prisma.order.count(),

      // Total revenue
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["DELIVERED", "SHIPPED"] } },
      }),

      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            include: { profile: true },
          },
        },
      }),

      // Low stock products
      prisma.product.findMany({
        where: {
          quantity: { lte: 10 },
          trackQuantity: true,
          isActive: true,
        },
        take: 10,
        select: {
          id: true,
          name: true,
          quantity: true,
          minQuantity: true,
          price: true,
        },
      }),

      // User growth (last 30 days) - all roles
      prisma.user.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: true,
      }),

      // Sales data (last 30 days)
      prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          status: { in: ["DELIVERED", "SHIPPED"] },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    // Calculate percentage changes (simplified)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [usersLastMonth, ordersLastMonth] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // Format the response
    const dashboard = {
      stats: {
        totalUsers: {
          value: totalUsers,
          change: usersLastMonth > 0 ? "+" + usersLastMonth : 0,
          trend: "up",
        },
        totalProducts: {
          value: totalProducts,
          change: 0, // Would need historical data
          trend: "neutral",
        },
        totalOrders: {
          value: totalOrders,
          change: ordersLastMonth > 0 ? "+" + ordersLastMonth : 0,
          trend: "up",
        },
        totalRevenue: {
          value: totalRevenue._sum.totalAmount || 0,
          change: 0, // Would need historical data
          trend: "up",
        },
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.profile?.displayName || order.user.email,
        amount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      })),
      lowStockProducts,
      charts: {
        userGrowth: userGrowth.map((item) => ({
          date: item.createdAt,
          count: item._count,
        })),
        salesData: salesData.map((item) => ({
          date: item.createdAt,
          revenue: item._sum.totalAmount || 0,
          orders: item._count,
        })),
      },
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
