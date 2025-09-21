"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatPrice } from '../../lib/services/catalog';
import { useCartStore } from "@/lib/store/cart";
import { DEFAULT_IMAGES } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Check } from 'lucide-react';
import type { Product } from '@prisma/client';

interface ProductCardProps { 
  product: Product; 
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert Prisma Product to our Product interface format
    const productForCart = {
      ...product,
      createdAt: product.createdAt.toString(),
      updatedAt: product.updatedAt.toString()
    };
    
    // For products without variants, pass null as variant
    // The cart will use the main product price
    addItem(productForCart, null);
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const primaryImage = product.images?.[0] || DEFAULT_IMAGES.PRODUCT;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <motion.div 
      className="group relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <div className="h-full rounded-2xl overflow-hidden shadow-lg bg-white border border-border/50 hover:border-brand/30 transition-all duration-300 hover:shadow-xl">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <div className="aspect-[4/5] w-full overflow-hidden relative">
            <Image 
              src={primaryImage} 
              alt={product.name} 
              width={600} 
              height={750} 
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110" 
            />
            
            {/* Discount Badge */}
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 text-xs font-bold shadow-lg"
              >
                SALE
              </motion.div>
            )}
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          </div>
          
          <div className="p-5 h-32 flex flex-col justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold tracking-tight line-clamp-2 text-foreground group-hover:text-brand transition-colors duration-200">
                {product.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.shortDescription || product.description}
              </p>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(product.price)}
                </p>
                {hasDiscount && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.comparePrice!)}
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
          </div>
        </Link>
        
        {/* Enhanced Add to Cart Button */}
        <motion.div 
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
          initial={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className={`h-10 w-10 p-0 rounded-full shadow-lg border-2 transition-all duration-300 ${
              isAdded 
                ? 'bg-green-500 hover:bg-green-600 border-green-400' 
                : product.quantity > 0
                ? 'bg-brand hover:bg-brand-dark border-brand-accent hover:border-brand'
                : 'bg-gray-400 cursor-not-allowed border-gray-300'
            }`}
          >
            {isAdded ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            ) : (
              <ShoppingBag className="h-4 w-4 text-white" />
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
