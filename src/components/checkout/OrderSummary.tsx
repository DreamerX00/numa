"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPriceFromFloat } from "@/lib/utils/currency";
import { 
  ShoppingBag, 
  Truck, 
  Shield,
  Clock
} from "lucide-react";
import type { CartItem } from "@/lib/types/product";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping?: {
    method: string;
    cost: number;
    estimatedDays: string;
  };
  loading?: boolean;
}

const DEFAULT_IMAGES = {
  PRODUCT: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop"
};

export function OrderSummary({ items, subtotal, shipping, loading = false }: OrderSummaryProps) {
  // Use shipping data passed from parent instead of calculating separately
  const finalShippingCost = shipping?.cost ?? 0;
  const totalAmount = subtotal + finalShippingCost;
  const taxAmount = totalAmount * 0.18; // 18% GST
  const finalTotal = totalAmount + taxAmount;

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={item.variant?.image || item.product.images[0] || DEFAULT_IMAGES.PRODUCT}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 min-w-[24px] h-6 rounded-full text-xs"
                >
                  {item.quantity}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm leading-tight line-clamp-2">
                  {item.product.name}
                </h4>
                {item.product.shortDescription && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {item.product.shortDescription}
                  </p>
                )}
                {item.variant && (
                  <div className="flex gap-1 mt-1">
                    {Object.entries(item.variant.attributes).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {String(value)}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatPriceFromFloat(item.price)} × {item.quantity}
                  </span>
                  <span className="font-medium text-sm">
                    {formatPriceFromFloat(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
            <span className="font-medium">{formatPriceFromFloat(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Shipping</span>
            </div>
            <div className="text-right">
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : finalShippingCost === 0 ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">FREE</Badge>
                  <span className="text-sm line-through text-muted-foreground">
                    {formatPriceFromFloat(50)}
                  </span>
                </div>
              ) : (
                <span className="font-medium">{formatPriceFromFloat(finalShippingCost)}</span>
              )}
            </div>
          </div>

          {/* Show free shipping message if applicable */}
          {finalShippingCost === 0 && !loading && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <Truck className="h-4 w-4" />
                <span>🎉 You qualify for free shipping!</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm">Tax (GST 18%)</span>
            <span className="font-medium">{formatPriceFromFloat(taxAmount)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-lg">{formatPriceFromFloat(finalTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium text-sm">Secure Payment</div>
                <div className="text-xs text-muted-foreground">SSL Encrypted</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Fast Delivery</div>
                <div className="text-xs text-muted-foreground">2-5 Business Days</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}