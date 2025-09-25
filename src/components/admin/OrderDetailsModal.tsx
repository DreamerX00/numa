"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  FileText,
  Download,
  MessageSquare,
  Truck,
  RotateCcw,
  Calendar,
  DollarSign,
  Edit3,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ orderId, isOpen, onClose }: OrderDetailsModalProps) {
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const queryClient = useQueryClient();

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return response.json();
    },
    enabled: !!orderId && isOpen
  });

  // Fetch order notes
  const { data: notesData } = useQuery({
    queryKey: ['admin', 'order', orderId, 'notes'],
    queryFn: async () => {
      if (!orderId) return { notes: [] };
      const response = await fetch(`/api/admin/orders/${orderId}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    },
    enabled: !!orderId && isOpen
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteData: { note: string; isInternal: boolean }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      if (!response.ok) throw new Error('Failed to add note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId, 'notes'] });
      setNoteText("");
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setEditingStatus(false);
    }
  });

  // Generate invoice mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'html') => {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      });
      
      if (format === 'pdf') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order?.orderNumber || orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        // Handle HTML format (could open in new window)
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(data.htmlContent);
          newWindow.document.close();
        }
      }
    }
  });

  useEffect(() => {
    if (order && !newStatus) {
      setNewStatus(order.status);
    }
  }, [order, newStatus]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) return null;

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-orange-100 text-orange-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };

  const customerName = order.user.profile?.firstName && order.user.profile?.lastName
    ? `${order.user.profile.firstName} ${order.user.profile.lastName}`
    : order.user.email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            Order {order.orderNumber}
            <div className="flex items-center gap-2">
              {editingStatus ? (
                <div className="flex items-center gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate(newStatus)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingStatus(false);
                      setNewStatus(order.status);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                    {order.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingStatus(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Info */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Customer since {format(new Date(order.user.createdAt), 'MMM yyyy')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Info */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Order Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Date:</span>{' '}
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Payment:</span>{' '}
                      <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                        {order.paymentStatus}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Items:</span> {order.items.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Total */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>{' '}
                      ₹{order.subtotal.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Shipping:</span>{' '}
                      ₹{order.shippingAmount.toFixed(2)}
                    </p>
                    <p className="text-lg font-bold">
                      Total: ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.shippingAddress && (
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.address1}</p>
                      {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {order.billingAddress && (
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium">
                        {order.billingAddress.firstName} {order.billingAddress.lastName}
                      </p>
                      <p>{order.billingAddress.address1}</p>
                      {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                      <p>
                        {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                      </p>
                      <p>{order.billingAddress.country}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: { id: string; product: { images: string[]; name: string }; name?: string; variant?: string; sku?: string; quantity: number; price: number }) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 relative">
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        {item.name !== item.product.name && (
                          <p className="text-sm text-muted-foreground">{item.name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.sku || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price.toFixed(2)} each
                        </p>
                        <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tracking Number</Label>
                    <p className="text-sm">{order.trackingNumber || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Carrier</Label>
                    <p className="text-sm">{order.carrier || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Shipped Date</Label>
                    <p className="text-sm">
                      {order.shippedAt ? format(new Date(order.shippedAt), 'MMM dd, yyyy') : 'Not shipped'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estimated Delivery</Label>
                    <p className="text-sm">
                      {order.estimatedDelivery ? format(new Date(order.estimatedDelivery), 'MMM dd, yyyy') : 'Not estimated'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="internal"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                      />
                      <Label htmlFor="internal" className="text-sm">
                        Internal note (not visible to customer)
                      </Label>
                    </div>
                    <Button
                      onClick={() => addNoteMutation.mutate({ note: noteText, isInternal })}
                      disabled={!noteText.trim() || addNoteMutation.isPending}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-2">
                  {notesData?.notes?.map((note: { id: string; authorName: string; isInternal: boolean; content: string; createdAt: string }) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border ${
                        note.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{note.authorName}</span>
                        <div className="flex items-center gap-2">
                          {note.isInternal && (
                            <Badge variant="secondary" className="text-xs">
                              Internal
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => generateInvoiceMutation.mutate('pdf')}
                    disabled={generateInvoiceMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => generateInvoiceMutation.mutate('html')}
                    disabled={generateInvoiceMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View HTML
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Returns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Process Return
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Update Shipping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}