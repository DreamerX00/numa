import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get overview metrics
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      previousRevenue,
      previousOrders,
      previousCustomers
    ] = await Promise.all([
      // Current period revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: { totalAmount: true }
      }),
      // Current period orders
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      }),
      // Current period customers
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          role: 'CUSTOMER'
        }
      }),
      // Total products
      prisma.product.count({
        where: { isActive: true }
      }),
      // Previous period revenue for comparison
      prisma.order.aggregate({
        where: {
          createdAt: { 
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate 
          },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: { totalAmount: true }
      }),
      // Previous period orders
      prisma.order.count({
        where: {
          createdAt: { 
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate 
          },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      }),
      // Previous period customers
      prisma.user.count({
        where: {
          createdAt: { 
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate 
          },
          role: 'CUSTOMER'
        }
      })
    ]);

    // Calculate growth percentages
    const currentRevenue = totalRevenue._sum.totalAmount || 0;
    const prevRevenue = previousRevenue._sum.totalAmount || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const ordersGrowth = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;
    const customersGrowth = previousCustomers > 0 ? ((totalCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    const avgOrderValue = totalOrders > 0 ? currentRevenue / totalOrders : 0;

    // Get daily sales data for chart (using aggregation instead of raw query)
    const salesData = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    });

    // Group by date
    const salesByDate = salesData.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, orders: 0 };
      }
      acc[date].revenue += Number(order.totalAmount);
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, { revenue: number; orders: number }>);

    const formattedSalesChart = Object.entries(salesByDate).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    }));

    // Get top products (using proper aggregation)
    const topProductsData = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      },
      include: {
        product: {
          select: { id: true, name: true }
        }
      }
    });

    // Group by product and calculate totals
    const productStats = topProductsData.reduce((acc, item) => {
      const productId = item.product.id;
      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          name: item.product.name,
          sales: 0,
          revenue: 0
        };
      }
      acc[productId].sales += item.quantity;
      acc[productId].revenue += Number(item.price) * item.quantity;
      return acc;
    }, {} as Record<string, { id: string; name: string; sales: number; revenue: number }>);

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get order status distribution
    const orderStatusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: { status: true }
    });

    const totalOrdersForStatus = orderStatusCounts.reduce((sum, item) => sum + item._count.status, 0);
    const orderStats = orderStatusCounts.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: totalOrdersForStatus > 0 ? Math.round((item._count.status / totalOrdersForStatus) * 100) : 0
    }));

    // Get customer metrics
    const [newCustomers, returningCustomers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          role: 'CUSTOMER'
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { lt: startDate },
          role: 'CUSTOMER',
          orders: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        }
      })
    ]);

    const customerRetention = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

    // Calculate average lifetime value (simplified)
    const avgLifetimeValue = totalCustomers > 0 ? currentRevenue / totalCustomers : 0;

    // Get recent activity (simplified mock data since we don't have activity tracking)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    const recentActivity = recentOrders.map(order => ({
      id: order.id,
      type: 'order' as const,
      description: `New order from ${order.user.profile?.firstName || order.user.email}`,
      timestamp: order.createdAt.toISOString(),
      value: Number(order.totalAmount)
    }));

    // Mock traffic sources data (would come from analytics service in real app)
    const trafficSources = [
      { source: 'Direct', visitors: 1250, conversions: 125, conversionRate: 10.0 },
      { source: 'Google Search', visitors: 980, conversions: 78, conversionRate: 8.0 },
      { source: 'Social Media', visitors: 654, conversions: 45, conversionRate: 6.9 },
      { source: 'Email Campaign', visitors: 432, conversions: 52, conversionRate: 12.0 },
      { source: 'Referral', visitors: 234, conversions: 28, conversionRate: 12.0 }
    ];

    const analytics = {
      overview: {
        totalRevenue: currentRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        ordersGrowth: Number(ordersGrowth.toFixed(1)),
        customersGrowth: Number(customersGrowth.toFixed(1)),
        avgOrderValue: Number(avgOrderValue.toFixed(2))
      },
      salesChart: formattedSalesChart,
      topProducts: topProducts,
      customerMetrics: {
        newCustomers,
        returningCustomers,
        customerRetention,
        avgLifetimeValue: Number(avgLifetimeValue.toFixed(2))
      },
      orderStats,
      trafficSources,
      recentActivity
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}