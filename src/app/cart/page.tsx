"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHybridCartStore } from "@/lib/store/hybridCart";
import { useCartService } from "@/hooks/useCartService";
import { useSettings } from "@/hooks/useSettings";
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
  ArrowRight,
} from "lucide-react";
import HeartLoader from "@/components/ui/HeartLoader";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export const dynamic = "force-dynamic";

export default function CartPage() {
  const router = useRouter();
  const { shipping } = useSettings();
  const { items, getTotalPrice, getTotalItems } = useHybridCartStore();
  const { updateQuantity, removeItem, isLoading, operation } = useCartService();
  const [shippingData, setShippingData] = useState({
    cost: 0,
    qualifiesForFree: false,
    amountNeeded: 0,
    loading: true,
  });

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const finalTotal = totalPrice + shippingData.cost;

  const calculateShipping = useCallback(() => {
    if (items.length === 0) {
      setShippingData({
        cost: 0,
        qualifiesForFree: false,
        amountNeeded: 0,
        loading: false,
      });
      return;
    }

    // Calculate total shipping cost from individual product shipping rates
    const totalShippingCost = items.reduce((total, item) => {
      const shippingRate = item.product?.individualShippingRate || 0;
      return total + shippingRate * item.quantity;
    }, 0);

    // Check if qualifies for free shipping (totalPrice >= 500)
    const qualifiesForFree = totalPrice >= 500;
    const finalShippingCost = qualifiesForFree ? 0 : totalShippingCost;

    setShippingData({
      cost: finalShippingCost,
      qualifiesForFree,
      amountNeeded: Math.max(0, 500 - totalPrice),
      loading: false,
    });
  }, [items, totalPrice]);

  // Load shipping data
  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

  const handleCheckout = () => {
    // Redirect to the new 3-step checkout flow
    router.push("/checkout");
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
              <h1 className="text-2xl font-serif tracking-tight">
                Your cart is empty
              </h1>
              <p className="text-muted-foreground mt-2">
                Looks like you haven&apos;t added any items to your cart yet.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/collections">Continue Shopping</Link>
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-6 md:py-8">
      {/* Loading overlay for cart operations */}
      {isLoading && (
        <LoadingOverlay
          isVisible={isLoading}
          message={`${operation.charAt(0).toUpperCase() + operation.slice(1)} cart...`}
        />
      )}

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
            <h1 className="text-2xl font-serif tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
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
                            src={
                              item.variant?.images?.[0] ||
                              item.product.images[0] ||
                              "/default-product.jpg"
                            }
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
                                {String(item.variant.attributes.size || "") && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Size {String(item.variant.attributes.size)}
                                  </Badge>
                                )}
                                {String(
                                  item.variant.attributes.metal || ""
                                ) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
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
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
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
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={
                                  item.quantity >=
                                  (item.variant?.quantity ||
                                    item.product.quantity)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {item.quantity >=
                              (item.variant?.quantity ||
                                item.product.quantity) && (
                              <span className="text-xs text-amber-600">
                                Max stock reached
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPriceFromFloat(
                                (item.variant?.price || item.product.price) *
                                  item.quantity
                              )}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {formatPriceFromFloat(
                                  item.variant?.price || item.product.price
                                )}{" "}
                                each
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
                <h2 className="font-serif text-lg tracking-tight">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPriceFromFloat(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {shippingData.loading ? (
                      <HeartLoader size="sm" />
                    ) : (
                      <span
                        className={
                          shippingData.cost === 0 ? "text-green-600" : ""
                        }
                      >
                        {shippingData.cost === 0
                          ? "Free"
                          : formatPriceFromFloat(shippingData.cost)}
                      </span>
                    )}
                  </div>
                  {!shippingData.loading &&
                    (shippingData.qualifiesForFree ? (
                      <p className="text-xs text-green-600">
                        🎉 You qualify for free shipping!
                      </p>
                    ) : shippingData.amountNeeded > 0 ? (
                      <p className="text-xs text-blue-600">
                        Add {formatPriceFromFloat(shippingData.amountNeeded)}{" "}
                        more for free shipping
                      </p>
                    ) : null)}
                  <Separator />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span>{formatPriceFromFloat(finalTotal)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure 3-step checkout process
                </p>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-sm tracking-tight">
                  Why shop with us?
                </h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Secure payments & encrypted data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>
                      Free shipping on orders above ₹
                      {shipping.freeShippingThreshold}
                    </span>
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
