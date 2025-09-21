"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useHybridCartStore } from "@/lib/store/hybridCart";
import { useCartService } from "@/hooks/useCartService";
import { formatPriceFromFloat } from "@/lib/utils/currency";
import { calculateShippingCost, amountNeededForFreeShipping, defaultShippingConfig } from "@/lib/config/shipping";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  CreditCard,
  Loader2
} from "lucide-react";
import type { RazorpayOptions } from "@/lib/types/razorpay";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src: string) {
  return new Promise<boolean>((resolve) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(false);
      return;
    }
    
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useHybridCartStore();
  const { updateQuantity, removeItem } = useCartService();
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shippingCost = calculateShippingCost(totalPrice);
  const finalTotal = totalPrice + shippingCost;
  const amountForFreeShipping = amountNeededForFreeShipping(totalPrice);

  // Load Razorpay script on mount
  useEffect(() => {
    loadScript(RAZORPAY_SCRIPT).then(setRazorpayReady);
  }, []);

  const createOrder = async () => {
    setLoading(true);
    try {
      // Prepare cart items for order creation
      const cartItems = items.map(item => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cartItems,
          notes: {
            source: 'web_checkout',
            items: items.map(item => `${item.product.name} x${item.quantity}`).join(', ')
          }
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create order");
      }
      
      return await res.json();
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const response = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Payment verified successfully
        clearCart();
        if (typeof window !== 'undefined') {
          window.location.href = `/order-success?payment_id=${paymentData.razorpay_payment_id}&order_id=${result.order.orderNumber}`;
        }
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      // Redirect to failure page or show error
      if (typeof window !== 'undefined') {
        window.location.href = `/payment-failed?error=verification_failed`;
      }
    }
  };

  const handlePayment = async () => {
    if (typeof window === 'undefined' || !window.Razorpay || !razorpayReady) return;
    
    try {
      const order = await createOrder();
      const options: RazorpayOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "NUMA",
        description: `Payment for ${totalItems} item${totalItems !== 1 ? 's' : ''}`,
        order_id: order.razorpayOrderId,
        handler: async (response) => {
          // Payment successful, now verify it
          await verifyPayment(response);
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { 
          color: "#E7654D",
          backdrop_color: "#000000"
        },
        notes: {
          orderNumber: order.orderNumber,
          items: items.map(item => `${item.product.name} x${item.quantity}`).join(', ')
        },
        modal: {
          ondismiss: () => {
            // Payment was cancelled or failed
            console.log('Payment cancelled by user');
          },
          escape: true,
          backdropclose: false
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay using Bank Account',
                instruments: [
                  {
                    method: 'netbanking'
                  },
                  {
                    method: 'upi'
                  }
                ]
              },
              other: {
                name: 'Other Payment Modes', 
                instruments: [
                  {
                    method: 'card'
                  },
                  {
                    method: 'wallet'
                  }
                ]
              }
            },
            hide: [
              // Don't hide any payment methods
            ],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
          emi: true,
          paylater: true
        }
      };
      
      // Use the already typed Razorpay constructor
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      // Show error message or redirect to failure page
      if (typeof window !== 'undefined') {
        window.location.href = `/payment-failed?error=order_creation_failed`;
      }
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-12 md:py-16">
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-serif tracking-tight">Your cart is empty</h1>
              <p className="text-muted-foreground mt-2">
                Looks like you haven&apos;t added any items to your cart yet.
              </p>
            </div>
          </div>
          <Button asChild className="bg-brand hover:bg-brand-dark">
            <Link href="/collections">
              Continue Shopping
            </Link>
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/collections">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-serif tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={item.variant?.images?.[0] || item.product.images[0] || '/default-product.jpg'}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium tracking-tight">
                              <Link 
                                href={`/product/${item.product.slug}`}
                                className="hover:text-brand-dark transition-colors"
                              >
                                {item.product.name}
                              </Link>
                            </h3>
                            {item.product.subtitle && (
                              <p className="text-sm text-muted-foreground">
                                {item.product.subtitle}
                              </p>
                            )}
                            {item.variant && item.variant.attributes && (
                              <div className="flex gap-2 mt-1">
                                {String(item.variant.attributes.size || '') && (
                                  <Badge variant="secondary" className="text-xs">
                                    Size {String(item.variant.attributes.size)}
                                  </Badge>
                                )}
                                {String(item.variant.attributes.metal || '') && (
                                  <Badge variant="secondary" className="text-xs">
                                    {String(item.variant.attributes.metal)}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-3 py-1 min-w-[3rem] text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.variant?.quantity || item.product.quantity)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {item.quantity >= (item.variant?.quantity || item.product.quantity) && (
                              <span className="text-xs text-amber-600">
                                Max stock reached
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPriceFromFloat((item.variant?.price || item.product.price) * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {formatPriceFromFloat(item.variant?.price || item.product.price)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-lg tracking-tight">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPriceFromFloat(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-600" : ""}>
                      {shippingCost === 0 ? "Free" : formatPriceFromFloat(shippingCost)}
                    </span>
                  </div>
                  {shippingCost === 0 ? (
                    <p className="text-xs text-green-600">
                      🎉 You qualify for free shipping!
                    </p>
                  ) : (
                    <p className="text-xs text-blue-600">
                      Add {formatPriceFromFloat(amountForFreeShipping)} more for free shipping
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span>{formatPriceFromFloat(finalTotal)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-brand hover:bg-brand-dark text-white"
                  size="lg"
                  onClick={handlePayment}
                  disabled={loading || !razorpayReady}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Pay
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Razorpay
                </p>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-sm tracking-tight">Why shop with us?</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Secure payments & encrypted data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Free shipping on orders above ₹{defaultShippingConfig.freeShippingThreshold}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </Container>
  );
}