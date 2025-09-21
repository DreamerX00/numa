import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      total: categories.length,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat._count.products
      }))
    });

  } catch (error) {
    console.error('Error fetching debug categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error },
      { status: 500 }
    );
  }
}