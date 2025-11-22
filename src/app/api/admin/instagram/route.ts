import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import type { InstagramMediaType } from "@prisma/client";

/**
 * GET /api/admin/instagram
 * Fetch all Instagram posts (admin only)
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const posts = await prisma.instagramPost.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/instagram
 * Create new Instagram post (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mediaUrl, mediaType, postUrl } = body;

    // Validation
    if (!mediaUrl || !postUrl) {
      return NextResponse.json(
        { error: "mediaUrl and postUrl are required" },
        { status: 400 }
      );
    }

    if (mediaType && !["POST", "REEL"].includes(mediaType)) {
      return NextResponse.json(
        { error: "mediaType must be POST or REEL" },
        { status: 400 }
      );
    }

    // Get the highest sortOrder and add 1
    const lastPost = await prisma.instagramPost.findFirst({
      orderBy: { sortOrder: "desc" },
    });

    const newPost = await prisma.instagramPost.create({
      data: {
        mediaUrl,
        mediaType: (mediaType as InstagramMediaType) || "POST",
        postUrl,
        sortOrder: lastPost ? lastPost.sortOrder + 1 : 0,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating Instagram post:", error);
    return NextResponse.json(
      { error: "Failed to create Instagram post" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/instagram
 * Update Instagram posts (reorder, toggle active, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, id, data, posts } = body;

    // Bulk reorder
    if (action === "reorder" && posts && Array.isArray(posts)) {
      // Update sortOrder for multiple posts
      const updates = posts.map((post: { id: string; sortOrder: number }) =>
        prisma.instagramPost.update({
          where: { id: post.id },
          data: { sortOrder: post.sortOrder },
        })
      );

      await prisma.$transaction(updates);

      return NextResponse.json({ message: "Posts reordered successfully" });
    }

    // Toggle active status
    if (action === "toggle" && id) {
      const post = await prisma.instagramPost.findUnique({
        where: { id },
      });

      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      const updated = await prisma.instagramPost.update({
        where: { id },
        data: { isActive: !post.isActive },
      });

      return NextResponse.json(updated);
    }

    // Update post data
    if (action === "update" && id && data) {
      const updated = await prisma.instagramPost.update({
        where: { id },
        data: {
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          postUrl: data.postUrl,
          isActive: data.isActive,
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating Instagram post:", error);
    return NextResponse.json(
      { error: "Failed to update Instagram post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/instagram
 * Delete Instagram post
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await prisma.instagramPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting Instagram post:", error);
    return NextResponse.json(
      { error: "Failed to delete Instagram post" },
      { status: 500 }
    );
  }
}
