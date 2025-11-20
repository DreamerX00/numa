import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface InstagramPost {
  id: string;
  mediaUrl: string;
  mediaType: string;
  postUrl: string;
}

/**
 * GET /api/instagram
 * Fetches active Instagram posts from database (admin-managed)
 */
export async function GET(): Promise<NextResponse<InstagramPost[] | { error: string }>> {
  try {
    // Fetch settings to get display limit
    let settings = await prisma.instagramSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.instagramSettings.create({
        data: {
          displayLimit: 6,
          autoScrollSpeed: 3000,
          isActive: true,
        },
      });
    }

    // If Instagram section is disabled, return empty array
    if (!settings.isActive) {
      return NextResponse.json([]);
    }

    // Fetch active posts ordered by sortOrder
    const posts = await prisma.instagramPost.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: settings.displayLimit,
    });

    // Transform to frontend format
    const transformedPosts: InstagramPost[] = posts.map((post) => ({
      id: post.id,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      postUrl: post.postUrl,
    }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram posts" },
      { status: 500 }
    );
  }
}
