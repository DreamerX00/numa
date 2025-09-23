import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Package,
  Heart,
  Tag,
  Gift,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useUpdateNotificationSettings } from "@/hooks/useApi";
import { toast } from "sonner";

interface NotificationSettings {
  emailMarketing?: boolean;
  smsMarketing?: boolean;
  pushNotifications?: boolean;
  orderUpdates?: boolean;
  promotionalOffers?: boolean;
  productRecommendations?: boolean;
  priceDropAlerts?: boolean;
  restockNotifications?: boolean;
  reviewReminders?: boolean;
  loyaltyProgram?: boolean;
}

interface NotificationsTabProps {
  notificationSettings?: NotificationSettings;
  isLoading?: boolean;
}

export function NotificationsTab({ notificationSettings, isLoading = false }: NotificationsTabProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailMarketing: false,
    smsMarketing: false,
    pushNotifications: true,
    orderUpdates: true,
    promotionalOffers: false,
    productRecommendations: false,
    priceDropAlerts: false,
    restockNotifications: false,
    reviewReminders: true,
    loyaltyProgram: true,
    ...notificationSettings
  });

  const [isSaving, setIsSaving] = useState(false);
  const updateNotificationMutation = useUpdateNotificationSettings();

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNotificationMutation.mutateAsync(settings);
      toast.success("Notification preferences updated successfully!");
    } catch {
      toast.error("Failed to update notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notification settings...</p>
        </CardContent>
      </Card>
    );
  }

  const notificationSections = [
    {
      title: "Order & Account Updates",
      description: "Important notifications about your orders and account",
      icon: Package,
      settings: [
        {
          key: "orderUpdates" as keyof NotificationSettings,
          title: "Order Updates",
          description: "Order confirmations, shipping updates, and delivery notifications",
          required: true
        },
        {
          key: "reviewReminders" as keyof NotificationSettings,
          title: "Review Reminders",
          description: "Reminders to review products you've purchased"
        }
      ]
    },
    {
      title: "Marketing & Promotions",
      description: "Stay updated with our latest offers and collections",
      icon: Tag,
      settings: [
        {
          key: "emailMarketing" as keyof NotificationSettings,
          title: "Email Marketing",
          description: "Newsletter, new collections, and exclusive offers via email"
        },
        {
          key: "smsMarketing" as keyof NotificationSettings,
          title: "SMS Marketing",
          description: "Flash sales and urgent promotions via SMS"
        },
        {
          key: "promotionalOffers" as keyof NotificationSettings,
          title: "Promotional Offers",
          description: "Special discounts and limited-time offers"
        }
      ]
    },
    {
      title: "Product Alerts",
      description: "Get notified about products you're interested in",
      icon: Heart,
      settings: [
        {
          key: "priceDropAlerts" as keyof NotificationSettings,
          title: "Price Drop Alerts",
          description: "When items in your wishlist go on sale"
        },
        {
          key: "restockNotifications" as keyof NotificationSettings,
          title: "Restock Notifications",
          description: "When out-of-stock items become available again"
        },
        {
          key: "productRecommendations" as keyof NotificationSettings,
          title: "Product Recommendations",
          description: "Personalized product suggestions based on your preferences"
        }
      ]
    },
    {
      title: "Loyalty Program",
      description: "Updates about your rewards and tier status",
      icon: Gift,
      settings: [
        {
          key: "loyaltyProgram" as keyof NotificationSettings,
          title: "Loyalty Program Updates",
          description: "Points earned, tier changes, and exclusive member benefits"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
          <p className="text-muted-foreground">
            Choose how you&apos;d like to receive notifications from us
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
              Save Preferences
            </>
          )}
        </Button>
      </div>

      {/* Notification Channels Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Mail className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Detailed updates and newsletters
              </p>
              <Switch
                checked={settings.emailMarketing}
                onCheckedChange={() => handleToggle('emailMarketing')}
              />
            </div>

            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">SMS</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Quick updates and urgent notifications
              </p>
              <Switch
                checked={settings.smsMarketing}
                onCheckedChange={() => handleToggle('smsMarketing')}
              />
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold mb-2">Push</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Instant notifications on your device
              </p>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Notification Settings */}
      <div className="space-y-6">
        {notificationSections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-brand" />
                {section.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.settings.map((setting, settingIndex) => (
                <div key={settingIndex}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={setting.key} className="font-medium">
                          {setting.title}
                        </Label>
                        {setting.required && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      id={setting.key}
                      checked={settings[setting.key] ?? false}
                      onCheckedChange={() => handleToggle(setting.key)}
                      disabled={setting.required}
                    />
                  </div>
                  {settingIndex < section.settings.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  emailMarketing: true,
                  promotionalOffers: true,
                  productRecommendations: true,
                  priceDropAlerts: true,
                  restockNotifications: true,
                  loyaltyProgram: true
                }));
              }}
            >
              Enable All Marketing
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  emailMarketing: false,
                  smsMarketing: false,
                  promotionalOffers: false,
                  productRecommendations: false,
                  priceDropAlerts: false,
                  restockNotifications: false
                }));
              }}
            >
              Disable All Marketing
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setSettings({
                  orderUpdates: true,
                  reviewReminders: true,
                  loyaltyProgram: true,
                  emailMarketing: false,
                  smsMarketing: false,
                  pushNotifications: true,
                  promotionalOffers: false,
                  productRecommendations: false,
                  priceDropAlerts: false,
                  restockNotifications: false
                });
              }}
            >
              Essential Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Privacy & Preferences</h4>
              <p className="text-sm text-blue-800">
                We respect your privacy and will only send you notifications you&apos;ve opted in to receive. 
                You can change these preferences at any time. Some notifications (like order updates) 
                are required for account functionality and cannot be disabled.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}