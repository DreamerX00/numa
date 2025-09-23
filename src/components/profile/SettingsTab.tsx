import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Palette, 
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Sun,
  Moon,
  Laptop
} from "lucide-react";
import { useUpdateAccountSettings } from "@/hooks/useApi";
import { toast } from "sonner";

interface AccountSettings {
  language?: string;
  currency?: string;
  timezone?: string;
  theme?: string;
  dateFormat?: string;
  autoSaveCart?: boolean;
  showRecommendations?: boolean;
}

interface SettingsTabProps {
  accountSettings?: AccountSettings;
  isLoading?: boolean;
}

export function SettingsTab({ accountSettings, isLoading = false }: SettingsTabProps) {
  const [settings, setSettings] = useState<AccountSettings>({
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    theme: 'system',
    dateFormat: 'DD/MM/YYYY',
    autoSaveCart: true,
    showRecommendations: true,
    ...accountSettings
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const updateSettingsMutation = useUpdateAccountSettings();

  const handleSettingChange = (key: keyof AccountSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync(settings);
      toast.success("Settings updated successfully!");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // In a real app, this would call an API to export user data
      toast.success("Data export request submitted! You'll receive an email when ready.");
      setIsExportDialogOpen(false);
    } catch {
      toast.error("Failed to request data export");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, this would call an API to delete the account
      toast.success("Account deletion request submitted");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete account");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading account settings...</p>
        </CardContent>
      </Card>
    );
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  ];

  const currencies = [
    { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  ];

  const timezones = [
    { code: 'Asia/Kolkata', name: 'India Standard Time (IST)' },
    { code: 'America/New_York', name: 'Eastern Time (ET)' },
    { code: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
    { code: 'Europe/London', name: 'Greenwich Mean Time (GMT)' },
    { code: 'Europe/Paris', name: 'Central European Time (CET)' },
    { code: 'Asia/Tokyo', name: 'Japan Standard Time (JST)' },
    { code: 'Australia/Sydney', name: 'Australian Eastern Time (AET)' },
  ];

  const themes = [
    { code: 'light', name: 'Light', icon: Sun },
    { code: 'dark', name: 'Dark', icon: Moon },
    { code: 'system', name: 'System', icon: Laptop },
  ];

  const dateFormats = [
    { code: 'DD/MM/YYYY', name: 'DD/MM/YYYY (31/12/2023)' },
    { code: 'MM/DD/YYYY', name: 'MM/DD/YYYY (12/31/2023)' },
    { code: 'YYYY-MM-DD', name: 'YYYY-MM-DD (2023-12-31)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
          <p className="text-muted-foreground">
            Customize your account preferences and regional settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand" />
            Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => handleSettingChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleSettingChange('timezone', value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((timezone) => (
                    <SelectItem key={timezone.code} value={timezone.code}>
                      {timezone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => handleSettingChange('dateFormat', value)}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.code} value={format.code}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <Card 
                    key={theme.code}
                    className={`cursor-pointer transition-all ${
                      settings.theme === theme.code 
                        ? 'ring-2 ring-brand bg-brand/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSettingChange('theme', theme.code)}
                  >
                    <CardContent className="p-4 text-center">
                      <theme.icon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">{theme.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-brand" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSaveCart" className="font-medium">Auto-save Cart</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save items in your cart across devices
              </p>
            </div>
            <Switch
              id="autoSaveCart"
              checked={settings.autoSaveCart}
              onCheckedChange={(checked) => handleSettingChange('autoSaveCart', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showRecommendations" className="font-medium">Product Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Show personalized product suggestions based on your preferences
              </p>
            </div>
            <Switch
              id="showRecommendations"
              checked={settings.showRecommendations}
              onCheckedChange={(checked) => handleSettingChange('showRecommendations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-brand" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a copy of your personal data and order history
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
            <div>
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              We&apos;ll prepare a download link with all your personal data, order history, and preferences. 
              This may take a few minutes to process.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">What&apos;s included:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personal profile information</li>
                <li>• Order history and receipts</li>
                <li>• Saved addresses</li>
                <li>• Wishlist items</li>
                <li>• Loyalty program data</li>
                <li>• Notification preferences</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Request Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account 
              and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-900 mb-2">This will delete:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Your profile and personal information</li>
                <li>• Order history (you may want to export this first)</li>
                <li>• Saved addresses and payment methods</li>
                <li>• Wishlist and preferences</li>
                <li>• Loyalty points and tier status</li>
              </ul>
            </div>

            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> If you have pending orders or returns, 
                please wait for them to complete before deleting your account.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}