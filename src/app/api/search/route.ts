import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import type { Prisma } from '@prisma/client';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';

// Rate limiter for search endpoints
const searchRateLimit = rateLimit(rateLimitConfigs.api);

// Advanced search schema
const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(), // search query
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating', 'newest']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.string().optional() // comma-separated tags
});

// Contract
// GET /api/search?q=jewelry&category=rings&minPrice=1000&maxPrice=5000&sortBy=price_asc&page=1&limit=12
// Response: { products: Product[], total: number, page: number, totalPages: number, filters: FilterCounts }

export async function GET(req: NextRequest) {
  return searchRateLimit(req, async () => {
    try {
      const { searchParams } = new URL(req.url);
      
      // Parse and validate query parameters
      const queryParams = {
        q: searchParams.get('q') || undefined,
        category: searchParams.get('category') || undefined,
        brand: searchParams.get('brand') || undefined,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
        sortBy: searchParams.get('sortBy') || 'relevance',
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
        inStock: searchParams.get('inStock') === 'true' ? true : undefined,
        featured: searchParams.get('featured') === 'true' ? true : undefined,
        tags: searchParams.get('tags') || undefined
      };

      const validationResult = searchSchema.safeParse(queryParams);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: "Invalid search parameters", details: errors },
          { status: 400 }
        );
      }

      const { q, category, brand, minPrice, maxPrice, sortBy, page, limit, inStock, featured, tags } = validationResult.data;

      // Build search conditions
      const whereConditions: Prisma.ProductWhereInput = {
        isActive: true,
        status: 'ACTIVE'
      };

      // Text search across multiple fields
      if (q) {
        whereConditions.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { shortDescription: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q] } }
        ];
      }

      // Category filter
      if (category) {
        whereConditions.category = {
          slug: category
        };
      }

      // Brand filter
      if (brand) {
        whereConditions.brand = {
          slug: brand
        };
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereConditions.price = {};
        if (minPrice !== undefined) whereConditions.price.gte = minPrice;
        if (maxPrice !== undefined) whereConditions.price.lte = maxPrice;
      }

      // Stock filter
      if (inStock) {
        whereConditions.AND = [
          { trackQuantity: false },
          { OR: [{ trackQuantity: false }, { quantity: { gt: 0 } }] }
        ];
      }

      // Featured filter
      if (featured) {
        whereConditions.isFeatured = true;
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        whereConditions.tags = { hasSome: tagArray };
      }

      // Build sort order
      let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {};
      switch (sortBy) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'name_asc':
          orderBy = { name: 'asc' };
          break;
        case 'name_desc':
          orderBy = { name: 'desc' };
          break;
        case 'rating':
          orderBy = { averageRating: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'relevance':
        default:
          // For relevance, we'll use a combination of factors
          orderBy = [
            { isFeatured: 'desc' },
            { averageRating: 'desc' },
            { createdAt: 'desc' }
          ];
          break;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute search query with includes
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: whereConditions,
          include: {
            category: {
              select: { id: true, name: true, slug: true }
            },
            brand: {
              select: { id: true, name: true, slug: true }
            },
            variants: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                price: true,
                attributes: true,
                image: true,
                quantity: true
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.product.count({ where: whereConditions })
      ]);

      // Calculate filter counts for faceted search
      const filterCounts = await getFilterCounts(whereConditions);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: filterCounts,
        searchMeta: {
          query: q,
          resultsCount: total,
          processingTime: Date.now() % 100 + 'ms' // Mock processing time
        }
      });

    } catch (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  });
}

// Helper function to get filter counts for faceted search
async function getFilterCounts(baseWhere: Prisma.ProductWhereInput) {
  try {
    const [categoryStats, brandStats, priceStats] = await Promise.all([
      // Category counts
      prisma.product.groupBy({
        by: ['categoryId'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      
      // Brand counts
      prisma.product.groupBy({
        by: ['brandId'],
        where: { ...baseWhere, brandId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      
      // Price range stats
      prisma.product.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
        _avg: { price: true }
      })
    ]);

    // Get category details
    const categoryIds = categoryStats.map(stat => stat.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, slug: true }
    });

    // Get brand details
    const brandIds = brandStats.map(stat => stat.brandId).filter((id): id is string => id !== null);
    const brands = await prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true, slug: true }
    });

    return {
      categories: categoryStats.map(stat => {
        const category = categories.find(c => c.id === stat.categoryId);
        return {
          id: stat.categoryId,
          name: category?.name || 'Unknown',
          slug: category?.slug || '',
          count: stat._count.id
        };
      }),
      brands: brandStats.map(stat => {
        const brand = brands.find(b => b.id === stat.brandId);
        return {
          id: stat.brandId,
          name: brand?.name || 'Unknown',
          slug: brand?.slug || '',
          count: stat._count.id
        };
      }),
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 0,
        average: priceStats._avg.price || 0
      }
    };
  } catch (error) {
    console.error('Filter counts error:', error);
    return {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 0, average: 0 }
    };
  }
}