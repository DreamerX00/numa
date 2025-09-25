"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReviewForm from "@/components/reviews/ReviewForm";
import {
  Package,
  Truck,
  CheckCircle,
  RotateCcw,
  Star,
  Search,
  Filter,
  Download,
  Eye,
  MessageCircle,
  Calendar,
  MapPin,
  DollarSign,
  MoreHorizontal,
  ArrowLeft,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import type { OrderSummary } from "@/types/profile";

// Mock detailed order data
const mockOrders: (OrderSummary & {
  items: Array<{
    id: string;
    name: string;
    variant: string;
    quantity: number;
    price: number;
    image: string;
    sku: string;
  }>;
  shipping: {
    method: string;
    cost: number;
    address: string;
  };
  payment: {
    method: string;
    last4: string;
  };
})[] = [
  {
    id: "order_1",
    orderNumber: "NUMA-2024-001",
    status: "delivered",
    totalAmount: 1250.00,
    currency: "USD",
    itemCount: 2,
    orderDate: new Date("2024-08-15"),
    estimatedDelivery: new Date("2024-08-20"),
    trackingNumber: "1Z999AA1234567890",
    thumbnail: DEFAULT_IMAGES.PRODUCT,
    canReturn: true,
    canReview: true,
    items: [
      {
        id: "item_1",
        name: "Elegant Diamond Ring",
        variant: "18K Gold, Size 7",
        quantity: 1,
        price: 950.00,
        image: DEFAULT_IMAGES.PRODUCT,
        sku: "RING-DIA-001"
      },
      {
        id: "item_2",
        name: "Pearl Earrings",
        variant: "White Gold",
        quantity: 1,
        price: 300.00,
        image: DEFAULT_IMAGES.PRODUCT,
        sku: "EAR-PEARL-002"
      }
    ],
    shipping: {
      method: "Express Delivery",
      cost: 15.00,
      address: "123 Main St, New York, NY 10001"
    },
    payment: {
      method: "Credit Card",
      last4: "4242"
    }
  },
  {
    id: "order_2",
    orderNumber: "NUMA-2024-002",
    status: "shipped",
    totalAmount: 890.00,
    currency: "USD",
    itemCount: 1,
    orderDate: new Date("2024-09-10"),
    estimatedDelivery: new Date("2024-09-22"),
    trackingNumber: "1Z999AA1234567891",
    thumbnail: "DEFAULT_IMAGES.PRODUCT",
    canReturn: false,
    canReview: false,
    items: [
      {
        id: "item_3",
        name: "Gold Chain Necklace",
        variant: "22K Gold, 18 inches",
        quantity: 1,
        price: 875.00,
        image: "DEFAULT_IMAGES.PRODUCT",
        sku: "NECK-GOLD-003"
      }
    ],
    shipping: {
      method: "Standard Delivery",
      cost: 10.00,
      address: "123 Main St, New York, NY 10001"
    },
    payment: {
      method: "Credit Card",
      last4: "4242"
    }
  },
  {
    id: "order_3",
    orderNumber: "NUMA-2024-003",
    status: "processing",
    totalAmount: 2150.00,
    currency: "USD",
    itemCount: 3,
    orderDate: new Date("2024-09-18"),
    estimatedDelivery: new Date("2024-09-25"),
    trackingNumber: undefined,
    thumbnail: "DEFAULT_IMAGES.PRODUCT",
    canReturn: false,
    canReview: false,
    items: [
      {
        id: "item_4",
        name: "Luxury Watch",
        variant: "Rose Gold, Leather Strap",
        quantity: 1,
        price: 1800.00,
        image: "DEFAULT_IMAGES.PRODUCT",
        sku: "WATCH-LUX-001"
      },
      {
        id: "item_5",
        name: "Silver Bracelet",
        variant: "Sterling Silver",
        quantity: 2,
        price: 175.00,
        image: "DEFAULT_IMAGES.PRODUCT",
        sku: "BRAC-SIL-004"
      }
    ],
    shipping: {
      method: "Express Delivery",
      cost: 15.00,
      address: "123 Main St, New York, NY 10001"
    },
    payment: {
      method: "Credit Card",
      last4: "4242"
    }
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />;
    case "processing":
      return <RefreshCw className="h-4 w-4" />;
    case "shipped":
      return <Truck className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4" />;
    case "returned":
      return <RotateCcw className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-purple-100 text-purple-800";
    case "shipped":
      return "bg-orange-100 text-orange-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "returned":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface OrderManagementProps {
  orders?: OrderSummary[];
}

export function OrderManagement({ orders = mockOrders }: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [reviewProductName, setReviewProductName] = useState<string>("");
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const selectedOrderDetails = selectedOrder ? 
    mockOrders.find(order => order.id === selectedOrder) : null;

  const handleReviewClick = (productId: string, productName: string) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setShowReviewDialog(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewDialog(false);
    setReviewProductId(null);
    setReviewProductName("");
    // Could show a success message here
  };

  const handleDownloadInvoice = async (orderId: string, format: 'pdf' | 'html' = 'pdf') => {
    setDownloadingInvoice(orderId);
    try {
      const response = await fetch(`/api/user/orders/${orderId}/invoice?format=${format}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to download invoice' }));
        throw new Error(errorData.error || 'Failed to download invoice');
      }

      if (format === 'pdf') {
        // Handle PDF download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Invoice downloaded successfully');
      } else {
        // Handle HTML view in new tab
        const htmlContent = await response.text();
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  if (selectedOrderDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Order {selectedOrderDetails.orderNumber}
                  <Badge className={getStatusColor(selectedOrderDetails.status)}>
                    {getStatusIcon(selectedOrderDetails.status)}
                    <span className="ml-1 capitalize">{selectedOrderDetails.status}</span>
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Placed on {selectedOrderDetails.orderDate ? new Date(selectedOrderDetails.orderDate).toLocaleDateString() : 'Date not available'}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedOrderDetails.items.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg hover-lift"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.variant}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="font-semibold">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            {selectedOrderDetails.status === "delivered" && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  {(() => {
                    const baseDate = selectedOrderDetails.orderDate ? new Date(selectedOrderDetails.orderDate) : new Date();
                    return [
                      { status: "Order Placed", date: baseDate, completed: true },
                      { status: "Payment Confirmed", date: baseDate, completed: true },
                      { status: "Processing", date: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000), completed: true },
                      { status: "Shipped", date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000), completed: true },
                      { status: "Delivered", date: selectedOrderDetails.estimatedDelivery ? new Date(selectedOrderDetails.estimatedDelivery) : null, completed: true },
                    ];
                  })().map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className="font-medium">{step.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {step.date?.toLocaleDateString()} {step.date?.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary & Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(selectedOrderDetails.totalAmount - selectedOrderDetails.shipping.cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({selectedOrderDetails.shipping.method})</span>
                  <span>${selectedOrderDetails.shipping.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${selectedOrderDetails.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrderDetails.shipping.address}
                    </p>
                  </div>
                </div>
                {selectedOrderDetails.trackingNumber && (
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Tracking Number</p>
                      <p className="text-sm font-mono text-brand">
                        {selectedOrderDetails.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedOrderDetails.payment.method}</p>
                    <p className="text-sm text-muted-foreground">
                      Ending in {selectedOrderDetails.payment.last4}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              {selectedOrderDetails.trackingNumber && (
                <Button className="w-full">
                  <Truck className="h-4 w-4 mr-2" />
                  Track Package
                </Button>
              )}
              {selectedOrderDetails.canReturn && (
                <Button variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return Items
                </Button>
              )}
              {selectedOrderDetails.canReview && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleReviewClick("product_123", selectedOrderDetails.items[0]?.name || "Product")}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              )}
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => handleDownloadInvoice(selectedOrderDetails.id)}
                disabled={downloadingInvoice === selectedOrderDetails.id}
              >
                {downloadingInvoice === selectedOrderDetails.id ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {downloadingInvoice === selectedOrderDetails.id ? 'Downloading...' : 'Download Invoice'}
              </Button>
              <Button variant="ghost" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand" />
                Order History
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track and manage your orders
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("delivered")}>
                    Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("shipped")}>
                    Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("processing")}>
                    Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                    Pending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({orders.filter(o => !['delivered', 'cancelled', 'returned'].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({orders.filter(o => o.status === 'delivered').length})
          </TabsTrigger>
          <TabsTrigger value="returns">
            Returns ({orders.filter(o => o.status === 'returned').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover-lift cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Image
                      src={order.thumbnail}
                      alt="Order"
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{order.orderNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.itemCount} item{order.itemCount > 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedOrder(order.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {order.trackingNumber && (
                                <DropdownMenuItem>
                                  <Truck className="h-4 w-4 mr-2" />
                                  Track Package
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDownloadInvoice(order.id)}
                                disabled={downloadingInvoice === order.id}
                              >
                                {downloadingInvoice === order.id ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4 mr-2" />
                                )}
                                {downloadingInvoice === order.id ? 'Downloading...' : 'Download Invoice'}
                              </DropdownMenuItem>
                              {order.canReturn && (
                                <DropdownMenuItem>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Return Items
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Ordered {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Date not available'}
                        </div>
                        {order.estimatedDelivery && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            {order.status === 'delivered' ? 'Delivered' : 'Expected'} {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.trackingNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Other tab contents with filtered orders */}
        {['active', 'delivered', 'returns'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {filteredOrders
              .filter((order) => {
                if (tabValue === 'active') return !['delivered', 'cancelled', 'returned'].includes(order.status);
                if (tabValue === 'delivered') return order.status === 'delivered';
                if (tabValue === 'returns') return order.status === 'returned';
                return true;
              })
              .map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover-lift cursor-pointer" onClick={() => setSelectedOrder(order.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Image
                          src={order.thumbnail}
                          alt="Order"
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.itemCount} item{order.itemCount > 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Date not available'}
                            </div>
                            {order.trackingNumber && (
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                {order.trackingNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </TabsContent>
        ))}
      </Tabs>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "You haven't placed any orders yet."
              }
            </p>
            <Button asChild>
              <Link href="/collections">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          {reviewProductId && (
            <ReviewForm
              productId={reviewProductId}
              productName={reviewProductName}
              onSuccess={handleReviewSubmitted}
              onCancel={() => setShowReviewDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
