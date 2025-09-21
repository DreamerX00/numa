import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth/admin';

// GET /api/admin/carousel/[id] - Get specific carousel slide
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slide = await prisma.carouselSlide.findUnique({
      where: { id }
    });

    if (!slide) {
      return NextResponse.json(
        { error: 'Carousel slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error fetching carousel slide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel slide' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/carousel/[id] - Update carousel slide
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin access
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      image,
      ctaText,
      ctaLink,
      overlay,
      order,
      isActive
    } = body;

    // Validate required fields
    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    const slide = await prisma.carouselSlide.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        image,
        ctaText,
        ctaLink,
        overlay,
        order,
        isActive
      }
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error updating carousel slide:', error);
    return NextResponse.json(
      { error: 'Failed to update carousel slide' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/carousel/[id] - Delete carousel slide
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.carouselSlide.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting carousel slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete carousel slide' },
      { status: 500 }
    );
  }
}