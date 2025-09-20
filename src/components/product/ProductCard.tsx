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
    <div className="group relative rounded-lg overflow-hidden shadow-card bg-white border border-base-border">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/5] w-full overflow-hidden">
          <Image 
            src={primaryImage} 
            alt={product.name} 
            width={600} 
            height={750} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium tracking-tight line-clamp-1">{product.name}</h3>
          <p className="mt-1 text-xs text-base-muted line-clamp-1">{product.shortDescription || product.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.comparePrice!)}
              </p>
            )}
          </div>
        </div>
      </Link>
      
      {/* Add to Cart Button */}
      <motion.div 
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="sm"
          onClick={handleAddToCart}
          className={`h-8 w-8 p-0 rounded-full shadow-lg transition-colors ${
            isAdded 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-brand hover:bg-brand-dark'
          }`}
        >
          {isAdded ? (
            <Check className="h-4 w-4 text-white" />
          ) : (
            <ShoppingBag className="h-4 w-4 text-white" />
          )}
        </Button>
      </motion.div>

      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute left-2 top-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-medium">
          SALE
        </span>
      )}
    </div>
  );
}

export default ProductCard;
