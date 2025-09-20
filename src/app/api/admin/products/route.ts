import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction, verifyAdminAuth } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  trackQuantity: z.boolean().default(true),
  quantity: z.number().min(0).default(0),
  minQuantity: z.number().min(0).default(0),
  weight: z.number().optional(),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string(),
  brandId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  hasVariants: z.boolean().default(false)
});

export async function GET(req: NextRequest) {
  const adminCheck = await verifyAdminAuth(req);
  if (!adminCheck.success) {
    return NextResponse.json({ error: adminCheck.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status as Prisma.EnumProductStatusFilter;
    }

    if (category) {
      where.categoryId = category;
    }

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'name' || sortBy === 'price' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder as 'asc' | 'desc';
    } else {
      orderBy.createdAt = sortOrder as 'asc' | 'desc';
    }

    const [products, totalCount, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          variants: { select: { id: true, name: true, price: true } },
          _count: { select: { reviews: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true }
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        select: { id: true, name: true }
      })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        categories,
        brands
      }
    });

  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminCheck = await verifyAdminAuth(req);
  if (!adminCheck.success) {
    return NextResponse.json({ error: adminCheck.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: validatedData,
      include: {
        category: true,
        brand: true
      }
    });

    // Log admin action
    if (adminCheck?.user) {
      await logAdminAction(
        adminCheck.user.id,
        'CREATE',
        'product',
        product.id,
        { productName: product.name },
        req
      );
    }

    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}