"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle 
} from 'lucide-react';
import HeartLoader from '@/components/ui/HeartLoader';

export const dynamic = 'force-dynamic';

interface DashboardData {
  stats: {
    totalUsers: { value: number; change: string; trend: string };
    totalProducts: { value: number; change: string; trend: string };
    totalOrders: { value: number; change: string; trend: string };
    totalRevenue: { value: number; change: string; trend: string };
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    minQuantity: number;
    price: number;
  }>;
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch('/api/admin/dashboard');
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
};

export default function AdminPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-red-600">Error loading dashboard data</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your e-commerce platform</p>
        </div>

        {/* Dashboard Stats */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <HeartLoader size="lg" />
              <p className="text-muted-foreground mt-4">Loading dashboard...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <HeartLoader size="sm" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <AdminDashboardStats data={data} />
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders data={data?.recentOrders} isLoading={isLoading} />
          <LowStockAlerts data={data?.lowStockProducts} isLoading={isLoading} />
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminDashboardStats({ data }: { data?: DashboardData }) {
  if (!data) return null;

  const stats = [
    {
      title: "Total Users",
      value: data.stats.totalUsers.value.toLocaleString(),
      change: data.stats.totalUsers.change,
      trend: data.stats.totalUsers.trend,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Orders", 
      value: data.stats.totalOrders.value.toLocaleString(),
      change: data.stats.totalOrders.change,
      trend: data.stats.totalOrders.trend,
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      title: "Revenue",
      value: formatPrice(data.stats.totalRevenue.value),
      change: data.stats.totalRevenue.change,
      trend: data.stats.totalRevenue.trend,
      icon: DollarSign,
      color: "text-yellow-600"
    },
    {
      title: "Products",
      value: data.stats.totalProducts.value.toLocaleString(),
      change: data.stats.totalProducts.change,
      trend: data.stats.totalProducts.trend,
      icon: Package,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color 
}: { 
  title: string;
  value: string;
  change: string;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="mt-4 flex items-center">
          {TrendIcon && (
            <TrendIcon className={`h-4 w-4 mr-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`} />
          )}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </span>
          <span className="text-sm text-gray-600 ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentOrders({ data, isLoading }: { data?: DashboardData['recentOrders']; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <HeartLoader size="md" />
            <p className="text-sm text-muted-foreground mt-2">Loading recent orders...</p>
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{order.customer}</p>
                  <p className="text-sm text-gray-500">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(order.amount)}</p>
                  <Badge variant={
                    order.status === 'DELIVERED' ? 'default' :
                    order.status === 'SHIPPED' ? 'secondary' :
                    order.status === 'PROCESSING' ? 'outline' : 'destructive'
                  }>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent orders</p>
        )}
      </CardContent>
    </Card>
  );
}

function LowStockAlerts({ data, isLoading }: { data?: DashboardData['lowStockProducts']; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <HeartLoader size="md" />
            <p className="text-sm text-muted-foreground mt-2">Loading stock alerts...</p>
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">Min: {product.minQuantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{product.quantity} left</p>
                  <p className="text-xs text-gray-500">Restock needed</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No low stock alerts</p>
        )}
      </CardContent>
    </Card>
  );
}