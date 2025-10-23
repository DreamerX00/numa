"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckoutButton } from '@/components/CheckoutButton';
import { useCartService } from '@/hooks/useCartService';
import { Heart, Share2, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types/product';

interface ProductClientActionsProps {
  product: Product;
  inStock: boolean;
}

export function ProductClientActions({
  product,
  inStock,
}: ProductClientActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCartService();

  async function handleAddToCart() {
    try {
      await addToCart(product, null, quantity); // null for no variant
      setIsAdded(true);
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  }

  async function handleAddToWishlist() {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        toast.success('Added to wishlist');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to add to wishlist');
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on NUMA`,
          url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard');
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {inStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3"
              onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
              disabled={quantity >= product.quantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!inStock || isAdded}
        >
          {isAdded ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart
            </>
          )}
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={handleAddToWishlist}
        >
          <Heart className="h-5 w-5" />
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Buy Now Button */}
      {inStock && (
        <CheckoutButton
          amount={product.price * quantity}
          productId={product.id}
          quantity={quantity}
          variantId={undefined}
          className="w-full"
        />
      )}
    </div>
  );
}
