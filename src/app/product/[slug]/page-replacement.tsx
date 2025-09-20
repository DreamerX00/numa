"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { useCartStore } from '@/lib/store/cart';
import { DEFAULT_IMAGES } from '@/lib/cloudinary';
import { Star, Heart, Share2, Truck, Shield, RefreshCw, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { fetchProduct, formatPrice } from '../../../lib/services/catalog';
import type { Product } from '@prisma/client';

interface Props { 
  params: { slug: string } 
}

export default function ProductPage({ params }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadProduct() {
      try {
        const resolvedParams = await params;
        const foundProduct = await fetchProduct(resolvedParams.slug);
        if (foundProduct) {
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params]);

  if (loading) {
    return (
      <Container className="py-6 md:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded" />
            <div className="space-y-4">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-12 w-full bg-muted rounded" />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return notFound();
  }

  const handleAddToCart = () => {
    if (!product) return;

    // Create a compatible variant for cart compatibility
    const defaultVariant = {
      id: `${product.id}-default`,
      sku: product.sku || `${product.id}-DEFAULT`,
      size: undefined,
      metal: undefined,
      priceCents: product.price * 100,
      compareAtCents: product.comparePrice ? product.comparePrice * 100 : undefined,
      stock: 10, // Default stock
      images: product.images
    };

    // Convert product to match cart interface
    const cartProduct = {
      ...product,
      subtitle: product.shortDescription || product.description || '',
      description: product.description || undefined,
      shortDescription: product.shortDescription || undefined,
      comparePrice: product.comparePrice || undefined,
      variants: [defaultVariant],
      materials: [],
      gemstones: [],
      collections: [],
      badges: [],
      createdAt: new Date().toISOString()
    };

    addItem(cartProduct, defaultVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const canAddToCart = product.isActive && product.status === 'ACTIVE';
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const primaryImage = product.images?.[selectedImageIndex] || product.images?.[0] || DEFAULT_IMAGES.PRODUCT;

  return (
    <div className="min-h-screen">
      <Container className="py-6 md:py-8">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.isFeatured && (
                <Badge className="absolute left-4 top-4 bg-brand">FEATURED</Badge>
              )}
              {hasDiscount && (
                <Badge className="absolute right-4 top-4 bg-destructive">SALE</Badge>
              )}
            </div>
            
            {/* Additional Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`relative aspect-square overflow-hidden rounded-md bg-muted cursor-pointer hover:opacity-75 transition-opacity border-2 ${
                      selectedImageIndex === index ? 'border-brand' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              {product.shortDescription && (
                <p className="text-lg text-muted-foreground mt-2">{product.shortDescription}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.8)</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">127 reviews</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.comparePrice!)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {product.isActive ? 'In stock' : 'Out of stock'}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-1 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex-1"
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">Orders over ₹2,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">2 Year Warranty</p>
                  <p className="text-xs text-muted-foreground">Full coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 max-w-4xl">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Description</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground">
                {product.description || product.shortDescription || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}