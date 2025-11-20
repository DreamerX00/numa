import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/instagram/settings
 * Get Instagram carousel settings
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    let settings = await prisma.instagramSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.instagramSettings.create({
        data: {
          displayLimit: 6,
          autoScrollSpeed: 3000,
          isActive: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching Instagram settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/instagram/settings
 * Update Instagram carousel settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayLimit, autoScrollSpeed, isActive } = body;

    let settings = await prisma.instagramSettings.findFirst();

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.instagramSettings.create({
        data: {
          displayLimit: displayLimit ?? 6,
          autoScrollSpeed: autoScrollSpeed ?? 3000,
          isActive: isActive ?? true,
        },
      });
    } else {
      // Update existing
      settings = await prisma.instagramSettings.update({
        where: { id: settings.id },
        data: {
          ...(displayLimit !== undefined && { displayLimit }),
          ...(autoScrollSpeed !== undefined && { autoScrollSpeed }),
          ...(isActive !== undefined && { isActive }),
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating Instagram settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
