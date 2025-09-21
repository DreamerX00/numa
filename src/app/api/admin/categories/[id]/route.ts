import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);

  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, description, parentId, metaTitle, metaDescription, isActive } = body;

    // Generate slug from name if name is provided
    const updateData: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string | null;
      metaTitle?: string;
      metaDescription?: string;
      isActive?: boolean;
    } = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(category);

  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await params;

  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products' },
        { status: 400 }
      );
    }

    // Check if category has children
    const childrenCount = await prisma.category.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
