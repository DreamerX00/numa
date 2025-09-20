"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Loader2
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Numa Store',
    siteDescription: 'Your premium e-commerce platform',
    supportEmail: 'support@numa.com',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    maintenanceMode: false,
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 500,
    standardRate: 50,
    expeditedRate: 150,
    sameDay: false,
    sameDayRate: 300,
    internationalShipping: false,
    codEnabled: true,
    codCharges: 25,
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
    metaTitle: 'Numa Store - Premium Products Online',
    metaDescription: 'Discover premium products at Numa Store. Quality guaranteed.',
    metaKeywords: 'ecommerce, premium, products, online shopping',
    sitemap: true,
    robotsTxt: true,
    structuredData: true,
    analyticsId: 'G-XXXXXXXXXX',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    razorpayEnabled: true,
    razorpayKeyId: 'rzp_test_1234567890',
    razorpaySecret: '•••••••••••••••',
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    minOrderAmount: 100,
  });

  // Load settings from API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        // Update state with loaded settings
        if (data.settings.general) {
          setGeneralSettings(prev => ({ ...prev, ...data.settings.general }));
        }
        if (data.settings.payments) {
          setPaymentSettings(prev => ({ ...prev, ...data.settings.payments }));
        }
        if (data.settings.shipping) {
          setShippingSettings(prev => ({ ...prev, ...data.settings.shipping }));
        }
        if (data.settings.notifications) {
          setNotificationSettings(prev => ({ ...prev, ...data.settings.notifications }));
        }
        if (data.settings.security) {
          setSecuritySettings(prev => ({ ...prev, ...data.settings.security }));
        }
        if (data.settings.seo) {
          setSeoSettings(prev => ({ ...prev, ...data.settings.seo }));
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    try {
      setLoading(true);
      
      let settingsData;
      switch (section) {
        case 'general':
          settingsData = generalSettings;
          break;
        case 'payments':
          settingsData = paymentSettings;
          break;
        case 'shipping':
          settingsData = shippingSettings;
          break;
        case 'notifications':
          settingsData = notificationSettings;
          break;
        case 'security':
          settingsData = securitySettings;
          break;
        case 'seo':
          settingsData = seoSettings;
          break;
        default:
          throw new Error('Invalid section');
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: section,
          settings: settingsData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSavedMessage('Settings saved successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSavedMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSavedMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {initialLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage system configuration and preferences</p>
          </div>
          {savedMessage && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{savedMessage}</span>
            </div>
          )}
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Shipping</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
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
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={generalSettings.timezone} 
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={generalSettings.currency} 
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}
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
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}
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
                    <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked: boolean) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>

                <Button onClick={() => handleSave('general')} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
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
                {/* Razorpay Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Razorpay</h3>
                      <p className="text-sm text-gray-600">Configure Razorpay payment gateway</p>
                    </div>
                    <Switch
                      checked={paymentSettings.razorpayEnabled}
                      onCheckedChange={(checked: boolean) => setPaymentSettings(prev => ({ ...prev, razorpayEnabled: checked }))}
                    />
                  </div>
                  {paymentSettings.razorpayEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label>Key ID</Label>
                        <Input
                          value={paymentSettings.razorpayKeyId}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                          placeholder="rzp_test_..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <Input
                          type="password"
                          value={paymentSettings.razorpaySecret}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, razorpaySecret: e.target.value }))}
                          placeholder="•••••••••••••••"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Stripe Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Stripe</h3>
                      <p className="text-sm text-gray-600">Configure Stripe payment gateway</p>
                    </div>
                    <Switch
                      checked={paymentSettings.stripeEnabled}
                      onCheckedChange={(checked: boolean) => setPaymentSettings(prev => ({ ...prev, stripeEnabled: checked }))}
                    />
                  </div>
                  {paymentSettings.stripeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label>Publishable Key</Label>
                        <Input
                          value={paymentSettings.stripePublishableKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                          placeholder="pk_test_..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <Input
                          type="password"
                          value={paymentSettings.stripeSecretKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                          placeholder="sk_test_..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Minimum Order Amount</Label>
                  <Input
                    type="number"
                    value={paymentSettings.minOrderAmount}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <Button onClick={() => handleSave('payments')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Settings (Simplified placeholders) */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      value={shippingSettings.freeShippingThreshold}
                      onChange={(e) => setShippingSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="standardRate">Standard Shipping Rate (₹)</Label>
                    <Input
                      id="standardRate"
                      type="number"
                      value={shippingSettings.standardRate}
                      onChange={(e) => setShippingSettings(prev => ({ ...prev, standardRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expeditedRate">Expedited Shipping Rate (₹)</Label>
                    <Input
                      id="expeditedRate"
                      type="number"
                      value={shippingSettings.expeditedRate}
                      onChange={(e) => setShippingSettings(prev => ({ ...prev, expeditedRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codCharges">COD Charges (₹)</Label>
                    <Input
                      id="codCharges"
                      type="number"
                      value={shippingSettings.codCharges}
                      onChange={(e) => setShippingSettings(prev => ({ ...prev, codCharges: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Same Day Delivery</Label>
                      <p className="text-sm text-gray-600">Enable same day delivery for local orders</p>
                    </div>
                    <Switch
                      checked={shippingSettings.sameDay}
                      onCheckedChange={(checked: boolean) => setShippingSettings(prev => ({ ...prev, sameDay: checked }))}
                    />
                  </div>
                  
                  {shippingSettings.sameDay && (
                    <div className="space-y-2">
                      <Label htmlFor="sameDayRate">Same Day Delivery Rate (₹)</Label>
                      <Input
                        id="sameDayRate"
                        type="number"
                        value={shippingSettings.sameDayRate}
                        onChange={(e) => setShippingSettings(prev => ({ ...prev, sameDayRate: Number(e.target.value) }))}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>International Shipping</Label>
                      <p className="text-sm text-gray-600">Enable shipping to international locations</p>
                    </div>
                    <Switch
                      checked={shippingSettings.internationalShipping}
                      onCheckedChange={(checked: boolean) => setShippingSettings(prev => ({ ...prev, internationalShipping: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cash on Delivery</Label>
                      <p className="text-sm text-gray-600">Allow customers to pay on delivery</p>
                    </div>
                    <Switch
                      checked={shippingSettings.codEnabled}
                      onCheckedChange={(checked: boolean) => setShippingSettings(prev => ({ ...prev, codEnabled: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('shipping')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
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
                        <p className="text-sm text-gray-600">Send confirmation when order is placed</p>
                      </div>
                      <Switch
                        checked={notificationSettings.orderConfirmation}
                        onCheckedChange={(checked: boolean) => setNotificationSettings(prev => ({ ...prev, orderConfirmation: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Order Shipped</Label>
                        <p className="text-sm text-gray-600">Notify when order is shipped</p>
                      </div>
                      <Switch
                        checked={notificationSettings.orderShipped}
                        onCheckedChange={(checked: boolean) => setNotificationSettings(prev => ({ ...prev, orderShipped: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Order Delivered</Label>
                        <p className="text-sm text-gray-600">Notify when order is delivered</p>
                      </div>
                      <Switch
                        checked={notificationSettings.orderDelivered}
                        onCheckedChange={(checked: boolean) => setNotificationSettings(prev => ({ ...prev, orderDelivered: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Inventory Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-gray-600">Alert when product stock is low</p>
                    </div>
                    <Switch
                      checked={notificationSettings.lowStock}
                      onCheckedChange={(checked: boolean) => setNotificationSettings(prev => ({ ...prev, lowStock: checked }))}
                    />
                  </div>

                  {notificationSettings.lowStock && (
                    <div className="space-y-2">
                      <Label htmlFor="stockThreshold">Stock Threshold</Label>
                      <Input
                        id="stockThreshold"
                        type="number"
                        value={notificationSettings.stockThreshold}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, stockThreshold: Number(e.target.value) }))}
                        placeholder="Alert when stock falls below this number"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked: boolean) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Send notifications via SMS</p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked: boolean) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-gray-600">Send push notifications to mobile app</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked: boolean) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave('notifications')}>
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
                      <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked: boolean) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password Policy</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Special Characters</Label>
                      <p className="text-sm text-gray-600">Passwords must include special characters</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(checked: boolean) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Access Control</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP Whitelist</Label>
                      <p className="text-sm text-gray-600">Restrict admin access to specific IPs</p>
                    </div>
                    <Switch
                      checked={securitySettings.ipWhitelist}
                      onCheckedChange={(checked: boolean) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={securitySettings.apiRateLimit}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, apiRateLimit: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('security')}>
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
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Default meta title for pages"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={seoSettings.metaDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSeoSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                      rows={3}
                      placeholder="Default meta description for pages"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={seoSettings.metaKeywords}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                      placeholder="Comma-separated keywords"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Search Engine Features</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Generate Sitemap</Label>
                        <p className="text-sm text-gray-600">Automatically generate XML sitemap</p>
                      </div>
                      <Switch
                        checked={seoSettings.sitemap}
                        onCheckedChange={(checked: boolean) => setSeoSettings(prev => ({ ...prev, sitemap: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Robots.txt</Label>
                        <p className="text-sm text-gray-600">Generate robots.txt file</p>
                      </div>
                      <Switch
                        checked={seoSettings.robotsTxt}
                        onCheckedChange={(checked: boolean) => setSeoSettings(prev => ({ ...prev, robotsTxt: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Structured Data</Label>
                        <p className="text-sm text-gray-600">Add JSON-LD structured data</p>
                      </div>
                      <Switch
                        checked={seoSettings.structuredData}
                        onCheckedChange={(checked: boolean) => setSeoSettings(prev => ({ ...prev, structuredData: checked }))}
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
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, analyticsId: e.target.value }))}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('seo')}>
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