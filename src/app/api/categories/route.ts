import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCounts = searchParams.get('includeCounts') === 'true';

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: includeCounts ? {
          select: {
            products: {
              where: {
                isActive: true,
                status: 'ACTIVE'
              }
            }
          }
        } : false,
        // Get the latest product from each category for the image
        products: {
          where: {
            isActive: true,
            status: 'ACTIVE'
          },
          select: {
            images: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform categories to include latest product image
    const categoriesWithImages = categories.map(category => ({
      ...category,
      // Use latest product image if available and has images, otherwise fall back to category image
      latestProductImage: (category.products[0]?.images?.length > 0) ? category.products[0].images[0] : null,
      products: undefined // Remove products array from response
    }));

    return NextResponse.json(categoriesWithImages);

  } catch (error) {
    console.error('Public categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}