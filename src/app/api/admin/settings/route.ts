import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { invalidateSettingsCache } from "@/lib/settings";

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    // Get all settings from database
    const settings = await prisma.systemSetting.findMany({
      select: {
        key: true,
        value: true,
        category: true,
        description: true,
      },
    });

    // Group settings by category
    const groupedSettings = settings.reduce(
      (acc: Record<string, Record<string, unknown>>, setting) => {
        const category = setting.category || "general";
        if (!acc[category]) {
          acc[category] = {};
        }

        acc[category][setting.key] = setting.value;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      settings: groupedSettings,
      success: true,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) return adminCheck;

    const { category, settings } = await request.json();

    if (!category || !settings) {
      return NextResponse.json(
        { error: "Category and settings are required" },
        { status: 400 }
      );
    }

    // Update or create settings
    const updatePromises = Object.entries(settings).map(
      async ([key, value]) => {
        // Properly handle JSON values for MongoDB
        // All values must be valid JSON (primitives, objects, arrays)
        // Null values are stored as JSON null
        const jsonValue: Prisma.InputJsonValue =
          value === null || value === undefined
            ? (null as unknown as Prisma.InputJsonValue) // JSON null
            : (value as Prisma.InputJsonValue);

        return prisma.systemSetting.upsert({
          where: { key },
          update: {
            value: jsonValue,
            category,
            updatedAt: new Date(),
          },
          create: {
            key,
            value: jsonValue,
            category,
            updatedAt: new Date(),
          },
        });
      }
    );

    await Promise.all(updatePromises);

    // Invalidate settings cache so next request gets fresh data
    invalidateSettingsCache();

    return NextResponse.json({
      message: "Settings updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
