'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface OrderTrackingInfo {
  id: string;
  orderNumber: string;
  status: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  totalAmount: number;
  currency: string;
  shippingAddress?: {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

interface ShippingLog {
  id: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedBy: string;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [orderInfo, setOrderInfo] = useState<{ order: OrderTrackingInfo; shippingLogs: ShippingLog[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!orderNumber.trim() || !email.trim()) return;
    
    setIsSearching(true);
    setError('');
    setOrderInfo(null);

    try {
      const response = await fetch('/api/track-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track order');
      }

      setOrderInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track order');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setOrderNumber('');
    setEmail('');
    setOrderInfo(null);
    setError('');
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
      case 'fulfilled':
        return <Package className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'shipped':
      case 'in_transit':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing':
      case 'fulfilled':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order number and email address to track your shipment and get real-time updates on your delivery status.
          </p>
        </div>

        {/* Search Section */}
        {!orderInfo && (
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="text-center">Find Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="ORDER-123456789 or 123456789"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use the email address associated with your order
                </p>
              </div>
              
              <Button 
                onClick={handleSearch}
                disabled={!orderNumber.trim() || !email.trim() || isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Again Button */}
        {orderInfo && (
          <div className="text-center mb-6">
            <Button variant="outline" onClick={handleReset}>
              Search Another Order
            </Button>
          </div>
        )}

        {/* Order Tracking Results */}
        {orderInfo && (
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(orderInfo.order.fulfillmentStatus)}`}>
                    {getStatusIcon(orderInfo.order.fulfillmentStatus)}
                    <span className="ml-2 capitalize">{orderInfo.order.fulfillmentStatus.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium">{orderInfo.order.orderNumber}</p>
                  </div>
                  {orderInfo.order.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Tracking Number</p>
                      <div className="flex items-center">
                        <p className="font-medium mr-2">{orderInfo.order.trackingNumber}</p>
                        {orderInfo.order.trackingUrl && (
                          <Link
                            href={orderInfo.order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                  {orderInfo.order.carrier && (
                    <div>
                      <p className="text-sm text-gray-500">Carrier</p>
                      <p className="font-medium">{orderInfo.order.carrier}</p>
                    </div>
                  )}
                  {orderInfo.order.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-500">Estimated Delivery</p>
                      <p className="font-medium">
                        {new Date(orderInfo.order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {orderInfo.order.trackingUrl && (
                  <div className="mt-4">
                    <Link
                      href={orderInfo.order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track with {orderInfo.order.carrier}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {orderInfo.order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700">
                    <p className="font-medium">{orderInfo.order.shippingAddress.fullName}</p>
                    <p>{orderInfo.order.shippingAddress.streetAddress}</p>
                    <p>
                      {orderInfo.order.shippingAddress.city}, {orderInfo.order.shippingAddress.state} {orderInfo.order.shippingAddress.postalCode}
                    </p>
                    <p>{orderInfo.order.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderInfo.order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Total Amount</p>
                    <p className="text-lg font-semibold">₹{orderInfo.order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping History */}
            {orderInfo.shippingLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderInfo.shippingLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                        <div className="flex-shrink-0">
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 capitalize">
                            {log.status.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">{log.notes}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.createdAt).toLocaleString()} • Updated by {log.updatedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Help Section */}
        <Card className="max-w-4xl mx-auto mt-12">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Can&apos;t find your order?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your email for the order confirmation</li>
                  <li>• Make sure you&apos;re using the correct order number and email</li>
                  <li>• Order numbers start with &quot;ORDER-&quot; followed by numbers</li>
                  <li>• It may take a few minutes for new orders to appear</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you&apos;re still having trouble tracking your order, our support team is here to help.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> support@numa.com
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> +91 1234567890
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Hours:</span> Mon-Fri 9AM-6PM IST
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}