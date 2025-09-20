import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCounts = searchParams.get('includeCounts') === 'true';

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: includeCounts ? {
          select: {
            products: {
              where: {
                isActive: true,
                status: 'ACTIVE'
              }
            }
          }
        } : false
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);

  } catch (error) {
    console.error('Public categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}