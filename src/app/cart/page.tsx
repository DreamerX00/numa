"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import { formatPriceFromFloat } from "@/lib/utils/currency";
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

// Razorpay checkout integration
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src: string) {
  return new Promise<boolean>((resolve) => {
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
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shippingCost = totalPrice > 50000 ? 0 : 10000; // Free shipping over ₹500
  const finalTotal = totalPrice + shippingCost;

  // Load Razorpay script on mount
  useState(() => {
    loadScript(RAZORPAY_SCRIPT).then(setRazorpayReady);
  });

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

  const handlePayment = async () => {
    if (!window.Razorpay || !razorpayReady) return;
    
    try {
      const order = await createOrder();
      const options: RazorpayOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "NUMA",
        description: `Payment for ${totalItems} item${totalItems !== 1 ? 's' : ''}`,
        order_id: order.razorpayOrderId,
        handler: (response) => {
          // Payment successful
          console.log("Payment success", response);
          clearCart();
          // Redirect to success page or show success message
          window.location.href = `/order-success?payment_id=${response.razorpay_payment_id}&order_id=${order.orderNumber}`;
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#E7654D" },
        notes: {
          orderNumber: order.orderNumber,
          items: items.map(item => `${item.product.name} x${item.quantity}`).join(', ')
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      // Show error toast
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
                            src={item.variant.images[0]}
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
                            <p className="text-sm text-muted-foreground">
                              {item.product.subtitle}
                            </p>
                            {(item.variant.size || item.variant.metal) && (
                              <div className="flex gap-2 mt-1">
                                {item.variant.size && (
                                  <Badge variant="secondary" className="text-xs">
                                    Size {item.variant.size}
                                  </Badge>
                                )}
                                {item.variant.metal && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.variant.metal}
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
                                disabled={item.quantity >= item.variant.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {item.quantity >= item.variant.stock && (
                              <span className="text-xs text-amber-600">
                                Max stock reached
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.variant.priceCents * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(item.variant.priceCents)} each
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
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-600" : ""}>
                      {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {shippingCost === 0 && (
                    <p className="text-xs text-green-600">
                      🎉 You qualify for free shipping!
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
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
                    <span>Free shipping on orders above ₹500</span>
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