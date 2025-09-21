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
  shippingCost: number;
  shippingMethod: string;
  onComplete: (orderId: string) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function PaymentStep({ 
  checkoutData, 
  cartItems, 
  subtotal, 
  shippingCost,
  shippingMethod,
  onComplete,
  onError,
  loading, 
  setLoading 
}: PaymentStepProps) {
  const { user } = useAuth();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [error, setError] = useState<string>("");

  // Calculate amounts using passed shipping cost
  const taxAmount = (subtotal + shippingCost) * 0.18;
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Check if order is ready for payment
  const isOrderReady = cartItems.length > 0 && 
                      checkoutData.address &&
                      checkoutData.address.firstName &&
                      checkoutData.address.lastName &&
                      checkoutData.address.address1 &&
                      checkoutData.address.city &&
                      checkoutData.address.state &&
                      checkoutData.address.postalCode &&
                      checkoutData.address.phone;

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
      // Validate required data
      if (!checkoutData.address) {
        throw new Error('Shipping address is required');
      }

      if (cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      // Validate required address fields
      const { address } = checkoutData;
      if (!address.firstName || !address.lastName || !address.address1 || 
          !address.city || !address.state || !address.postalCode || !address.phone) {
        throw new Error('Please complete all required address fields');
      }

      // Additional validation for Indian formats
      if (!/^\d{6}$/.test(address.postalCode)) {
        throw new Error('Postal code must be exactly 6 digits');
      }

      if (!/^[6-9]\d{9}$/.test(address.phone)) {
        throw new Error('Phone number must be 10 digits starting with 6, 7, 8, or 9');
      }

      if (address.alternatePhone && !/^[6-9]\d{9}$/.test(address.alternatePhone)) {
        throw new Error('Alternate phone number must be 10 digits starting with 6, 7, 8, or 9');
      }

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtAdd: item.price
        })),
        shippingAddress: {
          firstName: checkoutData.address.firstName,
          lastName: checkoutData.address.lastName,
          company: checkoutData.address.company,
          address1: checkoutData.address.address1,
          address2: checkoutData.address.address2,
          city: checkoutData.address.city,
          state: checkoutData.address.state,
          postalCode: checkoutData.address.postalCode,
          country: checkoutData.address.country,
          phone: checkoutData.address.phone,
          alternateEmail: checkoutData.address.alternateEmail,
          alternatePhone: checkoutData.address.alternatePhone
        },
        shippingMethod: 'STANDARD',
        currency: 'INR'
      };
      
      console.log('Creating order with data:', orderData);
      console.log('Cart items structure:', cartItems);
      console.log('Address details:', checkoutData.address);

      // Create order on server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Order creation failed with status:', response.status);
        console.error('Error response:', errorData);
        console.error('Error response structure:', JSON.stringify(errorData, null, 2));
        
        // Log detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          console.error('Validation details:', errorData.details);
          const validationErrors = errorData.details.map((detail: { path: (string | number)[]; message: string }) => 
            `${detail.path.join('.')}: ${detail.message}`
          ).join(', ');
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        
        if (errorData.formattedError) {
          console.error('Formatted validation error:', errorData.formattedError);
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create order`);
      }

      const orderResult = await response.json();
      console.log('Order creation successful:', orderResult);
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Initiate Razorpay payment
      await initiatePayment(orderResult.order);

    } catch (error) {
      console.error('Order creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create order';
      setError(errorMsg);
      onError(errorMsg);
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
          setLoading(true);
          
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
            // Clear any existing errors
            setError("");
            // Call onComplete with order ID
            onComplete(order.id);
          } else {
            const errorMsg = verifyResult.error || 'Payment verification failed';
            setError(errorMsg);
            onError(errorMsg);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          const errorMsg = 'Payment verification failed. Please contact support.';
          setError(errorMsg);
          onError(errorMsg);
        } finally {
          setLoading(false);
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
          const errorMsg = 'Payment was cancelled by user';
          setError(errorMsg);
          onError(errorMsg);
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
                <span>Shipping ({shippingMethod})</span>
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

          {/* Order Readiness Check */}
          {!isOrderReady && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  {cartItems.length === 0 
                    ? 'No items in cart' 
                    : 'Please complete your shipping address in the previous step'}
                </p>
              </div>
            </div>
          )}

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
              disabled={loading || !razorpayLoaded || !isOrderReady}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : !isOrderReady ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Complete Address Details
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