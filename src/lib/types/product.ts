/**
 * TypeScript interfaces for real Product and ProductVariant data
 * These match the Prisma schema and API responses
 */

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number | null; // Float price, not cents
  comparePrice: number | null;
  quantity: number;
  attributes: Record<string, unknown>; // JSON attributes like size, color, etc.
  image: string | null;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  subtitle: string | null;
  
  // Pricing (using Float, not cents like mock)
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  
  // Inventory
  sku: string | null;
  barcode: string | null;
  trackQuantity: boolean;
  quantity: number;
  minQuantity: number;
  
  // Physical properties
  weight: number | null;
  dimensions?: {
    length?: number | null;
    width?: number | null;
    height?: number | null;
    unit?: string;
  } | null;
  
  // Shipping configuration
  shippingWeight: number | null;
  shippingLength: number | null;
  shippingWidth: number | null;
  shippingHeight: number | null;
  shippingClass: string;
  requiresSpecialHandling: boolean;
  domesticOnly: boolean;
  individualShippingRate: number | null;
  fragile: boolean;
  requiresSignature: boolean;
  
  // Media
  images: string[];
  videos: string[];
  
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  
  // Categorization
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brandId: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  
  // Product attributes for jewelry/fashion
  badges: string[];
  materials: string[];
  gemstones: string[];
  
  // Product status
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  isActive: boolean;
  isFeatured: boolean;
  
  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];
  
  // Reviews and ratings
  averageRating: number | null;
  reviewCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
  addedAt: Date;
  // Store price at time of adding to cart (for price protection)
  priceAtAdd: number;
}