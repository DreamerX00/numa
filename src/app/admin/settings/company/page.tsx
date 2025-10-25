"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Building2,
  Phone,
  Mail,
  Globe,
  Receipt,
  Landmark,
} from "lucide-react";

interface CompanySettings {
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

  // Logo
  companyLogo?: string | null;

  // Bank Details
  bankName?: string | null;
  bankAccount?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
}

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings/company");
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      } else {
        toast.error(result.error || "Failed to load settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load company settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Company settings updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save company settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    field: keyof CompanySettings,
    value: string | number | null
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage company information used in invoices and communications
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle>Company Information</CardTitle>
          </div>
          <CardDescription>
            Basic company details displayed on invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Numa Jewelry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyCountry">Country *</Label>
              <Input
                id="companyCountry"
                value={settings.companyCountry}
                onChange={(e) => handleChange("companyCountry", e.target.value)}
                placeholder="India"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address *</Label>
            <Input
              id="companyAddress"
              value={settings.companyAddress}
              onChange={(e) => handleChange("companyAddress", e.target.value)}
              placeholder="123 Business Street"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyCity">City *</Label>
              <Input
                id="companyCity"
                value={settings.companyCity}
                onChange={(e) => handleChange("companyCity", e.target.value)}
                placeholder="Mumbai"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyState">State *</Label>
              <Input
                id="companyState"
                value={settings.companyState}
                onChange={(e) => handleChange("companyState", e.target.value)}
                placeholder="MAHARASHTRA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyZipCode">ZIP Code *</Label>
              <Input
                id="companyZipCode"
                value={settings.companyZipCode}
                onChange={(e) => handleChange("companyZipCode", e.target.value)}
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
          <CardDescription>
            Contact details for customer communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone *</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <Input
                  id="companyPhone"
                  value={settings.companyPhone}
                  onChange={(e) => handleChange("companyPhone", e.target.value)}
                  placeholder="+91-9876543210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email *</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleChange("companyEmail", e.target.value)}
                  placeholder="contact@numa.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Website *</Label>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <Input
                id="companyWebsite"
                value={settings.companyWebsite}
                onChange={(e) => handleChange("companyWebsite", e.target.value)}
                placeholder="www.numa.com"
              />
            </div>
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
          <CardDescription>GST and tax details for invoicing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN *</Label>
              <Input
                id="gstin"
                value={settings.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
                placeholder="27ABCDE1234F1Z5"
                maxLength={15}
              />
              <p className="text-xs text-gray-500">15 characters GST number</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN (Optional)</Label>
              <Input
                id="pan"
                value={settings.pan || ""}
                onChange={(e) => handleChange("pan", e.target.value || null)}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              <p className="text-xs text-gray-500">10 characters PAN number</p>
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
              value={settings.gstRate}
              onChange={(e) =>
                handleChange("gstRate", parseFloat(e.target.value))
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
          <CardDescription>
            Configure invoice generation preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Prefix *</Label>
            <Input
              id="invoicePrefix"
              value={settings.invoicePrefix}
              onChange={(e) => handleChange("invoicePrefix", e.target.value)}
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
              value={settings.invoiceTerms}
              onChange={(e) => handleChange("invoiceTerms", e.target.value)}
              placeholder="Payment is due within 30 days of invoice date"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNotes">Invoice Notes (Optional)</Label>
            <Textarea
              id="invoiceNotes"
              value={settings.invoiceNotes || ""}
              onChange={(e) =>
                handleChange("invoiceNotes", e.target.value || null)
              }
              placeholder="Additional notes to appear on invoices"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo URL (Optional)</Label>
            <Input
              id="companyLogo"
              value={settings.companyLogo || ""}
              onChange={(e) =>
                handleChange("companyLogo", e.target.value || null)
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
          <CardDescription>
            Bank information for payment instructions (all optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={settings.bankName || ""}
                onChange={(e) =>
                  handleChange("bankName", e.target.value || null)
                }
                placeholder="State Bank of India"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankBranch">Branch</Label>
              <Input
                id="bankBranch"
                value={settings.bankBranch || ""}
                onChange={(e) =>
                  handleChange("bankBranch", e.target.value || null)
                }
                placeholder="Mumbai Main Branch"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Account Number</Label>
              <Input
                id="bankAccount"
                value={settings.bankAccount || ""}
                onChange={(e) =>
                  handleChange("bankAccount", e.target.value || null)
                }
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankIfsc">IFSC Code</Label>
              <Input
                id="bankIfsc"
                value={settings.bankIfsc || ""}
                onChange={(e) =>
                  handleChange("bankIfsc", e.target.value || null)
                }
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
