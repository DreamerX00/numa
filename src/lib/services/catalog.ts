// Real API service for catalog data (replaces mock services)

import { PrismaClient } from '@prisma/client';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  description?: string;
  shortDescription?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

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

// Improved environment detection for Next.js 15
const isServerSide = typeof window === 'undefined';
const isProduction = process.env.NODE_ENV === 'production';
const isBuildTime = isServerSide && process.env.NEXT_PHASE === 'phase-production-build';

// Initialize Prisma only on server side and not during build
let prisma: PrismaClient | null = null;
if (isServerSide && !isBuildTime && process.env.DATABASE_URL) {
  prisma = new PrismaClient();
}

// Better API base URL construction for production
const getApiBase = () => {
  if (!isServerSide) {
    // Client-side: use relative URLs
    return '/api';
  }
  
  if (isBuildTime) {
    // Build time: no API calls
    return null;
  }
  
  if (isProduction) {
    // Production server-side: use internal URL or localhost
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
      return `https://${vercelUrl}/api`;
    }
    // Fallback to your deployed domain
    return 'https://numaiin.vercel.app/api';
  }
  
  // Development: use localhost
  return 'http://localhost:3000/api';
};

const API_BASE = getApiBase();

// Sample fallback products for when API fails
function getSampleProducts() {
  return [
    {
      id: 'sample-1',
      name: 'Featured Product 1',
      slug: 'featured-product-1',
      price: 999,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'],
      description: 'Sample featured product from fallback data',
      featured: true,
      inStock: true
    },
    {
      id: 'sample-2', 
      name: 'Featured Product 2',
      slug: 'featured-product-2',
      price: 1499,
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop'],
      description: 'Another sample featured product from fallback data',
      featured: true,
      inStock: true
    }
  ];
}

// Sample fallback collections for when API fails
function getSampleCollections() {
  return [
    {
      id: 'sample-cat-1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Sample electronics category',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      _count: { products: 5 }
    },
    {
      id: 'sample-cat-2',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Sample fashion category',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
      _count: { products: 8 }
    }
  ];
}

// Debug logging for production
if (isServerSide) {
  console.log('🔍 Server Environment Check:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PHASE: process.env.NEXT_PHASE,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL: process.env.VERCEL,
    isBuildTime,
    isProduction,
    API_BASE,
    hasDatabase: !!process.env.DATABASE_URL
  });
}

// Fetch featured products for homepage
export async function fetchFeaturedProducts(limit = 8) {
  if (isBuildTime || (!API_BASE && !prisma)) {
    console.log('🏗️ Build time or no API_BASE/prisma - returning empty array');
    return [];
  }

  // Use direct database call on server-side, API call on client-side
  if (isServerSide && prisma) {
    try {
      console.log('🗄️ Server-side: Fetching featured products directly from database');
      
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isFeatured: true,
        },
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      console.log('✅ Database: Featured products fetched successfully:', {
        count: products?.length || 0,
        productNames: products?.slice(0, 3).map(p => p.name) || []
      });
      
      return products || [];
    } catch (error) {
      console.error('💥 Database featured products fetch error:', error);
      
      // Fallback to API call if database fails
      return fetchFeaturedProductsFromAPI(limit);
    }
  }

  // Client-side or fallback: use API call
  return fetchFeaturedProductsFromAPI(limit);
}

// Separate function for API calls
async function fetchFeaturedProductsFromAPI(limit = 8) {
  try {
    const url = `${API_BASE}/products?featured=true&limit=${limit}&page=1`;
    console.log('� API: Fetching featured products from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('❌ API featured products fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url
      });
      
      // Return sample data as fallback
      return getSampleProducts();
    }

    const data = await response.json();
    console.log('✅ API: Featured products fetched successfully:', {
      count: data?.products?.length || 0,
      productNames: data?.products?.slice(0, 3).map((p: Product) => p.name) || []
    });
    
    return data?.products || [];
  } catch (error) {
    console.error('💥 API featured products fetch error:', error);
    
    // Return sample data as fallback
    return getSampleProducts();
  }
}

// Fetch categories/collections for homepage
export async function fetchCollections() {
  if (isBuildTime || (!API_BASE && !prisma)) {
    console.log('🏗️ Build time or no API_BASE/prisma - returning empty array');
    return [];
  }

  // Use direct database call on server-side, API call on client-side
  if (isServerSide && prisma) {
    try {
      console.log('🗄️ Server-side: Fetching collections directly from database');
      
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
          products: {
            where: {
              isActive: true,
            },
            select: {
              images: true,
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Transform to match expected interface
      const transformedCategories = categories.map((category: Category & { 
        products: { images: string[] }[]; 
        _count: { products: number }; 
      }) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.products[0]?.images[0] || category.image,
        heroImage: category.products[0]?.images[0] || category.image,
        productCount: category._count?.products || 0
      }));

      console.log('✅ Database: Collections fetched successfully:', {
        count: transformedCategories?.length || 0,
        collectionNames: transformedCategories?.slice(0, 3).map((c: { name: string }) => c.name) || []
      });
      
      return transformedCategories || [];
    } catch (error) {
      console.error('💥 Database collections fetch error:', error);
      
      // Fallback to API call if database fails
      return fetchCollectionsFromAPI();
    }
  }

  // Client-side or fallback: use API call
  return fetchCollectionsFromAPI();
}

