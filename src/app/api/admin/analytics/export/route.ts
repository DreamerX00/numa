import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

// Export analytics data
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const range = searchParams.get('range') || '30d';
    const status = searchParams.get('status') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    let dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
    const now = new Date();
    
    if (range === 'custom' && startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else {
      let days = 30;
      switch (range) {
        case '7d':
          days = 7;
          break;
        case '90d':
          days = 90;
          break;
        case '1y':
          days = 365;
          break;
        default:
          days = 30;
      }
      
      const startOfPeriod = new Date(now);
      startOfPeriod.setDate(now.getDate() - days);
      
      dateFilter = {
        createdAt: {
          gte: startOfPeriod
        }
      };
    }

    // Status filter
    let statusFilter: { status?: OrderStatus } = {};
    if (status !== 'all' && Object.values(OrderStatus).includes(status as OrderStatus)) {
      statusFilter = { status: status as OrderStatus };
    }

    // Get orders for export
    const orders = await prisma.order.findMany({
      where: { ...dateFilter, ...statusFilter },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      // Generate CSV data
      const csvHeaders = [
        'Order Number',
        'Date',
        'Customer Email',
        'Customer Name',
        'Status',
        'Total Amount',
        'Items Count',
        'Product Names'
      ];

      const csvRows = orders.map(order => [
        order.orderNumber,
        order.createdAt.toISOString().split('T')[0],
        order.user.email,
        `${order.user.profile?.firstName || ''} ${order.user.profile?.lastName || ''}`.trim() || 'N/A',
        order.status,
        order.totalAmount.toString(),
        order.items.length.toString(),
        order.items.map(item => item.product.name).join('; ')
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="order-analytics-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    if (format === 'pdf') {
      // For PDF, we would need a PDF generation library like puppeteer or jsPDF
      // For now, return a simple JSON with instructions
      const reportData = {
        title: 'Order Analytics Report',
        dateRange: `${range} (${startDate || 'auto'} to ${endDate || 'auto'})`,
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0
        },
        orders: orders.map(order => ({
          orderNumber: order.orderNumber,
          date: order.createdAt.toISOString().split('T')[0],
          customer: `${order.user.profile?.firstName || ''} ${order.user.profile?.lastName || ''}`.trim() || order.user.email,
          status: order.status,
          amount: order.totalAmount,
          itemsCount: order.items.length
        }))
      };

      return NextResponse.json({
        message: 'PDF export would be generated here',
        data: reportData
      });
    }

    return NextResponse.json(
      { error: 'Unsupported format. Use csv or pdf.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}