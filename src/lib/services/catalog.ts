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
    `https://${process.env.VERCEL_URL || 'numaiin.vercel.app'}/api` : 
    'http://localhost:3000/api';

// Check if we're in build environment - only during actual build phase
const isBuildTime = typeof window === 'undefined' && 
  process.env.NEXT_PHASE === 'phase-production-build';

// Fetch featured products for homepage
export async function fetchFeaturedProducts(limit = 8) {
  // Return empty array during build time to prevent ECONNREFUSED
  if (isBuildTime) {
    console.log('🏗️ Build time: Skipping API call for featured products');
    return [];
  }

  // For server-side rendering, use direct database access instead of API calls
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('@/lib/prisma');
      const products = await prisma.product.findMany({
        where: { 
          isFeatured: true,
          isActive: true 
        },
        include: {
          category: true,
          brand: true,
          variants: true
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      return products;
    } catch (error) {
      console.error('Error fetching featured products from database:', error);
      return [];
    }
  }

  // For client-side, use API calls
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

  // For server-side rendering, use direct database access instead of API calls
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('@/lib/prisma');
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });
      
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
      console.error('Error fetching collections from database:', error);
      return [];
    }
  }

  // For client-side, use API calls
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
    const url = `${API_BASE}/products?category=${categorySlug}&limit=20&page=1`;
    console.log(`🔍 Fetching products for category: ${categorySlug} from ${url}`);
    
    const response = await fetch(url);
    console.log(`📡 Response status: ${response.status} for category: ${categorySlug}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error for category ${categorySlug}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch products for category: ${categorySlug} (Status: ${response.status})`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.products?.length || 0} products for category: ${categorySlug}`);
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    throw error; // Re-throw to let the calling code handle it
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