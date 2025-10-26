import { prisma } from "@/lib/prisma";

export interface CompanySettingsData {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZipCode: string;
  companyCountry: string;

  // Contact Information
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;

  // Tax Information
  gstin: string;
  pan?: string | null;
  gstRate: number;

  // Invoice Settings
  invoicePrefix: string;
  invoiceTerms: string;
  invoiceNotes?: string | null;

  // Logo & Branding
  companyLogo?: string | null;
  invoiceLogo?: string | null;
  invoiceLogoPosition?: string;

  // Bank Details
  bankName?: string | null;
  bankAccount?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  bankAccountHolder?: string | null;
  bankUpiId?: string | null;
  paymentQrCode?: string | null;

  // Signature & Authorization
  signatoryName?: string | null;
  signatoryDesignation?: string | null;
  digitalSignature?: string | null;
  companySeal?: string | null;

  // Additional Terms
  deliveryTerms?: string | null;
  returnPolicy?: string | null;
  warrantyInfo?: string | null;

  // Invoice Configuration
  invoiceDefaultDueDays?: number;
}

/**
 * Get company settings for invoice generation
 * Returns settings from database or creates default settings if none exist
 */
export async function getCompanySettings(): Promise<CompanySettingsData> {
  try {
    // Try to get existing settings
    let settings = await prisma.companySettings.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: "Numa Jewelry",
          companyAddress: "123 Business Street",
          companyCity: "Mumbai",
          companyState: "MAHARASHTRA",
          companyZipCode: "400001",
          companyCountry: "India",
          companyPhone: "+91-9876543210",
          companyEmail: "contact@numa.com",
          companyWebsite: "www.numa.com",
          gstin: "27ABCDE1234F1Z5",
          gstRate: 0.18,
          invoicePrefix: "INV",
          invoiceTerms: "Payment is due within 30 days of invoice date",
          isActive: true,
        },
      });
    }

    return {
      companyName: settings.companyName,
      companyAddress: settings.companyAddress,
      companyCity: settings.companyCity,
      companyState: settings.companyState,
      companyZipCode: settings.companyZipCode,
      companyCountry: settings.companyCountry,
      companyPhone: settings.companyPhone,
      companyEmail: settings.companyEmail,
      companyWebsite: settings.companyWebsite,
      gstin: settings.gstin,
      pan: settings.pan,
      gstRate: settings.gstRate,
      invoicePrefix: settings.invoicePrefix,
      invoiceTerms: settings.invoiceTerms,
      invoiceNotes: settings.invoiceNotes,
      companyLogo: settings.companyLogo,
      bankName: settings.bankName,
      bankAccount: settings.bankAccount,
      bankIfsc: settings.bankIfsc,
      bankBranch: settings.bankBranch,
      // New Phase 1 fields
      invoiceLogo: settings.invoiceLogo,
      invoiceLogoPosition: settings.invoiceLogoPosition,
      bankAccountHolder: settings.bankAccountHolder,
      bankUpiId: settings.bankUpiId,
      paymentQrCode: settings.paymentQrCode,
      signatoryName: settings.signatoryName,
      signatoryDesignation: settings.signatoryDesignation,
      digitalSignature: settings.digitalSignature,
      companySeal: settings.companySeal,
      deliveryTerms: settings.deliveryTerms,
      returnPolicy: settings.returnPolicy,
      warrantyInfo: settings.warrantyInfo,
      invoiceDefaultDueDays: settings.invoiceDefaultDueDays,
    };
  } catch (error) {
    console.error("Error fetching company settings:", error);
    // Return default settings as fallback
    return {
      companyName: "Numa Jewelry",
      companyAddress: "123 Business Street",
      companyCity: "Mumbai",
      companyState: "MAHARASHTRA",
      companyZipCode: "400001",
      companyCountry: "India",
      companyPhone: "+91-9876543210",
      companyEmail: "contact@numa.com",
      companyWebsite: "www.numa.com",
      gstin: "27ABCDE1234F1Z5",
      gstRate: 0.18,
      invoicePrefix: "INV",
      invoiceTerms: "Payment is due within 30 days of invoice date",
    };
  }
}

/**
 * Update company settings
 * Only accessible by super admin
 */
export async function updateCompanySettings(
  data: Partial<CompanySettingsData>
) {
  try {
    // Get current active settings
    const currentSettings = await prisma.companySettings.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (currentSettings) {
      // Update existing settings
      return await prisma.companySettings.update({
        where: { id: currentSettings.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new settings with required fields
      const defaultData: CompanySettingsData = {
        companyName: "Numa Jewelry",
        companyAddress: "123 Business Street",
        companyCity: "Mumbai",
        companyState: "MAHARASHTRA",
        companyZipCode: "400001",
        companyCountry: "India",
        companyPhone: "+91-9876543210",
        companyEmail: "contact@numa.com",
        companyWebsite: "www.numa.com",
        gstin: "27ABCDE1234F1Z5",
        gstRate: 0.18,
        invoicePrefix: "INV",
        invoiceTerms: "Payment is due within 30 days of invoice date",
        ...data,
      };

      return await prisma.companySettings.create({
        data: {
          ...defaultData,
          isActive: true,
        },
      });
    }
  } catch (error) {
    console.error("Error updating company settings:", error);
    throw new Error("Failed to update company settings");
  }
}

/**
 * Generate next invoice number
 */
export async function generateInvoiceNumber(): Promise<string> {
  try {
    const settings = await getCompanySettings();
    const year = new Date().getFullYear();
    const invoiceCount = await prisma.invoice.count();
    const nextNumber = String(invoiceCount + 1).padStart(6, "0");

    return `${settings.invoicePrefix}-${year}-${nextNumber}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    const year = new Date().getFullYear();
    const invoiceCount = await prisma.invoice.count();
    const nextNumber = String(invoiceCount + 1).padStart(6, "0");
    return `INV-${year}-${nextNumber}`;
  }
}
