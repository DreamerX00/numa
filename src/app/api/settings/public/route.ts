import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

// Public endpoint to get non-sensitive settings for client components
export async function GET() {
  try {
    const settings = await getSettings();

    // Only return non-sensitive settings
    const publicSettings = {
      general: {
        siteName: settings.general.siteName,
        supportEmail: settings.general.supportEmail,
        currency: settings.general.currency,
        language: settings.general.language,
      },
      shipping: {
        freeShippingThreshold: settings.shipping.freeShippingThreshold,
        standardRate: settings.shipping.standardRate,
        expeditedRate: settings.shipping.expeditedRate,
        codCharges: settings.shipping.codCharges,
        codEnabled: settings.shipping.codEnabled,
      },
      payments: {
        phonePeEnabled: settings.payments.phonePeEnabled,
        phonePeDisplayName: settings.payments.phonePeDisplayName,
        razorpayEnabled: settings.payments.razorpayEnabled,
        razorpayDisplayName: settings.payments.razorpayDisplayName,
        razorpayKeyId:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
          process.env.RAZORPAY_KEY_ID ||
          "", // Use env variable
        stripeEnabled: settings.payments.stripeEnabled,
        stripeDisplayName: settings.payments.stripeDisplayName,
        codEnabled: settings.payments.codEnabled,
        codDisplayName: settings.payments.codDisplayName,
        codInstructions: settings.payments.codInstructions,
        minOrderAmount: settings.payments.minOrderAmount,
      },
      company: {
        gstRate: settings.company.gstRate,
      },
      seo: {
        metaTitle: settings.seo.metaTitle,
        metaDescription: settings.seo.metaDescription,
      },
    };

    return NextResponse.json(
      {
        settings: publicSettings,
        success: true,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch public settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
