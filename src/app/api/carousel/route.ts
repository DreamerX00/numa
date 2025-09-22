import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/carousel - Get active carousel slides for public display
export async function GET() {
  try {
    const slides = await prisma.carouselSlide.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        image: true,
        ctaText: true,
        ctaLink: true,
        overlay: true,
        order: true
      }
    });

    const response = NextResponse.json(slides);
    
    // Add cache-busting headers to ensure fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel slides' },
      { status: 500 }
    );
  }
}