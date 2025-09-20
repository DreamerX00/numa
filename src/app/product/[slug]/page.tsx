import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { CheckoutButton } from '@/components/CheckoutButton';
import { Star, Heart, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import { fetchProduct } from '../../../mocks/services/catalog';
import { formatPrice } from '../../../mocks/fixtures/products';

interface Props { 
  params: { slug: string } 
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  
  if (!product) {
    return notFound();
  }

  const variant = product.variants[0]; // For now, use first variant

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={variant.images[0]}
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
            {variant.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {variant.images.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
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
                  {formatPrice(variant.priceCents)}
                </span>
                {variant.compareAtCents && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(variant.compareAtCents)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
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

            {/* Size Selection (if applicable) */}
            {variant.size && (
              <div>
                <h4 className="font-medium mb-3">Size</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="min-w-12">
                    {variant.size}
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <CheckoutButton 
                  amount={variant.priceCents / 100}
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
              
              <Button variant="outline" className="w-full">
                Add to Cart
              </Button>
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
      </Container>
    </div>
  );
}