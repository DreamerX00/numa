'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderTracking from '@/components/order/OrderTracking';
import { Search } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    
    setIsSearching(true);
    // Simple validation - order numbers should start with 'ORDER-'
    const formattedOrderNumber = orderNumber.startsWith('ORDER-') 
      ? orderNumber 
      : `ORDER-${orderNumber}`;
    
    // Simulate search delay
    setTimeout(() => {
      setSearchedOrder(formattedOrderNumber);
      setIsSearching(false);
    }, 500);
  };

  const handleReset = () => {
    setOrderNumber('');
    setSearchedOrder(null);
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
            Enter your order number below to track your shipment and get real-time updates on your delivery status.
          </p>
        </div>

        {/* Search Section */}
        {!searchedOrder && (
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
                <p className="text-xs text-gray-500 mt-1">
                  You can find your order number in your confirmation email
                </p>
              </div>
              
              <Button 
                onClick={handleSearch}
                disabled={!orderNumber.trim() || isSearching}
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
            </CardContent>
          </Card>
        )}

        {/* Search Again Button */}
        {searchedOrder && (
          <div className="text-center mb-6">
            <Button variant="outline" onClick={handleReset}>
              Search Another Order
            </Button>
          </div>
        )}

        {/* Tracking Results */}
        {searchedOrder && (
          <OrderTracking orderNumber={searchedOrder} />
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
                  <li>• Make sure you&apos;re using the correct order number</li>
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