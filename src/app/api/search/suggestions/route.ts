import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Rate limiter for suggestions
const suggestionsRateLimit = rateLimit(rateLimitConfigs.api);

// Suggestions schema
const suggestionsSchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.number().min(1).max(10).default(5)
});

// Contract
// GET /api/search/suggestions?q=ring&limit=5
// Response: { suggestions: string[], categories: CategorySuggestion[], products: ProductSuggestion[] }

export async function GET(req: NextRequest) {
  return suggestionsRateLimit(req, async () => {
    try {
      const { searchParams } = new URL(req.url);
      
      const queryParams = {
        q: searchParams.get('q') || '',
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5
      };

      const validationResult = suggestionsSchema.safeParse(queryParams);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid parameters" },
          { status: 400 }
        );
      }

      const { q, limit } = validationResult.data;

      // Get suggestions from multiple sources
      const [productSuggestions, categorySuggestions, tagSuggestions, trendingSearches] = await Promise.all([
        // Product name suggestions
        prisma.product.findMany({
          where: {
            isActive: true,
            status: 'ACTIVE',
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true
          },
          take: limit,
          orderBy: [
            { isFeatured: 'desc' },
            { name: 'asc' }
          ]
        }),

        // Category suggestions
        prisma.category.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            _count: {
              select: { products: true }
            }
          },
          take: limit,
          orderBy: { name: 'asc' }
        }),

        // Tag suggestions (from existing products)
        prisma.product.findMany({
          where: {
            isActive: true,
            status: 'ACTIVE',
            tags: { hasSome: [q] }
          },
          select: { tags: true },
          take: 10
        }),

        // Get trending/popular search terms (mock data for now)
        Promise.resolve([
          'rings', 'necklaces', 'earrings', 'bracelets', 'gold jewelry',
          'silver jewelry', 'wedding rings', 'diamond earrings', 'pearl necklace',
          'fashion jewelry'
        ].filter(term => term.toLowerCase().includes(q.toLowerCase())))
      ]);

      // Extract unique tags that contain the query
      const allTags = tagSuggestions.flatMap(product => product.tags);
      const matchingTags = [...new Set(allTags.filter(tag => 
        tag.toLowerCase().includes(q.toLowerCase())
      ))].slice(0, limit);

      // Generate text suggestions with better relevance
      const textSuggestions = [
        // Trending searches that match query
        ...trendingSearches.slice(0, 2),
        // Product names
        ...productSuggestions.map(p => p.name).slice(0, 2),
        // Category names
        ...categorySuggestions.map(c => c.name).slice(0, 2),
        // Matching tags
        ...matchingTags.slice(0, 1)
      ]
        .filter((suggestion, index, arr) => arr.indexOf(suggestion) === index) // Remove duplicates
        .slice(0, limit);

      return NextResponse.json({
        suggestions: textSuggestions,
        categories: categorySuggestions.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          productCount: cat._count.products
        })),
        products: productSuggestions.map(product => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0] || null,
          price: product.price
        })),
        tags: matchingTags,
        trending: trendingSearches.slice(0, 5)
      });

    } catch (error) {
      console.error('Suggestions error:', error);
      return NextResponse.json(
        { error: 'Failed to get suggestions' },
        { status: 500 }
      );
    }
  });
}