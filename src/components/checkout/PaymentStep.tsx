import React, { useState } from "react";
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
  Lock
} from "lucide-react";
import HeartLoader from "@/components/ui/HeartLoader";
import type { CartItem } from "@/lib/types/product";

interface Order {
  id: string;
  phonePeMerchantTransactionId: string;
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
  onError,
  loading, 
  setLoading 
}: PaymentStepProps) {
  const { user } = useAuth();
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

  // No need to load external scripts for PhonePe - it uses redirect flow

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
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Initiate PhonePe payment
      await initiatePhonePePayment(orderResult.order);

    } catch (error) {
      console.error('Order creation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to create order';
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const initiatePhonePePayment = async (order: Order) => {
    try {
      setLoading(true);
      
      // Initiate PhonePe payment
      const paymentResponse = await fetch('/api/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          merchantTransactionId: order.phonePeMerchantTransactionId,
          amount: Math.round(totalAmount * 100), // Convert to paise
          mobileNumber: checkoutData.address?.phone || '',
          customerName: user?.displayName || 
            (checkoutData.address?.firstName && checkoutData.address?.lastName
              ? `${checkoutData.address.firstName} ${checkoutData.address.lastName}`
              : 'Customer'),
          email: user?.email || checkoutData.address?.alternateEmail || ''
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success && paymentResult.paymentUrl) {
        // Redirect to PhonePe payment page
        window.location.href = paymentResult.paymentUrl;
      } else {
        throw new Error(paymentResult.error || 'Failed to initiate PhonePe payment');
      }
    } catch (error) {
      console.error('PhonePe payment initiation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Payment initiation failed';
      setError(errorMsg);
      onError(errorMsg);
      setLoading(false);
    }
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
                    <h5 className="font-medium text-blue-900">PhonePe</h5>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Secure
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Pay securely with UPI, Credit Card, Debit Card, Net Banking, or Wallets
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
              disabled={loading || !isOrderReady}
            >
              {loading ? (
                <>
                  <HeartLoader size="sm" className="mr-2" />
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


        </CardContent>
      </Card>
    </div>
  );
}