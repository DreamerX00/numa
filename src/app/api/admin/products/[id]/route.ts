import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullish(),
  shortDescription: z.string().nullish(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullish(),
  costPrice: z.number().positive().nullish(),
  sku: z.string().min(1).nullish(),
  barcode: z.string().nullish(),
  trackQuantity: z.boolean().optional(),
  quantity: z.number().int().min(0).optional(),
  minQuantity: z.number().int().min(0).optional(),
  weight: z.number().min(0).nullish(),
  images: z.array(z.string()).optional(),
  metaTitle: z.string().nullish(),
  metaDescription: z.string().nullish(),
  categoryId: z.string().optional(),
  brandId: z.string().nullish(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    console.log('Update request body:', JSON.stringify(body, null, 2));
    const validatedData = updateProductSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // Prepare the update object
    const updateFields: {
      name?: string;
      slug?: string;
      description?: string | null;
      shortDescription?: string | null;
      price?: number;
      comparePrice?: number | null;
      costPrice?: number | null;
      sku?: string | null;
      barcode?: string | null;
      trackQuantity?: boolean;
      quantity?: number;
      minQuantity?: number;
      weight?: number | null;
      images?: string[];
      metaTitle?: string | null;
      metaDescription?: string | null;
      categoryId?: string;
      brandId?: string | null;
      tags?: string[];
      status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
      isActive?: boolean;
      isFeatured?: boolean;
    } = {};

    // Safely copy fields
    if (validatedData.name !== undefined) updateFields.name = validatedData.name;
    if (validatedData.slug !== undefined) updateFields.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateFields.description = validatedData.description;
    if (validatedData.shortDescription !== undefined) updateFields.shortDescription = validatedData.shortDescription;
    if (validatedData.price !== undefined) updateFields.price = validatedData.price;
    if (validatedData.comparePrice !== undefined) updateFields.comparePrice = validatedData.comparePrice;
    if (validatedData.costPrice !== undefined) updateFields.costPrice = validatedData.costPrice;
    if (validatedData.sku !== undefined) updateFields.sku = validatedData.sku;
    if (validatedData.barcode !== undefined) updateFields.barcode = validatedData.barcode;
    if (validatedData.trackQuantity !== undefined) updateFields.trackQuantity = validatedData.trackQuantity;
    if (validatedData.quantity !== undefined) updateFields.quantity = validatedData.quantity;
    if (validatedData.minQuantity !== undefined) updateFields.minQuantity = validatedData.minQuantity;
    if (validatedData.weight !== undefined) updateFields.weight = validatedData.weight;
    if (validatedData.images !== undefined) updateFields.images = validatedData.images;
    if (validatedData.metaTitle !== undefined) updateFields.metaTitle = validatedData.metaTitle;
    if (validatedData.metaDescription !== undefined) updateFields.metaDescription = validatedData.metaDescription;
    if (validatedData.categoryId !== undefined) updateFields.categoryId = validatedData.categoryId;
    if (validatedData.brandId !== undefined) updateFields.brandId = validatedData.brandId;
    if (validatedData.status !== undefined) updateFields.status = validatedData.status;
    if (validatedData.isActive !== undefined) updateFields.isActive = validatedData.isActive;
    if (validatedData.isFeatured !== undefined) updateFields.isFeatured = validatedData.isFeatured;
    
    // Handle tags - convert string to array or use array directly
    if (validatedData.tags !== undefined && validatedData.tags !== null) {
      if (Array.isArray(validatedData.tags)) {
        updateFields.tags = validatedData.tags;
      } else {
        updateFields.tags = validatedData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateFields,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(product);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}