// Separate function for API calls
async function fetchCollectionsFromAPI() {
  try {
    const url = `${API_BASE}/categories?includeCounts=true`;
    console.log('🌐 API: Fetching collections from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      console.error('❌ API collections fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url
      });
      
      // Return sample collections as fallback
      return getSampleCollections();
    }

    const categories = await response.json();

    // Transform categories to match collection interface expected by homepage
    const transformedCategories = categories.map((category: Category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.latestProductImage || category.image,
      heroImage: category.latestProductImage || category.image,
      productCount: category._count?.products || 0
    }));

      console.log('✅ API: Collections fetched successfully:', {
        count: transformedCategories?.length || 0,
        collectionNames: transformedCategories?.slice(0, 3).map((c: { name: string }) => c.name) || []
      });    return transformedCategories || [];
  } catch (error) {
    console.error('💥 API collections fetch error:', error);
    
    // Return sample collections as fallback
    return getSampleCollections();
  }
}

// Fetch products by collection/category
export async function fetchProductsByCollection(categorySlug: string) {
  if (isBuildTime || (!API_BASE && !prisma)) {
    console.log('🏗️ Build time or no API_BASE/prisma - returning empty array');
    return [];
  }

  // Use direct database call on server-side, API call on client-side
  if (isServerSide && prisma) {
    try {
      console.log(`🗄️ Server-side: Fetching products for category "${categorySlug}" directly from database`);
      
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          category: {
            slug: categorySlug,
            isActive: true,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 20,
      });

      console.log(`✅ Database: Fetched ${products?.length || 0} products for category "${categorySlug}"`);
      
      return products || [];
    } catch (error) {
      console.error(`💥 Database fetch error for category "${categorySlug}":`, error);
      
      // Fallback to API call if database fails
      return fetchProductsByCollectionFromAPI(categorySlug);
    }
  }

  // Client-side or fallback: use API call
  return fetchProductsByCollectionFromAPI(categorySlug);
}

// Separate function for API calls
async function fetchProductsByCollectionFromAPI(categorySlug: string) {
  try {
    const url = `${API_BASE}/products?category=${categorySlug}&limit=20&page=1`;
    console.log(`🌐 API: Fetching products for category "${categorySlug}" from ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 }
    });
    
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
    console.log(`✅ API: Successfully fetched ${data.products?.length || 0} products for category "${categorySlug}"`);
    return data.products || [];
  } catch (error) {
    console.error(`💥 API fetch error for category "${categorySlug}":`, error);
    throw error; // Re-throw to let the calling code handle it
  }
}

// Fetch single product by slug
export async function fetchProduct(productSlug: string) {
  if (isBuildTime || (!API_BASE && !prisma)) {
    console.log('🏗️ Build time or no API_BASE/prisma - returning null');
    return null;
  }

  // Use direct database call on server-side, API call on client-side
  if (isServerSide && prisma) {
    try {
      console.log(`🗄️ Server-side: Fetching product "${productSlug}" directly from database`);
      
      const product = await prisma.product.findFirst({
        where: {
          slug: productSlug,
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            where: {
              isActive: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!product) {
        console.log(`❌ Database: Product "${productSlug}" not found`);
        return null;
      }

      console.log(`✅ Database: Successfully fetched product "${productSlug}"`);
      
      return product;
    } catch (error) {
      console.error(`💥 Database fetch error for product "${productSlug}":`, error);
      
      // Fallback to API call if database fails
      return fetchProductFromAPI(productSlug);
    }
  }

  // Client-side or fallback: use API call
  return fetchProductFromAPI(productSlug);
}

// Separate function for API calls
async function fetchProductFromAPI(productSlug: string) {
  try {
    const url = `${API_BASE}/products/${productSlug}`;
    console.log(`🌐 API: Fetching product "${productSlug}" from ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`❌ API: Product "${productSlug}" not found`);
        return null;
      }
      throw new Error(`Failed to fetch product: ${productSlug} (Status: ${response.status})`);
    }
    
    const product = await response.json();
    console.log(`✅ API: Successfully fetched product "${productSlug}"`);
    return product;
  } catch (error) {
    console.error(`💥 API fetch error for product "${productSlug}":`, error);
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