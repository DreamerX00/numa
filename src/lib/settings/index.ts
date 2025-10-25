import { prisma } from "@/lib/prisma";

interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    timezone: string;
    currency: string;
    language: string;
    maintenanceMode: boolean;
  };
  shipping: {
    freeShippingThreshold: number;
    standardRate: number;
    expeditedRate: number;
    sameDay: boolean;
    sameDayRate: number;
    sameDayMinOrder: number;
    internationalShipping: boolean;
    internationalRate: number;
    internationalProcessingTime: number;
    codEnabled: boolean;
    codCharges: number;
    codMaxAmount: number;
    freeShippingMethod: string;
    defaultProcessingTime: number;
  };
  payments: {
    phonePeEnabled: boolean;
    phonePeMerchantId: string;
    phonePeSaltKey: string;
    phonePeDisplayName: string;
    razorpayEnabled: boolean;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    razorpayDisplayName: string;
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeDisplayName: string;
    codEnabled: boolean;
    codDisplayName: string;
    codInstructions: string;
    minOrderAmount: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    analyticsId: string;
  };
  company: {
    companyName: string;
    companyAddress: string;
    companyCity: string;
    companyState: string;
    companyZipCode: string;
    companyCountry: string;
    companyPhone: string;
    companyEmail: string;
    companyWebsite: string;
    gstin: string;
  };
}

// Default settings fallback
const defaultSettings: Settings = {
  general: {
    siteName: "Numa Store",
    siteDescription: "Your premium e-commerce platform",
    supportEmail: "support@numa.com",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
    maintenanceMode: false,
  },
  shipping: {
    freeShippingThreshold: 500,
    standardRate: 50,
    expeditedRate: 150,
    sameDay: false,
    sameDayRate: 300,
    sameDayMinOrder: 1000,
    internationalShipping: false,
    internationalRate: 500,
    internationalProcessingTime: 7,
    codEnabled: true,
    codCharges: 50,
    codMaxAmount: 10000,
    freeShippingMethod: "standard",
    defaultProcessingTime: 2,
  },
  payments: {
    phonePeEnabled: true,
    phonePeMerchantId: "PGTESTPAYUAT",
    phonePeSaltKey: "",
    phonePeDisplayName: "PhonePe / UPI",
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    razorpayDisplayName: "Cards / UPI / Wallets",
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeDisplayName: "Credit/Debit Card",
    codEnabled: true,
    codDisplayName: "Cash on Delivery",
    codInstructions: "Pay when you receive your order",
    minOrderAmount: 100,
  },
  seo: {
    metaTitle: "Numa Store - Premium Products Online",
    metaDescription:
      "Discover premium products at Numa Store. Quality guaranteed.",
    metaKeywords: "ecommerce, premium, products, online shopping",
    analyticsId: "",
  },
  company: {
    companyName: "Numa Store",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZipCode: "",
    companyCountry: "India",
    companyPhone: "",
    companyEmail: "contact@numa.com",
    companyWebsite: "",
    gstin: "",
  },
};

let cachedSettings: Settings | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Get system settings from database with caching
 */
export async function getSettings(): Promise<Settings> {
  // Return cached settings if still valid
  if (cachedSettings && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    const settings = await prisma.systemSetting.findMany({
      select: {
        key: true,
        value: true,
        category: true,
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

    // Merge with defaults
    cachedSettings = {
      general: { ...defaultSettings.general, ...groupedSettings.general },
      shipping: { ...defaultSettings.shipping, ...groupedSettings.shipping },
      payments: { ...defaultSettings.payments, ...groupedSettings.payments },
      seo: { ...defaultSettings.seo, ...groupedSettings.seo },
      company: { ...defaultSettings.company, ...groupedSettings.company },
    } as Settings;

    cacheTime = Date.now();
    return cachedSettings;
  } catch (error) {
    console.error("Failed to load settings from database:", error);
    return defaultSettings;
  }
}

/**
 * Get a specific setting value
 */
export async function getSetting<T = unknown>(
  category: keyof Settings,
  key: string
): Promise<T | null> {
  const settings = await getSettings();
  const categorySettings = settings[category] as Record<string, unknown>;
  return (categorySettings?.[key] as T) ?? null;
}

/**
 * Invalidate settings cache (call after updating settings)
 */
export function invalidateSettingsCache(): void {
  cachedSettings = null;
  cacheTime = 0;
}
