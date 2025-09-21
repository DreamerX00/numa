// Real API service for catalog data (replaces mock services)

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  latestProductImage?: string | null;
  _count?: {
    products: number;
  };
}

const API_BASE = typeof window !== 'undefined' ? '/api' : 
  process.env.NODE_ENV === 'production' ? 
    `${process.env.VERCEL_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api` : 
    'http://localhost:3000/api';

// Check if we're in build environment
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL;

// Fetch featured products for homepage
export async function fetchFeaturedProducts(limit = 8) {
  // Return empty array during build time to prevent ECONNREFUSED
  if (isBuildTime) {
    console.log('🏗️ Build time: Skipping API call for featured products');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/products?featured=true&limit=${limit}&page=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured products');
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Fetch categories/collections for homepage
export async function fetchCollections() {
  // Return empty array during build time to prevent ECONNREFUSED
  if (isBuildTime) {
    console.log('🏗️ Build time: Skipping API call for collections');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/categories?includeCounts=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch collections');
    }
    const categories = await response.json();
    
    // Transform categories to match collection interface expected by homepage
    return categories.map((category: Category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.latestProductImage || category.image,
      heroImage: category.latestProductImage || category.image,
      productCount: category._count?.products || 0
    }));
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

// Fetch products by collection/category
export async function fetchProductsByCollection(categorySlug: string) {
  // Return empty array during build time to prevent ECONNREFUSED
  if (isBuildTime) {
    console.log('🏗️ Build time: Skipping API call for products by collection');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/products?category=${categorySlug}&limit=20&page=1`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products for category: ${categorySlug}`);
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return [];
  }
}

// Fetch single product by slug
export async function fetchProduct(productSlug: string) {
  // Return null during build time to prevent ECONNREFUSED
  if (isBuildTime) {
    console.log('🏗️ Build time: Skipping API call for single product');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${productSlug}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${productSlug}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Helper function to format price (moved from mock)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
}