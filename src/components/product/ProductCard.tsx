"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartService } from '@/hooks/useCartService';
import { DEFAULT_IMAGES } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@prisma/client';

interface ProductCardProps { 
  product: Product; 
  variant?: 'vertical' | 'horizontal';
}

export function ProductCard({ product, variant = 'vertical' }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isLoading, error } = useCartService();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert Prisma Product to our Product interface format
    const productForCart = {
      ...product,
      createdAt: typeof product.createdAt === 'string' ? product.createdAt : product.createdAt.toString(),
      updatedAt: typeof product.updatedAt === 'string' ? product.updatedAt : product.updatedAt.toString()
    };
    
    // Add to cart using the hybrid service
    const result = await addToCart(productForCart, null);
    
    if (result.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
      toast.success(`${product.name} added to cart!`, {
        description: 'You can view your cart by clicking the cart icon.',
      });
    } else {
      toast.error('Failed to add to cart', {
        description: result.error || 'Please try again.',
      });
    }
  };

  const primaryImage = product.images?.[0] || DEFAULT_IMAGES.PRODUCT;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  if (variant === 'horizontal') {
    return (
      <motion.div 
        className="group relative h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
        <div className="h-full rounded-xl overflow-hidden shadow-md bg-white border border-border/50 hover:border-brand/30 transition-all duration-300 hover:shadow-lg">
          <Link href={`/product/${product.slug}`} className="block h-full">
            <div className="flex h-full">
              {/* Image Section */}
              <div className="w-48 h-48 overflow-hidden relative flex-shrink-0">
                <Image 
                  src={primaryImage} 
                  alt={product.name} 
                  width={400} 
                  height={400} 
                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105" 
                />
                
                {/* Discount Badge */}
                {hasDiscount && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 text-xs font-bold shadow-lg"
                  >
                    SALE
                  </motion.div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold tracking-tight line-clamp-2 text-foreground group-hover:text-brand transition-colors duration-200">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                  
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-foreground">
                      ₹{product.price.toFixed(2)}
                    </p>
                    {hasDiscount && (
                      <p className="text-sm text-muted-foreground line-through">
                        ₹{product.comparePrice!.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  {product.quantity > 0 ? (
                    <span className="text-sm text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                  )}
                  
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.quantity === 0 || isLoading}
                    size="sm"
                    className={`transition-all duration-300 ${
                      isAdded 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : product.quantity > 0
                        ? 'bg-brand hover:bg-brand-dark text-white'
                        : 'bg-gray-400 cursor-not-allowed text-gray-200'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAdded ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ShoppingBag className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="group relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <div className="h-full rounded-xl overflow-hidden shadow-md bg-white border border-border/50 hover:border-brand/30 transition-all duration-300 hover:shadow-lg">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <div className="aspect-square w-full overflow-hidden relative">
            <Image 
              src={primaryImage} 
              alt={product.name} 
              width={400} 
              height={400} 
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105" 
            />
            
            {/* Discount Badge */}
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 text-xs font-bold shadow-lg"
              >
                SALE
              </motion.div>
            )}
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          </div>
          
          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight line-clamp-2 text-foreground group-hover:text-brand transition-colors duration-200 leading-tight">
                {product.name}
              </h3>
              {product.shortDescription && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <p className="text-base font-bold text-foreground">
                  ₹{product.price.toFixed(2)}
                </p>
                {hasDiscount && (
                  <p className="text-xs text-muted-foreground line-through">
                    ₹{product.comparePrice!.toFixed(2)}
                  </p>
                )}
              </div>
              
              {/* Stock indicator */}
              {product.quantity > 0 ? (
                <span className="text-xs text-green-600 font-medium">In Stock</span>
              ) : (
                <span className="text-xs text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
            
            {/* Add to Cart Button - Bottom Bar Style */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 -mx-4 -mb-4 mt-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.quantity === 0 || isLoading}
                className={`w-full h-10 rounded-none rounded-b-xl text-sm font-medium transition-all duration-300 ${
                  isAdded 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : product.quantity > 0
                    ? 'bg-brand hover:bg-brand-dark text-white'
                    : 'bg-gray-400 cursor-not-allowed text-gray-200'
                }`}
              >
                {isLoading ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                  </motion.div>
                ) : isAdded ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Added to Cart!</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </div>
                )}
              </Button>
              {error && (
                <div className="text-xs text-red-500 mt-1 px-4">
                  {error}
                </div>
              )}
            </div>
          </div>
        </Link>
        
      </div>
    </motion.div>
  );
}

export default ProductCard;
