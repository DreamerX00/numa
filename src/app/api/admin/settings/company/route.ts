import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth/admin";
import {
  getCompanySettings,
  updateCompanySettings,
} from "@/lib/services/companySettings";
import { z } from "zod";

// Validation schema for company settings
const companySettingsSchema = z.object({
  // Company Information
  companyName: z.string().min(1, "Company name is required").optional(),
  companyAddress: z.string().min(1, "Address is required").optional(),
  companyCity: z.string().min(1, "City is required").optional(),
  companyState: z.string().min(1, "State is required").optional(),
  companyZipCode: z.string().min(1, "Zip code is required").optional(),
  companyCountry: z.string().min(1, "Country is required").optional(),

  // Contact Information
  companyPhone: z.string().min(1, "Phone is required").optional(),
  companyEmail: z.string().email("Invalid email format").optional(),
  companyWebsite: z.string().min(1, "Website is required").optional(),

  // Tax Information
  gstin: z
    .string()
    .min(15, "GSTIN must be 15 characters")
    .max(15, "GSTIN must be 15 characters")
    .optional(),
  pan: z
    .string()
    .min(10, "PAN must be 10 characters")
    .max(10, "PAN must be 10 characters")
    .optional()
    .nullable(),
  gstRate: z
    .number()
    .min(0, "GST rate must be positive")
    .max(1, "GST rate must be between 0 and 1")
    .optional(),

  // Invoice Settings
  invoicePrefix: z.string().min(1, "Invoice prefix is required").optional(),
  invoiceTerms: z.string().min(1, "Invoice terms are required").optional(),
  invoiceNotes: z.string().optional().nullable(),

  // Logo
  companyLogo: z.string().url("Invalid logo URL").optional().nullable(),

  // Bank Details
  bankName: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
});

/**
 * GET /api/admin/settings/company
 * Fetch current company settings
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const authResult = await verifyAdminAuth(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch company settings
    const settings = await getCompanySettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch company settings",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings/company
 * Update company settings (Super Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const authResult = await verifyAdminAuth(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is SUPER_ADMIN (only super admins can modify settings)
    if (authResult.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Super Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = companySettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Update settings
    const updatedSettings = await updateCompanySettings(validationResult.data);

    return NextResponse.json({
      success: true,
      message: "Company settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating company settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update company settings",
      },
      { status: 500 }
    );
  }
}
