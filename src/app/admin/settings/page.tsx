"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  CreditCard,
  Truck,
  Shield,
  Globe,
  Store,
  Bell,
  Save,
  CheckCircle,
  Building2,
  Phone,
  Receipt,
  Landmark,
} from "lucide-react";
import HeartLoader from "@/components/ui/HeartLoader";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Numa Store",
    siteDescription: "Your premium e-commerce platform",
    supportEmail: "support@numa.com",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
    maintenanceMode: false,
  });

  const [shippingSettings, setShippingSettings] = useState({
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
    codCharges: 25,
    codMaxAmount: 10000,
    freeShippingMethod: "standard",
    defaultProcessingTime: 2,
    trackingEmailTemplate: "default",
    autoTrackingEmails: true,
    smsNotifications: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    lowStock: true,
    stockThreshold: 10,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
    loginAttempts: 5,
    ipWhitelist: false,
    apiRateLimit: 100,
  });

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "Numa Store - Premium Products Online",
    metaDescription:
      "Discover premium products at Numa Store. Quality guaranteed.",
    metaKeywords: "ecommerce, premium, products, online shopping",
    sitemap: true,
    robotsTxt: true,
    structuredData: true,
    analyticsId: "G-XXXXXXXXXX",
  });

  const [paymentSettings, setPaymentSettings] = useState({
    // PhonePe
    phonePeEnabled: true,
    phonePeMerchantId: "PGTESTPAYUAT",
    phonePeSaltKey: "•••••••••••••••",
    phonePeDisplayName: "PhonePe / UPI",
    // Razorpay
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    razorpayDisplayName: "Cards / UPI / Wallets",
    // Stripe
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeDisplayName: "Credit/Debit Card",
    // Cash on Delivery
    codEnabled: true,
    codDisplayName: "Cash on Delivery",
    codInstructions: "Pay when you receive your order",
    // General
    minOrderAmount: 100,
  });

  const [companySettings, setCompanySettings] = useState({
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZipCode: "",
    companyCountry: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
    gstin: "",
    pan: null as string | null,
    gstRate: 0.18,
    invoicePrefix: "INV",
    invoiceTerms: "",
    invoiceNotes: null as string | null,
    companyLogo: null as string | null,
    bankName: null as string | null,
    bankAccount: null as string | null,
    bankIfsc: null as string | null,
    bankBranch: null as string | null,
    // Phase 1 Invoice Settings
    invoiceLogo: null as string | null,
    invoiceLogoPosition: "left",
    signatoryName: null as string | null,
    signatoryDesignation: null as string | null,
    digitalSignature: null as string | null,
    companySeal: null as string | null,
    bankAccountHolder: null as string | null,
    bankUpiId: null as string | null,
    paymentQrCode: null as string | null,
    deliveryTerms: null as string | null,
    returnPolicy: null as string | null,
    warrantyInfo: null as string | null,
    invoiceDefaultDueDays: 30,
  });

  // Load settings from API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (data.success && data.settings) {
        // Update state with loaded settings
        if (data.settings.general) {
          setGeneralSettings((prev) => ({ ...prev, ...data.settings.general }));
        }
        if (data.settings.payments) {
          setPaymentSettings((prev) => ({
            ...prev,
            ...data.settings.payments,
          }));
        }
        if (data.settings.shipping) {
          setShippingSettings((prev) => ({
            ...prev,
            ...data.settings.shipping,
          }));
        }
        if (data.settings.notifications) {
          setNotificationSettings((prev) => ({
            ...prev,
            ...data.settings.notifications,
          }));
        }
        if (data.settings.security) {
          setSecuritySettings((prev) => ({
            ...prev,
            ...data.settings.security,
          }));
        }
        if (data.settings.seo) {
          setSeoSettings((prev) => ({ ...prev, ...data.settings.seo }));
        }
      }

      // Load company settings separately
      const companyResponse = await fetch("/api/admin/settings/company");
      const companyData = await companyResponse.json();

      if (companyData.success && companyData.data) {
        setCompanySettings(companyData.data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    try {
      setLoading(true);

      // Handle company settings separately
      if (section === "company") {
        const response = await fetch("/api/admin/settings/company", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(companySettings),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Company settings saved successfully!");
          setSavedMessage("Company settings saved successfully!");
          setTimeout(() => setSavedMessage(""), 3000);
        } else {
          throw new Error(result.error || "Failed to save company settings");
        }
        return;
      }

      // Handle other settings
      let settingsData;
      switch (section) {
        case "general":
          settingsData = generalSettings;
          break;
        case "payments":
          settingsData = paymentSettings;
          break;
        case "shipping":
          settingsData = shippingSettings;
          break;
        case "notifications":
          settingsData = notificationSettings;
          break;
        case "security":
          settingsData = securitySettings;
          break;
        case "seo":
          settingsData = seoSettings;
          break;
        default:
          throw new Error("Invalid section");
      }

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: section,
          settings: settingsData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSavedMessage("Settings saved successfully!");
        setTimeout(() => setSavedMessage(""), 3000);
      } else {
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
      setSavedMessage("Failed to save settings. Please try again.");
      setTimeout(() => setSavedMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {initialLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <HeartLoader size="sm" />
            <span>Loading settings...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Manage system configuration and preferences
              </p>
            </div>
            {savedMessage && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">{savedMessage}</span>
              </div>
            )}
          </div>

          <Tabs
            value={activeSection}
            onValueChange={setActiveSection}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger
                value="general"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className="flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4" />
                <span>Company</span>
              </TabsTrigger>
              <TabsTrigger
                value="invoice"
                className="flex items-center space-x-2"
              >
                <Receipt className="h-4 w-4" />
                <span>Invoice</span>
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Payments</span>
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="flex items-center space-x-2"
              >
                <Truck className="h-4 w-4" />
                <span>Shipping</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>SEO</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            siteName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            supportEmail: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          siteDescription: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(value) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            timezone: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Asia/Kolkata">
                            Asia/Kolkata
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            America/New_York
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Europe/London
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={generalSettings.currency}
                        onValueChange={(value) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            currency: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={generalSettings.language}
                        onValueChange={(value) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            language: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">
                        Put the site in maintenance mode
                      </p>
                    </div>
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked: boolean) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          maintenanceMode: checked,
                        }))
                      }
                    />
                  </div>

                  <Button
                    onClick={() => handleSave("general")}
                    disabled={loading}
                  >
                    {loading ? (
                      <HeartLoader size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Settings */}
            <TabsContent value="company">
              <div className="space-y-6">
                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <CardTitle>Company Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          value={companySettings.companyName}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companyName: e.target.value,
                            }))
                          }
                          placeholder="Numa Jewelry"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyCountry">Country *</Label>
                        <Input
                          id="companyCountry"
                          value={companySettings.companyCountry}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companyCountry: e.target.value,
                            }))
                          }
                          placeholder="India"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Address *</Label>
                      <Input
                        id="companyAddress"
                        value={companySettings.companyAddress}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            companyAddress: e.target.value,
                          }))
                        }
                        placeholder="123 Business Street"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyCity">City *</Label>
                        <Input
                          id="companyCity"
                          value={companySettings.companyCity}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companyCity: e.target.value,
                            }))
                          }
                          placeholder="Mumbai"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyState">State *</Label>
                        <Input
                          id="companyState"
                          value={companySettings.companyState}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companyState: e.target.value,
                            }))
                          }
                          placeholder="MAHARASHTRA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyZipCode">ZIP Code *</Label>
                        <Input
                          id="companyZipCode"
                          value={companySettings.companyZipCode}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companyZipCode: e.target.value,
                            }))
                          }
                          placeholder="400001"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <CardTitle>Contact Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyPhone">Phone *</Label>
                        <Input
                          id="companyPhone"
                          value={companySettings.companyPhone}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companyPhone: e.target.value,
                            }))
                          }
                          placeholder="+91-9876543210"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail">Email *</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={companySettings.companyEmail}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companyEmail: e.target.value,
                            }))
                          }
                          placeholder="contact@numa.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Website *</Label>
                      <Input
                        id="companyWebsite"
                        value={companySettings.companyWebsite}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            companyWebsite: e.target.value,
                          }))
                        }
                        placeholder="www.numa.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-5 w-5 text-purple-600" />
                      <CardTitle>Tax Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN *</Label>
                        <Input
                          id="gstin"
                          value={companySettings.gstin}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              gstin: e.target.value,
                            }))
                          }
                          placeholder="27ABCDE1234F1Z5"
                          maxLength={15}
                        />
                        <p className="text-xs text-gray-500">
                          15 characters GST number
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pan">PAN (Optional)</Label>
                        <Input
                          id="pan"
                          value={companySettings.pan || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              pan: e.target.value || null,
                            }))
                          }
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                        <p className="text-xs text-gray-500">
                          10 characters PAN number
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstRate">GST Rate *</Label>
                      <Input
                        id="gstRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={companySettings.gstRate}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            gstRate: parseFloat(e.target.value),
                          }))
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Enter as decimal (e.g., 0.18 for 18% GST)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-5 w-5 text-orange-600" />
                      <CardTitle>Invoice Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">Invoice Prefix *</Label>
                      <Input
                        id="invoicePrefix"
                        value={companySettings.invoicePrefix}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            invoicePrefix: e.target.value,
                          }))
                        }
                        placeholder="INV"
                      />
                      <p className="text-xs text-gray-500">
                        Prefix for invoice numbers (e.g., INV-2024-000001)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceTerms">Invoice Terms *</Label>
                      <Textarea
                        id="invoiceTerms"
                        value={companySettings.invoiceTerms}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            invoiceTerms: e.target.value,
                          }))
                        }
                        placeholder="Payment is due within 30 days of invoice date"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceNotes">
                        Invoice Notes (Optional)
                      </Label>
                      <Textarea
                        id="invoiceNotes"
                        value={companySettings.invoiceNotes || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            invoiceNotes: e.target.value || null,
                          }))
                        }
                        placeholder="Additional notes to appear on invoices"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyLogo">
                        Company Logo URL (Optional)
                      </Label>
                      <Input
                        id="companyLogo"
                        value={companySettings.companyLogo || ""}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            companyLogo: e.target.value || null,
                          }))
                        }
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Landmark className="h-5 w-5 text-indigo-600" />
                      <CardTitle>Bank Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name (Optional)</Label>
                        <Input
                          id="bankName"
                          value={companySettings.bankName || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              bankName: e.target.value || null,
                            }))
                          }
                          placeholder="State Bank of India"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankBranch">Branch (Optional)</Label>
                        <Input
                          id="bankBranch"
                          value={companySettings.bankBranch || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              bankBranch: e.target.value || null,
                            }))
                          }
                          placeholder="Mumbai Main Branch"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">
                          Account Number (Optional)
                        </Label>
                        <Input
                          id="bankAccount"
                          value={companySettings.bankAccount || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              bankAccount: e.target.value || null,
                            }))
                          }
                          placeholder="1234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankIfsc">IFSC Code (Optional)</Label>
                        <Input
                          id="bankIfsc"
                          value={companySettings.bankIfsc || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              bankIfsc: e.target.value || null,
                            }))
                          }
                          placeholder="SBIN0001234"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("company")}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <HeartLoader size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Company Settings
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Invoice Settings */}
            <TabsContent value="invoice">
              <div className="space-y-6">
                {/* Branding & Logo */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-5 w-5 text-purple-600" />
                      <CardTitle>Invoice Branding</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoiceLogo">Invoice Logo URL</Label>
                        <Input
                          id="invoiceLogo"
                          value={companySettings.invoiceLogo || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              invoiceLogo: e.target.value || null,
                            }))
                          }
                          placeholder="https://example.com/invoice-logo.png"
                        />
                        <p className="text-xs text-gray-500">
                          Recommended size: 200x60px (PNG with transparent
                          background)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invoiceLogoPosition">
                          Logo Position
                        </Label>
                        <Select
                          value={companySettings.invoiceLogoPosition || "left"}
                          onValueChange={(value) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              invoiceLogoPosition: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank & Payment Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Landmark className="h-5 w-5 text-blue-600" />
                      <CardTitle>Payment Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountHolder">
                          Account Holder Name
                        </Label>
                        <Input
                          id="bankAccountHolder"
                          value={companySettings.bankAccountHolder || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              bankAccountHolder: e.target.value || null,
                            }))
                          }
                          placeholder="Numa Jewelry Pvt Ltd"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankUpiId">UPI ID</Label>
                        <Input
                          id="bankUpiId"
                          value={companySettings.bankUpiId || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              bankUpiId: e.target.value || null,
                            }))
                          }
                          placeholder="business@upi"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentQrCode">Payment QR Code URL</Label>
                      <Input
                        id="paymentQrCode"
                        value={companySettings.paymentQrCode || ""}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            paymentQrCode: e.target.value || null,
                          }))
                        }
                        placeholder="https://example.com/payment-qr.png"
                      />
                      <p className="text-xs text-gray-500">
                        Upload your UPI QR code image for customers to scan and
                        pay
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Signature & Authorization */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <CardTitle>Signature & Authorization</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signatoryName">
                          Authorized Signatory Name
                        </Label>
                        <Input
                          id="signatoryName"
                          value={companySettings.signatoryName || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              signatoryName: e.target.value || null,
                            }))
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signatoryDesignation">
                          Designation
                        </Label>
                        <Input
                          id="signatoryDesignation"
                          value={companySettings.signatoryDesignation || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              signatoryDesignation: e.target.value || null,
                            }))
                          }
                          placeholder="Managing Director"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="digitalSignature">
                          Digital Signature URL
                        </Label>
                        <Input
                          id="digitalSignature"
                          value={companySettings.digitalSignature || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              digitalSignature: e.target.value || null,
                            }))
                          }
                          placeholder="https://example.com/signature.png"
                        />
                        <p className="text-xs text-gray-500">
                          Transparent PNG recommended (150x80px)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companySeal">
                          Company Seal/Stamp URL
                        </Label>
                        <Input
                          id="companySeal"
                          value={companySettings.companySeal || ""}
                          onChange={(e) =>
                            setCompanySettings((prev) => ({
                              ...prev,
                              companySeal: e.target.value || null,
                            }))
                          }
                          placeholder="https://example.com/seal.png"
                        />
                        <p className="text-xs text-gray-500">
                          Circular stamp (100x100px PNG)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Terms & Conditions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <svg
                        className="h-5 w-5 text-orange-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <CardTitle>Additional Terms</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                      <Textarea
                        id="deliveryTerms"
                        value={companySettings.deliveryTerms || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            deliveryTerms: e.target.value || null,
                          }))
                        }
                        placeholder="Standard delivery within 7-10 business days"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="returnPolicy">
                        Return Policy (Summary)
                      </Label>
                      <Textarea
                        id="returnPolicy"
                        value={companySettings.returnPolicy || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            returnPolicy: e.target.value || null,
                          }))
                        }
                        placeholder="7-day return policy with prior authorization"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warrantyInfo">Warranty Information</Label>
                      <Textarea
                        id="warrantyInfo"
                        value={companySettings.warrantyInfo || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            warrantyInfo: e.target.value || null,
                          }))
                        }
                        placeholder="6 months warranty on manufacturing defects"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Configuration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-indigo-600" />
                      <CardTitle>Invoice Configuration</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDefaultDueDays">
                        Default Due Days
                      </Label>
                      <Input
                        id="invoiceDefaultDueDays"
                        type="number"
                        min="1"
                        max="365"
                        value={companySettings.invoiceDefaultDueDays || 30}
                        onChange={(e) =>
                          setCompanySettings((prev) => ({
                            ...prev,
                            invoiceDefaultDueDays:
                              parseInt(e.target.value) || 30,
                          }))
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Number of days until invoice payment is due (default:
                        30)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("company")}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <HeartLoader size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Invoice Settings
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* PhonePe Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">PhonePe</h3>
                        <p className="text-sm text-gray-600">
                          UPI payments via PhonePe gateway
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.phonePeEnabled}
                        onCheckedChange={(checked: boolean) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            phonePeEnabled: checked,
                          }))
                        }
                      />
                    </div>
                    {paymentSettings.phonePeEnabled && (
                      <div className="space-y-4 ml-6">
                        <div className="space-y-2">
                          <Label>Display Name</Label>
                          <Input
                            value={paymentSettings.phonePeDisplayName}
                            onChange={(e) =>
                              setPaymentSettings((prev) => ({
                                ...prev,
                                phonePeDisplayName: e.target.value,
                              }))
                            }
                            placeholder="PhonePe / UPI"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Merchant ID</Label>
                            <Input
                              value={paymentSettings.phonePeMerchantId}
                              onChange={(e) =>
                                setPaymentSettings((prev) => ({
                                  ...prev,
                                  phonePeMerchantId: e.target.value,
                                }))
                              }
                              placeholder="PGTESTPAYUAT"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Salt Key</Label>
                            <Input
                              type="password"
                              value={paymentSettings.phonePeSaltKey}
                              onChange={(e) =>
                                setPaymentSettings((prev) => ({
                                  ...prev,
                                  phonePeSaltKey: e.target.value,
                                }))
                              }
                              placeholder="•••••••••••••••"
                            />
                            <p className="text-xs text-gray-500">
                              Leave as dots (•••) to keep existing value
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Razorpay Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Razorpay</h3>
                        <p className="text-sm text-gray-600">
                          Cards, UPI, Wallets, and more via Razorpay
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.razorpayEnabled}
                        onCheckedChange={(checked: boolean) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            razorpayEnabled: checked,
                          }))
                        }
                      />
                    </div>
                    {paymentSettings.razorpayEnabled && (
                      <div className="space-y-4 ml-6">
                        <div className="space-y-2">
                          <Label>Display Name</Label>
                          <Input
                            value={paymentSettings.razorpayDisplayName}
                            onChange={(e) =>
                              setPaymentSettings((prev) => ({
                                ...prev,
                                razorpayDisplayName: e.target.value,
                              }))
                            }
                            placeholder="Cards / UPI / Wallets"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Key ID</Label>
                            <Input
                              value={paymentSettings.razorpayKeyId}
                              onChange={(e) =>
                                setPaymentSettings((prev) => ({
                                  ...prev,
                                  razorpayKeyId: e.target.value,
                                }))
                              }
                              placeholder="rzp_test_..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Key Secret</Label>
                            <Input
                              type="password"
                              value={paymentSettings.razorpayKeySecret}
                              onChange={(e) =>
                                setPaymentSettings((prev) => ({
                                  ...prev,
                                  razorpayKeySecret: e.target.value,
                                }))
                              }
                              placeholder="•••••••••••••••"
                            />
                            <p className="text-xs text-gray-500">
                              Leave as dots (•••) to keep existing value
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Stripe Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Stripe</h3>
                        <p className="text-sm text-gray-600">
                          International cards via Stripe (for global customers)
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.stripeEnabled}
                        onCheckedChange={(checked: boolean) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            stripeEnabled: checked,
                          }))
                        }
                      />
                    </div>
                    {paymentSettings.stripeEnabled && (
                      <div className="space-y-4 ml-6">
                        <div className="space-y-2">
                          <Label>Display Name</Label>
                          <Input
                            value={paymentSettings.stripeDisplayName}
                            onChange={(e) =>
                              setPaymentSettings((prev) => ({
                                ...prev,
                                stripeDisplayName: e.target.value,
                              }))
                            }
                            placeholder="Credit/Debit Card"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Publishable Key</Label>
                            <Input
                              value={paymentSettings.stripePublishableKey}
                              onChange={(e) =>
                                setPaymentSettings((prev) => ({
                                  ...prev,
                                  stripePublishableKey: e.target.value,
                                }))
                              }
                              placeholder="pk_test_..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Secret Key</Label>
                            <Input
                              type="password"
                              value={paymentSettings.stripeSecretKey}
                              onChange={(e) =>
                                setPaymentSettings((prev) => ({
                                  ...prev,
                                  stripeSecretKey: e.target.value,
                                }))
                              }
                              placeholder="•••••••••••••••"
                            />
                            <p className="text-xs text-gray-500">
                              Leave as dots (•••) to keep existing value
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Cash on Delivery Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          Cash on Delivery (COD)
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pay at the time of delivery
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.codEnabled}
                        onCheckedChange={(checked: boolean) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            codEnabled: checked,
                          }))
                        }
                      />
                    </div>
                    {paymentSettings.codEnabled && (
                      <div className="space-y-4 ml-6">
                        <div className="space-y-2">
                          <Label>Display Name</Label>
                          <Input
                            value={paymentSettings.codDisplayName}
                            onChange={(e) =>
                              setPaymentSettings((prev) => ({
                                ...prev,
                                codDisplayName: e.target.value,
                              }))
                            }
                            placeholder="Cash on Delivery"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Instructions</Label>
                          <Textarea
                            value={paymentSettings.codInstructions}
                            onChange={(e) =>
                              setPaymentSettings((prev) => ({
                                ...prev,
                                codInstructions: e.target.value,
                              }))
                            }
                            placeholder="Pay when you receive your order"
                            rows={2}
                          />
                          <p className="text-xs text-gray-500">
                            This message will be shown to customers
                          </p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>Note:</strong> COD charges (₹
                            {shippingSettings.codCharges}) can be configured in
                            the Shipping tab.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Minimum Order Amount (₹)</Label>
                    <Input
                      type="number"
                      value={paymentSettings.minOrderAmount}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          minOrderAmount: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                    />
                  </div>

                  <Button onClick={() => handleSave("payments")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Shipping Settings */}
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Configuration
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Configure shipping rates, options, and manual fulfillment
                    settings
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Basic Shipping Rates */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Shipping Rates
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="standardRate">
                          Standard Shipping Rate (₹)
                        </Label>
                        <Input
                          id="standardRate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingSettings.standardRate}
                          onChange={(e) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              standardRate: Number(e.target.value),
                            }))
                          }
                          placeholder="50.00"
                        />
                        <p className="text-xs text-gray-500">
                          Fixed rate for standard delivery (5-7 business days)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expeditedRate">
                          Express Shipping Rate (₹)
                        </Label>
                        <Input
                          id="expeditedRate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingSettings.expeditedRate}
                          onChange={(e) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              expeditedRate: Number(e.target.value),
                            }))
                          }
                          placeholder="150.00"
                        />
                        <p className="text-xs text-gray-500">
                          Rate for express delivery (2-3 business days)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Free Shipping Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Free Shipping
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="freeShippingThreshold">
                          Free Shipping Threshold (₹)
                        </Label>
                        <Input
                          id="freeShippingThreshold"
                          type="number"
                          min="0"
                          value={shippingSettings.freeShippingThreshold}
                          onChange={(e) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              freeShippingThreshold: Number(e.target.value),
                            }))
                          }
                          placeholder="500"
                        />
                        <p className="text-xs text-gray-500">
                          Orders above this amount qualify for free shipping
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="freeShippingMethod">
                          Free Shipping Method
                        </Label>
                        <Select
                          value={
                            shippingSettings.freeShippingMethod || "standard"
                          }
                          onValueChange={(value) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              freeShippingMethod: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">
                              Standard Shipping
                            </SelectItem>
                            <SelectItem value="express">
                              Express Shipping
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Which shipping method to apply for free shipping
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Services */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Additional Services
                    </h3>

                    <div className="space-y-6">
                      {/* Same Day Delivery */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <Label>Same Day Delivery</Label>
                          <p className="text-sm text-gray-600">
                            Enable same day delivery for local orders (manual
                            fulfillment)
                          </p>
                        </div>
                        <Switch
                          checked={shippingSettings.sameDay}
                          onCheckedChange={(checked: boolean) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              sameDay: checked,
                            }))
                          }
                        />
                      </div>

                      {shippingSettings.sameDay && (
                        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sameDayRate">
                              Same Day Rate (₹)
                            </Label>
                            <Input
                              id="sameDayRate"
                              type="number"
                              min="0"
                              step="0.01"
                              value={shippingSettings.sameDayRate}
                              onChange={(e) =>
                                setShippingSettings((prev) => ({
                                  ...prev,
                                  sameDayRate: Number(e.target.value),
                                }))
                              }
                              placeholder="300.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sameDayMinOrder">
                              Minimum Order (₹)
                            </Label>
                            <Input
                              id="sameDayMinOrder"
                              type="number"
                              min="0"
                              value={shippingSettings.sameDayMinOrder || 0}
                              onChange={(e) =>
                                setShippingSettings((prev) => ({
                                  ...prev,
                                  sameDayMinOrder: Number(e.target.value),
                                }))
                              }
                              placeholder="1000"
                            />
                          </div>
                        </div>
                      )}

                      {/* Cash on Delivery */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <Label>Cash on Delivery (COD)</Label>
                          <p className="text-sm text-gray-600">
                            Allow customers to pay upon delivery
                          </p>
                        </div>
                        <Switch
                          checked={shippingSettings.codEnabled}
                          onCheckedChange={(checked: boolean) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              codEnabled: checked,
                            }))
                          }
                        />
                      </div>

                      {shippingSettings.codEnabled && (
                        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="codCharges">COD Charges (₹)</Label>
                            <Input
                              id="codCharges"
                              type="number"
                              min="0"
                              step="0.01"
                              value={shippingSettings.codCharges}
                              onChange={(e) =>
                                setShippingSettings((prev) => ({
                                  ...prev,
                                  codCharges: Number(e.target.value),
                                }))
                              }
                              placeholder="25.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="codMaxAmount">
                              COD Max Amount (₹)
                            </Label>
                            <Input
                              id="codMaxAmount"
                              type="number"
                              min="0"
                              value={shippingSettings.codMaxAmount || 10000}
                              onChange={(e) =>
                                setShippingSettings((prev) => ({
                                  ...prev,
                                  codMaxAmount: Number(e.target.value),
                                }))
                              }
                              placeholder="10000"
                            />
                          </div>
                        </div>
                      )}

                      {/* International Shipping */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <Label>International Shipping</Label>
                          <p className="text-sm text-gray-600">
                            Enable shipping to international locations (manual
                            processing)
                          </p>
                        </div>
                        <Switch
                          checked={shippingSettings.internationalShipping}
                          onCheckedChange={(checked: boolean) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              internationalShipping: checked,
                            }))
                          }
                        />
                      </div>

                      {shippingSettings.internationalShipping && (
                        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="internationalRate">
                              International Rate (₹)
                            </Label>
                            <Input
                              id="internationalRate"
                              type="number"
                              min="0"
                              step="0.01"
                              value={shippingSettings.internationalRate || 0}
                              onChange={(e) =>
                                setShippingSettings((prev) => ({
                                  ...prev,
                                  internationalRate: Number(e.target.value),
                                }))
                              }
                              placeholder="500.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="internationalProcessingTime">
                              Processing Time (days)
                            </Label>
                            <Input
                              id="internationalProcessingTime"
                              type="number"
                              min="1"
                              value={
                                shippingSettings.internationalProcessingTime ||
                                7
                              }
                              onChange={(e) =>
                                setShippingSettings((prev) => ({
                                  ...prev,
                                  internationalProcessingTime: Number(
                                    e.target.value
                                  ),
                                }))
                              }
                              placeholder="7"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Fulfillment Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Manual Fulfillment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="defaultProcessingTime">
                          Default Processing Time (days)
                        </Label>
                        <Input
                          id="defaultProcessingTime"
                          type="number"
                          min="1"
                          max="30"
                          value={shippingSettings.defaultProcessingTime || 2}
                          onChange={(e) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              defaultProcessingTime: Number(e.target.value),
                            }))
                          }
                          placeholder="2"
                        />
                        <p className="text-xs text-gray-500">
                          Time to process orders before shipping
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trackingEmailTemplate">
                          Tracking Email Template
                        </Label>
                        <Select
                          value={
                            shippingSettings.trackingEmailTemplate || "default"
                          }
                          onValueChange={(value) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              trackingEmailTemplate: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              Default Template
                            </SelectItem>
                            <SelectItem value="detailed">
                              Detailed Template
                            </SelectItem>
                            <SelectItem value="minimal">
                              Minimal Template
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Email template for tracking notifications
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-send Tracking Emails</Label>
                          <p className="text-sm text-gray-600">
                            Automatically email tracking info when order status
                            changes
                          </p>
                        </div>
                        <Switch
                          checked={shippingSettings.autoTrackingEmails ?? true}
                          onCheckedChange={(checked: boolean) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              autoTrackingEmails: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Send SMS updates for shipping milestones
                          </p>
                        </div>
                        <Switch
                          checked={shippingSettings.smsNotifications ?? false}
                          onCheckedChange={(checked: boolean) =>
                            setShippingSettings((prev) => ({
                              ...prev,
                              smsNotifications: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSave("shipping")}
                    disabled={loading}
                    className="w-full md:w-auto"
                  >
                    {loading ? (
                      <HeartLoader size="sm" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Shipping Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Order Notifications</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Order Confirmation</Label>
                          <p className="text-sm text-gray-600">
                            Send confirmation when order is placed
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.orderConfirmation}
                          onCheckedChange={(checked: boolean) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              orderConfirmation: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Order Shipped</Label>
                          <p className="text-sm text-gray-600">
                            Notify when order is shipped
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.orderShipped}
                          onCheckedChange={(checked: boolean) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              orderShipped: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Order Delivered</Label>
                          <p className="text-sm text-gray-600">
                            Notify when order is delivered
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.orderDelivered}
                          onCheckedChange={(checked: boolean) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              orderDelivered: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Inventory Notifications
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Low Stock Alerts</Label>
                        <p className="text-sm text-gray-600">
                          Alert when product stock is low
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.lowStock}
                        onCheckedChange={(checked: boolean) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            lowStock: checked,
                          }))
                        }
                      />
                    </div>

                    {notificationSettings.lowStock && (
                      <div className="space-y-2">
                        <Label htmlFor="stockThreshold">Stock Threshold</Label>
                        <Input
                          id="stockThreshold"
                          type="number"
                          value={notificationSettings.stockThreshold}
                          onChange={(e) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              stockThreshold: Number(e.target.value),
                            }))
                          }
                          placeholder="Alert when stock falls below this number"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notification Channels
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Send notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked: boolean) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              emailNotifications: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Send notifications via SMS
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked: boolean) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              smsNotifications: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Send push notifications to mobile app
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked: boolean) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              pushNotifications: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave("notifications")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Authentication</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">
                          Require 2FA for admin accounts
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked: boolean) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            twoFactorAuth: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">
                          Session Timeout (minutes)
                        </Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) =>
                            setSecuritySettings((prev) => ({
                              ...prev,
                              sessionTimeout: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loginAttempts">
                          Max Login Attempts
                        </Label>
                        <Input
                          id="loginAttempts"
                          type="number"
                          value={securitySettings.loginAttempts}
                          onChange={(e) =>
                            setSecuritySettings((prev) => ({
                              ...prev,
                              loginAttempts: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password Policy</h3>

                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">
                        Minimum Password Length
                      </Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            passwordMinLength: Number(e.target.value),
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Special Characters</Label>
                        <p className="text-sm text-gray-600">
                          Passwords must include special characters
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.requireSpecialChars}
                        onCheckedChange={(checked: boolean) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            requireSpecialChars: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Access Control</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>IP Whitelist</Label>
                        <p className="text-sm text-gray-600">
                          Restrict admin access to specific IPs
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.ipWhitelist}
                        onCheckedChange={(checked: boolean) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            ipWhitelist: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiRateLimit">
                        API Rate Limit (requests/hour)
                      </Label>
                      <Input
                        id="apiRateLimit"
                        type="number"
                        value={securitySettings.apiRateLimit}
                        onChange={(e) =>
                          setSecuritySettings((prev) => ({
                            ...prev,
                            apiRateLimit: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("security")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Meta Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        value={seoSettings.metaTitle}
                        onChange={(e) =>
                          setSeoSettings((prev) => ({
                            ...prev,
                            metaTitle: e.target.value,
                          }))
                        }
                        placeholder="Default meta title for pages"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={seoSettings.metaDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setSeoSettings((prev) => ({
                            ...prev,
                            metaDescription: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Default meta description for pages"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <Input
                        id="metaKeywords"
                        value={seoSettings.metaKeywords}
                        onChange={(e) =>
                          setSeoSettings((prev) => ({
                            ...prev,
                            metaKeywords: e.target.value,
                          }))
                        }
                        placeholder="Comma-separated keywords"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Search Engine Features
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Generate Sitemap</Label>
                          <p className="text-sm text-gray-600">
                            Automatically generate XML sitemap
                          </p>
                        </div>
                        <Switch
                          checked={seoSettings.sitemap}
                          onCheckedChange={(checked: boolean) =>
                            setSeoSettings((prev) => ({
                              ...prev,
                              sitemap: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Robots.txt</Label>
                          <p className="text-sm text-gray-600">
                            Generate robots.txt file
                          </p>
                        </div>
                        <Switch
                          checked={seoSettings.robotsTxt}
                          onCheckedChange={(checked: boolean) =>
                            setSeoSettings((prev) => ({
                              ...prev,
                              robotsTxt: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Structured Data</Label>
                          <p className="text-sm text-gray-600">
                            Add JSON-LD structured data
                          </p>
                        </div>
                        <Switch
                          checked={seoSettings.structuredData}
                          onCheckedChange={(checked: boolean) =>
                            setSeoSettings((prev) => ({
                              ...prev,
                              structuredData: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Analytics</h3>

                    <div className="space-y-2">
                      <Label htmlFor="analyticsId">Google Analytics ID</Label>
                      <Input
                        id="analyticsId"
                        value={seoSettings.analyticsId}
                        onChange={(e) =>
                          setSeoSettings((prev) => ({
                            ...prev,
                            analyticsId: e.target.value,
                          }))
                        }
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave("seo")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AdminLayout>
  );
}
