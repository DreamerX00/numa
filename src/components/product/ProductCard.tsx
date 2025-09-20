"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MockProduct } from '../../mocks/fixtures/products';
import { formatPrice } from '../../mocks/fixtures/products';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps { product: MockProduct; }

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const v = product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, v, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative rounded-lg overflow-hidden shadow-card bg-white border border-base-border">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/5] w-full overflow-hidden">
          <Image src={v.images[0]} alt={product.name} width={600} height={750} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium tracking-tight line-clamp-1">{product.name}</h3>
          <p className="mt-1 text-xs text-base-muted line-clamp-1">{product.subtitle}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{formatPrice(v.priceCents)}</p>
            {v.compareAtCents && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(v.compareAtCents)}
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
          disabled={v.stock <= 0}
        >
          {isAdded ? (
            <Check className="h-4 w-4 text-white" />
          ) : (
            <ShoppingBag className="h-4 w-4 text-white" />
          )}
        </Button>
      </motion.div>

      {/* Badges */}
      {product.badges?.includes('NEW') && <span className="absolute left-2 top-2 rounded-full bg-brand text-white px-2 py-0.5 text-[10px] font-medium">NEW</span>}
      {product.badges?.includes('LIMITED') && <span className="absolute left-2 top-2 rounded-full bg-base-ink/80 text-white px-2 py-0.5 text-[10px] font-medium">LIMITED</span>}
      {product.badges?.includes('SALE') && <span className="absolute left-2 top-2 rounded-full bg-brand-dark text-white px-2 py-0.5 text-[10px] font-medium">SALE</span>}
      {v.stock <= 0 && <span className="absolute left-2 top-2 rounded-full bg-gray-500 text-white px-2 py-0.5 text-[10px] font-medium">OUT OF STOCK</span>}
    </div>
  );
}

export default ProductCard;
