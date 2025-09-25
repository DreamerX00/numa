"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import ShippingModal from '@/components/admin/ShippingModal';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeartLoader from '@/components/ui/HeartLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Types
interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  user: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      images: string[];
    };
  }>;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    shippedOrders: number;
  };
}

// API functions
const api = {
  getOrders: async (page = 1, limit = 20, search = '', status = 'all'): Promise<OrdersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status !== 'all' && { status })
    });
    const response = await fetch(`/api/admin/orders?${params}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
  }
};

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  PROCESSING: { color: 'bg-purple-100 text-purple-800', icon: Package },
  SHIPPED: { color: 'bg-orange-100 text-orange-800', icon: Truck },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [limit] = useState(20);
  const [shippingModal, setShippingModal] = useState<{
    isOpen: boolean;
    order?: Order;
  }>({ isOpen: false });
  
  const queryClient = useQueryClient();

  // Fetch orders
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', currentPage, searchTerm, statusFilter, limit],
    queryFn: () => api.getOrders(currentPage, limit, searchTerm, statusFilter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleOpenShippingModal = (order: Order) => {
    setShippingModal({ isOpen: true, order });
  };

  const handleCloseShippingModal = () => {
    setShippingModal({ isOpen: false });
  };

  const handleShippingUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
  };

  const orders = data?.orders || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getCustomerName = (order: Order) => {
    if (order.user?.profile?.firstName && order.user?.profile?.lastName) {
      return `${order.user.profile.firstName} ${order.user.profile.lastName}`;
    }
    return order.user?.email || 'Unknown Customer';
  };

  // Add safety check for order items
  const getOrderItemsDisplay = (order: Order) => {
    const items = order.items || [];
    return {
      count: items.length,
      displayNames: items.length > 0 
        ? items.slice(0, 2).map(item => item?.product?.name || 'Unknown Product').join(', ')
        : 'No items',
      hasMore: items.length > 2
    };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage customer orders and fulfillment</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Revenue" 
              value={formatCurrency(stats.totalRevenue)} 
              icon={DollarSign}
              trend="up"
              change="+12%"
            />
            <StatsCard 
              title="Total Orders" 
              value={stats.totalOrders.toString()} 
              icon={Package}
              trend="up"
              change="+8%"
            />
            <StatsCard 
              title="Pending Orders" 
              value={stats.pendingOrders.toString()} 
              icon={Clock}
              trend="down"
              change="-5%"
            />
            <StatsCard 
              title="Shipped Orders" 
              value={stats.shippedOrders.toString()} 
              icon={Truck}
              trend="up"
              change="+15%"
            />
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order List</CardTitle>
              <div className="flex items-center space-x-2">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                </form>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <HeartLoader size="lg" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Failed to load orders. Please try again.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? orders.map((order) => {
                      const StatusIcon = statusConfig[order.status]?.icon || Clock;
                      const statusStyle = statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800';
                      const itemsDisplay = getOrderItemsDisplay(order);
                      
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-medium">#{order.orderNumber || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{order.id?.slice(0, 8) || 'No ID'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{getCustomerName(order)}</div>
                            <div className="text-sm text-gray-500">{order.user?.email || 'No email'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {itemsDisplay.count} item{itemsDisplay.count !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              {itemsDisplay.displayNames}
                              {itemsDisplay.hasMore && '...'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(order.totalAmount || 0)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusStyle}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {order.status || 'UNKNOWN'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/orders/${order.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {order.status === 'PENDING' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                                  >
                                    Confirm Order
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'CONFIRMED' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                                  >
                                    Start Processing
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'PROCESSING' && (
                                  <DropdownMenuItem
                                    onClick={() => handleOpenShippingModal(order)}
                                  >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Manage Shipping
                                  </DropdownMenuItem>
                                )}
                                {['SHIPPED', 'DELIVERED'].includes(order.status) && (
                                  <DropdownMenuItem
                                    onClick={() => handleOpenShippingModal(order)}
                                  >
                                    <Truck className="h-4 w-4 mr-2" />
                                    Update Shipping
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'SHIPPED' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                  >
                                    Mark as Delivered
                                  </DropdownMenuItem>
                                )}
                                {['PENDING', 'CONFIRMED'].includes(order.status) && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                                  >
                                    Cancel Order
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} orders
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setCurrentPage(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setCurrentPage(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipping Modal */}
      {shippingModal.order && (
        <ShippingModal
          isOpen={shippingModal.isOpen}
          onClose={handleCloseShippingModal}
          order={shippingModal.order}
          onUpdate={handleShippingUpdate}
        />
      )}
    </AdminLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

function StatsCard({ title, value, icon: Icon, trend, change }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="mt-4">
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {change}
          </span>
          <span className="text-sm text-gray-600 ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}