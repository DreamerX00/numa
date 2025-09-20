import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth/admin';

// GET /api/admin/carousel - Get all carousel slides
export async function GET() {
  try {
    const slides = await prisma.carouselSlide.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(slides);
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel slides' },
      { status: 500 }
    );
  }
}

// POST /api/admin/carousel - Create new carousel slide
export async function POST(req: NextRequest) {
  try {
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

    const slide = await prisma.carouselSlide.create({
      data: {
        title,
        subtitle,
        description,
        image,
        ctaText,
        ctaLink,
        overlay,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error creating carousel slide:', error);
    return NextResponse.json(
      { error: 'Failed to create carousel slide' },
      { status: 500 }
    );
  }
}