"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { CheckoutButton } from '@/components/CheckoutButton';
import { useCartStore } from '@/lib/store/cart';
import { DEFAULT_IMAGES } from '@/lib/cloudinary';
import { Star, Heart, Share2, Truck, Shield, RefreshCw, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { fetchProduct, formatPrice } from '../../../lib/services/catalog';
import ProductReviews from '@/components/reviews/ProductReviews';
import type { Product } from '@prisma/client';

interface Props { 
  params: { slug: string } 
}

interface VariantType {
  id: string;
  sku: string;
  priceCents: number;
  compareAtCents?: number;
  stock: number;
  images: string[];
}

export default function ProductPage({ params }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null);
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadProduct() {
      try {
        const resolvedParams = await params;
        const foundProduct = await fetchProduct(resolvedParams.slug);
        if (foundProduct) {
          setProduct(foundProduct);
          // Initialize default variant
          const defaultVariant = {
            id: `${foundProduct.id}-default`,
            sku: foundProduct.sku || `${foundProduct.id}-DEFAULT`,
            priceCents: foundProduct.price * 100,
            compareAtCents: foundProduct.comparePrice ? foundProduct.comparePrice * 100 : undefined,
            stock: foundProduct.quantity,
            images: foundProduct.images.length > 0 ? foundProduct.images : [DEFAULT_IMAGES.PRODUCT]
          };
          setSelectedVariant(defaultVariant);
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
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-1/2 bg-muted rounded" />
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
    if (!product || !selectedVariant) return;

    // Convert product to match cart interface - ensure date is string and handle nullable fields
    const cartProduct = {
      ...product,
      description: product.description || null,
      shortDescription: product.shortDescription || null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };

    // Convert VariantType to ProductVariant for cart
    const cartVariant = {
      id: selectedVariant.id,
      productId: product.id,
      name: `${product.name} - Variant`,
      sku: selectedVariant.sku,
      price: selectedVariant.priceCents / 100, // Convert cents to dollars
      comparePrice: selectedVariant.compareAtCents ? selectedVariant.compareAtCents / 100 : null,
      quantity: selectedVariant.stock,
      attributes: {},
      image: selectedVariant.images[0] || null,
      images: selectedVariant.images,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    addItem(cartProduct, cartVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const canAddToCart = product.isActive && product.status === 'ACTIVE' && (selectedVariant?.stock || product.quantity) > 0;

  if (!selectedVariant) {
    return (
      <Container className="py-6 md:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-1/2 bg-muted rounded" />
              <div className="h-12 w-full bg-muted rounded" />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen">
      <Container className="py-6 md:py-8">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={selectedVariant?.images[0] || product.images[0] || DEFAULT_IMAGES.PRODUCT}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.badges?.includes('NEW') && (
                <Badge className="absolute left-4 top-4 bg-brand">NEW</Badge>
              )}
              {product.badges?.includes('LIMITED') && (
                <Badge className="absolute left-4 top-4 bg-foreground">LIMITED</Badge>
              )}
              {product.badges?.includes('SALE') && (
                <Badge className="absolute left-4 top-4 bg-destructive">SALE</Badge>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {(selectedVariant?.images?.length || product.images.length) > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {(selectedVariant?.images || product.images).map((image: string, index: number) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square overflow-hidden rounded-md bg-muted cursor-pointer hover:opacity-80 transition-opacity ${
                      index === selectedImageIndex ? 'ring-2 ring-brand' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              {product.subtitle && (
                <p className="text-lg text-muted-foreground mt-2">{product.subtitle}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(48 reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-brand">
                  {formatPrice(selectedVariant?.priceCents || product.price * 100)}
                </span>
                {(selectedVariant?.compareAtCents || product.comparePrice) && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(selectedVariant?.compareAtCents || (product.comparePrice ? product.comparePrice * 100 : 0))}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {(selectedVariant?.stock || product.quantity) > 0 ? `${selectedVariant?.stock || product.quantity} in stock` : 'Out of stock'}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Materials & Gemstones */}
            <div className="grid gap-4 sm:grid-cols-2">
              {product.materials.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Materials</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((material: string) => (
                      <Badge key={material} variant="secondary">{material}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {product.gemstones.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Gemstones</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.gemstones.map((gemstone: string) => (
                      <Badge key={gemstone} variant="secondary">{gemstone}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h4 className="font-medium mb-3">Quantity</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedVariant && (
                  <span className="text-sm text-muted-foreground">
                    {selectedVariant.stock} available
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <CheckoutButton 
                  amount={(selectedVariant?.priceCents || product.price * 100) / 100}
                  label="Buy Now"
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                className={`w-full ${
                  isAdded 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-brand hover:bg-brand-dark'
                }`}
                onClick={handleAddToCart}
                disabled={!canAddToCart}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
              
              {!canAddToCart && selectedVariant && (
                <p className="text-sm text-center text-destructive">
                  {selectedVariant.stock <= 0 ? 'Out of stock' : 'Not enough stock available'}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over ₹5,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Lifetime Warranty</p>
                    <p className="text-xs text-muted-foreground">Against manufacturing defects</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">30-Day Returns</p>
                    <p className="text-xs text-muted-foreground">Free returns & exchanges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional sections could go here: Related products, reviews, etc. */}
        
        {/* Reviews Section */}
        <div className="mt-16">
          <ProductReviews 
            productId={product.id}
            productName={product.name}
            showWriteReview={true}
          />
        </div>
      </Container>
    </div>
  );
}