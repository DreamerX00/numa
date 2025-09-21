import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/client";
import { formatPriceFromFloat } from "@/lib/utils/currency";
import { 
  CreditCard,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  Lock
} from "lucide-react";
import type { CartItem } from "@/lib/types/product";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
    shipping_method: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface Order {
  id: string;
  razorpayOrderId: string;
}

interface PaymentStepProps {
  checkoutData: {
    address?: {
      id?: string;
      firstName: string;
      lastName: string;
      company?: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
      alternateEmail?: string;
      alternatePhone?: string;
      isDefault?: boolean;
    };
  };
  cartItems: CartItem[];
  subtotal: number;
  onComplete: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function PaymentStep({ 
  checkoutData, 
  cartItems, 
  subtotal, 
  onComplete,
  loading, 
  setLoading 
}: PaymentStepProps) {
  const { user } = useAuth();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [shippingCost, setShippingCost] = useState(0);

  // Calculate amounts
  const taxAmount = (subtotal + shippingCost) * 0.18;
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Calculate shipping cost
  useEffect(() => {
    const calculateShipping = async () => {
      try {
        const response = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            })),
            address: {
              postalCode: checkoutData.address?.postalCode || '110001',
              state: checkoutData.address?.state || 'Delhi',
              country: checkoutData.address?.country || 'IN'
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setShippingCost(data.shipping?.cost || 0);
        } else {
          console.error('Failed to calculate shipping');
          setShippingCost(50); // Fallback to default rate
        }
      } catch (error) {
        console.error('Failed to calculate shipping:', error);
        setShippingCost(50); // Fallback to default rate
      }
    };

    if (cartItems.length > 0) {
      calculateShipping();
    }
  }, [cartItems, checkoutData.address]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => setError('Failed to load payment gateway');
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  const createOrder = async () => {
    setError("");
    setLoading(true);

    try {
      // Create order on server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity,
            price: item.priceAtAdd
          })),
          shippingAddress: checkoutData.address,
          shippingMethod: 'STANDARD',
          currency: 'INR'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await response.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Initiate Razorpay payment
      await initiatePayment(orderResult.order);

    } catch (error) {
      console.error('Order creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (order: Order) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const razorpay = (window as any).Razorpay;
    if (!razorpay) {
      setError('Payment gateway not loaded');
      return;
    }

    // Create detailed product breakdown for Razorpay
    const productBreakdown = cartItems.map(item => 
      `${item.product.name}${item.variant ? ` (${item.variant.name})` : ''} x ${item.quantity}`
    ).join(', ');

    const razorpayOptions: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      name: 'Numa Jewelry',
      description: `Order for: ${productBreakdown}`,
      order_id: order.razorpayOrderId,
      image: '/logo.png',
      handler: async function (response: RazorpayResponse) {
        try {
          // Verify payment on server
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            onComplete();
          } else {
            setError('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setError('Payment verification failed');
        }
      },
      prefill: {
        name: user ? user.displayName || user.email || '' : `${checkoutData.address?.firstName || ''} ${checkoutData.address?.lastName || ''}`,
        email: user?.email || checkoutData.address?.alternateEmail || '',
        contact: checkoutData.address?.phone || '',
      },
      notes: {
        address: `${checkoutData.address?.address1 || ''}, ${checkoutData.address?.city || ''}`,
        shipping_method: 'STANDARD',
      },
      theme: {
        color: '#000000'
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
          setError('Payment was cancelled');
        }
      }
    };

    const razorpayInstance = new razorpay(razorpayOptions);
    razorpayInstance.open();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Method */}
          <div className="space-y-4">
            <h4 className="font-medium">Payment Method</h4>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-blue-900">Razorpay</h5>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Secure
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Pay securely with Credit Card, Debit Card, Net Banking, UPI, or Wallets
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h4 className="font-medium">Order Summary</h4>
            
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>{formatPriceFromFloat(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping (Standard)</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    formatPriceFromFloat(shippingCost)
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tax (GST 18%)</span>
                <span>{formatPriceFromFloat(taxAmount)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatPriceFromFloat(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h4 className="font-medium">Delivery Address</h4>
            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium">
                {checkoutData.address?.firstName || ''} {checkoutData.address?.lastName || ''}
              </p>
              <p>{checkoutData.address?.address1 || ''}</p>
              {checkoutData.address?.address2 && <p>{checkoutData.address.address2}</p>}
              <p>
                {checkoutData.address?.city || ''}, {checkoutData.address?.state || ''} {checkoutData.address?.postalCode || ''}
              </p>
              <p className="mt-2 font-medium">Phone: {checkoutData.address?.phone || ''}</p>
            </div>
          </div>

          {/* Security Info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-green-900">Secure Payment</h5>
                <p className="text-sm text-green-700 mt-1">
                  Your payment information is encrypted and secure. We use industry-standard SSL encryption and never store your payment details.
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>Bank-level Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex pt-4">
            <Button 
              onClick={createOrder}
              className="w-full" 
              disabled={loading || !razorpayLoaded}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay {formatPriceFromFloat(totalAmount)}
                </>
              )}
            </Button>
          </div>

          {!razorpayLoaded && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payment gateway...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}