"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHybridCartStore } from "@/lib/store/hybridCart";
import { useCartService } from "@/hooks/useCartService";
import { useSettings } from "@/hooks/useSettings";
import { formatPriceFromFloat } from "@/lib/utils/currency";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Minus, Plus, ArrowRight, X } from "lucide-react";

interface MiniCartProps {
  children: React.ReactNode;
}

export function MiniCart({ children }: MiniCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, getTotalItems, getTotalPrice } =
    useHybridCartStore();
  const { updateQuantity, removeItem } = useCartService();
  const { shipping } = useSettings();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some items to get started!
              </p>
            </div>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/collections">Browse Collections</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 p-3 border rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={
                            item.variant?.image ||
                            item.product.images[0] ||
                            DEFAULT_IMAGES.PRODUCT
                          }
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <h4 className="font-medium text-sm leading-tight">
                            {item.product.name}
                          </h4>
                          {item.product.shortDescription && (
                            <p className="text-xs text-muted-foreground">
                              {item.product.shortDescription}
                            </p>
                          )}
                          {item.variant && (
                            <div className="flex gap-1 mt-1">
                              {item.variant.attributes &&
                                typeof item.variant.attributes === "object" && (
                                  <>
                                    {(
                                      item.variant.attributes as Record<
                                        string,
                                        string
                                      >
                                    ).size && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] px-1 py-0"
                                      >
                                        Size:{" "}
                                        {
                                          (
                                            item.variant.attributes as Record<
                                              string,
                                              string
                                            >
                                          ).size
                                        }
                                      </Badge>
                                    )}
                                    {(
                                      item.variant.attributes as Record<
                                        string,
                                        string
                                      >
                                    ).color && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] px-1 py-0"
                                      >
                                        {
                                          (
                                            item.variant.attributes as Record<
                                              string,
                                              string
                                            >
                                          ).color
                                        }
                                      </Badge>
                                    )}
                                  </>
                                )}
                              {item.variant.name && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1 py-0"
                                >
                                  {item.variant.name}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1 || isLoading}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-2 text-xs w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >=
                                (item.variant?.quantity ||
                                  item.product.quantity) || isLoading
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-medium text-sm">
                          {formatPriceFromFloat(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Cart Footer */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-semibold text-lg">
                  {formatPriceFromFloat(totalPrice)}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  asChild
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/cart">
                    View Cart & Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/collections">Continue Shopping</Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Free shipping on orders above ₹{shipping.freeShippingThreshold}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
