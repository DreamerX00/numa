import { NextResponse } from "next/server";

interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  postUrl: string;
}

/**
 * GET /api/instagram
 * Fetches recent Instagram posts from NUMA's Instagram account
 * 
 * Requires environment variables:
 * - INSTAGRAM_ACCESS_TOKEN: Instagram Graph API access token
 * - INSTAGRAM_BUSINESS_ACCOUNT_ID: Business account ID for @numa.iin
 */
export async function GET(): Promise<NextResponse<InstagramPost[] | { error: string }>> {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    // If credentials are not set, return fallback mock data
    if (!accessToken || !businessAccountId) {
      console.warn("Instagram API credentials not configured. Using mock data.");
      return NextResponse.json(getMockInstagramPosts());
    }

    // Fetch Instagram media from the Graph API
    const response = await fetch(
      `https://graph.instagram.com/${businessAccountId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count&limit=12&access_token=${accessToken}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error("Instagram API error:", response.statusText);
      return NextResponse.json(getMockInstagramPosts());
    }

    const data = await response.json();

    // Transform Instagram API response to our format
    interface InstagramMediaResponse {
      id: string;
      media_url: string;
      like_count: number;
      comments_count: number;
      caption: string;
    }

    const posts: InstagramPost[] = (data.data || [])
      .slice(0, 6)
      .map((post: InstagramMediaResponse) => ({
        id: post.id,
        image: post.media_url || getPlaceholderImage(),
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        caption: post.caption || "Check out our latest collection! ✨",
        postUrl: `https://instagram.com/numa.iin`,
      }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    // Return mock data as fallback
    return NextResponse.json(getMockInstagramPosts());
  }
}

function getMockInstagramPosts(): InstagramPost[] {
  return [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
      likes: 1250,
      comments: 42,
      caption: "✨ New collection drops today! Ethically sourced, beautifully crafted 🤍",
      postUrl: "https://instagram.com/numa.iin",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1515562141207-6811bcb33ce1?w=400&h=400&fit=crop",
      likes: 2150,
      comments: 78,
      caption: "Waistchains that make you feel like a diva ✨ #NumaJewelry",
      postUrl: "https://instagram.com/numa.iin",
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1599643478102-b2a0db2c11a1?w=400&h=400&fit=crop",
      likes: 1890,
      comments: 56,
      caption: "Matching sets for matching vibes 💫",
      postUrl: "https://instagram.com/numa.iin",
    },
    {
      id: "4",
      image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
      likes: 3420,
      comments: 124,
      caption: "Limited edition drops - get them before they're gone! 🔥",
      postUrl: "https://instagram.com/numa.iin",
    },
    {
      id: "5",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
      likes: 2780,
      comments: 89,
      caption: "Your favorite pieces are back in stock! Shop now 💎",
      postUrl: "https://instagram.com/numa.iin",
    },
    {
      id: "6",
      image: "https://images.unsplash.com/photo-1515377905703-c28bde4cb853?w=400&h=400&fit=crop",
      likes: 2340,
      comments: 67,
      caption: "Sustainable luxury jewelry for the modern woman ✨",
      postUrl: "https://instagram.com/numa.iin",
    },
  ];
}

function getPlaceholderImage(): string {
  const placeholders = [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1515562141207-6811bcb33ce1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1599643478102-b2a0db2c11a1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
  ];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
}
