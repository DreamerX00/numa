"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  useUserProfile, 
  useAddresses, 
  useUpdateUserProfile,
  useUserOrders,
  useLoyaltyProgram,
  useSecuritySettings,
  useNotificationSettings,
  useAccountSettings
} from "@/hooks/useApi";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";
import { getUserAvatar, getUserInitials } from "@/lib/avatar";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import { OrderManagement } from "@/components/profile/OrderManagement";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { WishlistTab } from "@/components/profile/WishlistTab";
import { AddressesTab } from "@/components/profile/AddressesTab";
import { LoyaltyTab } from "@/components/profile/LoyaltyTab";
import { SecurityTab } from "@/components/profile/SecurityTab";
import { NotificationsTab } from "@/components/profile/NotificationsTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  User,
  Settings,
  MapPin,
  Package,
  Heart,
  Shield,
  Bell,
  Gift,
  Crown,
  Edit3,
  Star,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { UserProfile } from "@/types/profile";
import HeartLoader from "@/components/ui/HeartLoader";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Use real API calls
  const { 
    data: profileData, 
    isLoading: profileLoading
  } = useUserProfile();
  
  const { 
    data: addressesData,
    isLoading: addressesLoading
  } = useAddresses();
  
  const {
    data: ordersData,
    isLoading: ordersLoading
  } = useUserOrders({ page: 1, limit: 10 });
  
  const {
    data: loyaltyData,
    isLoading: loyaltyLoading
  } = useLoyaltyProgram();
  
  const {
    data: securityData,
    isLoading: securityLoading
  } = useSecuritySettings();
  
  const {
    data: notificationsData,
    isLoading: notificationsLoading
  } = useNotificationSettings();
  
  const {
    data: settingsData,
    isLoading: settingsLoading
  } = useAccountSettings();

  const updateProfileMutation = useUpdateUserProfile();

  // ProtectedRoute already handles authentication, so user is guaranteed to be authenticated here

  if (profileLoading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HeartLoader className="mx-auto mb-4" size="md" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">
              Your profile data could not be found. Please contact support if this persists.
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Transform API data to match the component's expected format
  const profile: UserProfile = {
    id: profileData.user.id,
    email: profileData.user.email,
    emailVerified: profileData.user.emailVerified,
    phoneNumber: profileData.user.profile?.phone || undefined,
    phoneVerified: false, // This would come from API if available
    personalInfo: {
      title: profileData.user.profile?.title || "Ms.", // ✅ Use actual title from API
      firstName: profileData.user.profile?.firstName || "",
      lastName: profileData.user.profile?.lastName || "",
      displayName: profileData.user.profile?.displayName || `${profileData.user.profile?.firstName || ""} ${profileData.user.profile?.lastName || ""}`.trim() || "User",
      email: profileData.user.email,
      phone: profileData.user.profile?.phone || "",
      dateOfBirth: profileData.user.profile?.dateOfBirth || "",
      gender: profileData.user.profile?.gender?.toLowerCase() || "",
      profession: "", // Would need to add to API
      bio: "", // Would need to add to API
      avatar: profileData.user.profile?.avatar || getUserAvatar({ // ✅ Use avatar from API first
        profile: profileData.user.profile,
        email: profileData.user.email,
        photoURL: profileData.user.photoURL // This would come from OAuth provider (Google)
      }),
      metalPreferences: [], // Would need to add to API
      gemstonePreferences: [], // Would need to add to API
      sizePreferences: {
        ring: 0,
        bracelet: 0,
        necklace: 0
      },
      stylePreferences: [],
      occasionPreferences: []
    },
    addresses: addressesData?.addresses || [],
    preferences: {
      language: settingsData?.accountSettings?.language || profileData.user.profile?.language || "en",
      currency: settingsData?.accountSettings?.currency || profileData.user.profile?.currency || "INR",
      timezone: settingsData?.accountSettings?.timezone || profileData.user.profile?.timezone || "Asia/Kolkata",
      theme: settingsData?.accountSettings?.theme || "light",
      notifications: {
        email: {
          orderUpdates: notificationsData?.notificationSettings?.orderUpdates ?? true,
          promotions: notificationsData?.notificationSettings?.emailMarketing ?? false,
          newCollections: notificationsData?.notificationSettings?.productRecommendations ?? false,
          priceDrops: notificationsData?.notificationSettings?.priceDropAlerts ?? false,
          wishlistItems: notificationsData?.notificationSettings?.restockNotifications ?? false,
          reviews: notificationsData?.notificationSettings?.reviewReminders ?? false,
          newsletter: notificationsData?.notificationSettings?.emailMarketing ?? false
        },
        sms: {
          orderUpdates: notificationsData?.notificationSettings?.smsMarketing ?? true,
          deliveryNotifications: notificationsData?.notificationSettings?.smsMarketing ?? true,
          securityAlerts: true
        },
        push: {
          orderUpdates: notificationsData?.notificationSettings?.pushNotifications ?? true,
          promotions: notificationsData?.notificationSettings?.promotionalOffers ?? false,
          recommendations: notificationsData?.notificationSettings?.pushNotifications ?? false,
          reminders: false
        }
      },
      measurementUnit: "metric",
      priceRange: { min: 100, max: 5000 },
      preferredPaymentMethods: ["credit-card"],
      profileVisibility: "private",
      showInRecommendations: settingsData?.accountSettings?.showRecommendations ?? true,
      allowDataForPersonalization: true
    },
    security: {
      twoFactorEnabled: false, // Would need to add to API
      twoFactorMethod: "2fa-app", // Default value
      backupCodes: [],
      trustedDevices: [],
      loginHistory: [],
      securityQuestions: [],
      passwordLastChanged: new Date(),
      accountLockout: {
        isLocked: false
      }
    },
    orderHistory: ordersData?.orders?.map((order: {
      id: string;
      orderNumber: string;
      status: string;
      totalAmount: number;
      currency: string;
      subtotal: number;
      taxAmount: number;
      shippingAmount: number;
      discountAmount: number;
      paymentStatus?: string;
      items?: Array<{
        id: string;
        name: string;
        sku: string;
        price: number;
        quantity: number;
        product?: {
          id: string;
          name: string;
          images?: string[];
        };
      }>;
      shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
      };
      createdAt: string;
      estimatedDelivery?: string;
      trackingNumber?: string;
      carrier?: string;
    }) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      totalAmount: order.totalAmount,
      currency: order.currency,
      itemCount: order.items?.length || 0,
      orderDate: new Date(order.createdAt),
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
      trackingNumber: order.trackingNumber,
      thumbnail: order.items?.[0]?.product?.images?.[0] || DEFAULT_IMAGES.PRODUCT,
      canReturn: ['delivered'].includes(order.status.toLowerCase()),
      canReview: ['delivered'].includes(order.status.toLowerCase()),
      // Additional fields for detailed view
      items: order.items?.map(item => ({
        id: item.id,
        name: item.name || item.product?.name || 'Unknown Product',
        variant: item.sku ? `SKU: ${item.sku}` : 'Standard',
        quantity: item.quantity,
        price: item.price,
        image: item.product?.images?.[0] || DEFAULT_IMAGES.PRODUCT,
        sku: item.sku
      })) || [],
      shipping: {
        method: order.carrier || 'Standard Delivery',
        cost: order.shippingAmount || 0,
        address: order.shippingAddress ? 
          `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}` :
          'Address not available'
      },
      payment: {
        method: order.paymentStatus === 'PAID' ? 'Credit Card' : 'Pending',
        last4: '****' // API doesn't return payment details for security
      }
    })) || [],
    wishlist: [],
    favorites: [],
    loyaltyProgram: {
      tier: loyaltyData?.loyaltyProgram?.currentTier || "BRONZE",
      points: loyaltyData?.loyaltyProgram?.currentPoints || 0,
      totalPointsEarned: loyaltyData?.loyaltyProgram?.currentPoints || 0,
      nextTierPoints: loyaltyData?.loyaltyProgram?.pointsToNextTier || 1000,
      benefits: ["Standard shipping"],
      expiringPoints: [],
      referralCode: "",
      referrals: {
        count: 0,
        totalRewards: 0
      }
    },
    accountStatus: {
      isActive: true,
      isVerified: profileData.user.emailVerified,
      verificationLevel: profileData.user.emailVerified ? "basic" : "basic",
      restrictions: [],
      badges: [],
      memberSince: new Date(profileData.user.createdAt),
      totalOrders: 0, // Would need to get from orders API
      totalSpent: 0 // Would need to get from orders API
    },
    createdAt: new Date(profileData.user.createdAt),
    updatedAt: new Date(profileData.user.updatedAt),
    lastLoginAt: new Date() // Would need to track in API
  };

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Container className="py-6 md:py-8">{/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-8 bg-gradient-to-r from-brand/5 to-brand-accent/5 border-brand/20">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="h-24 w-24 border-4 border-brand/20">
                    <AvatarImage src={profile.personalInfo.avatar} />
                    <AvatarFallback className="text-2xl bg-brand/10 text-brand">
                      {getUserInitials(profile.personalInfo.firstName, profile.personalInfo.lastName, profile.email)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold animated-gradient-text">
                        {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                      </h1>
                      {profile.accountStatus.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge className="bg-brand/10 text-brand border-brand/20">
                        <Crown className="h-3 w-3 mr-1" />
                        {profile.loyaltyProgram.tier}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                      {profile.phoneNumber && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <Phone className="h-4 w-4" />
                          {profile.phoneNumber}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Member since {profile.accountStatus.memberSince.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {profile.accountStatus.totalOrders} orders
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      ${profile.accountStatus.totalSpent.toLocaleString()} lifetime value
                    </div>
                  </div>
                  
                  {/* Loyalty Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress to Platinum</span>
                      <span>{profile.loyaltyProgram.points} / {profile.loyaltyProgram.points + profile.loyaltyProgram.nextTierPoints} points</span>
                    </div>
                    <Progress 
                      value={(profile.loyaltyProgram.points / (profile.loyaltyProgram.points + profile.loyaltyProgram.nextTierPoints)) * 100}
                      className="h-2 bg-brand/10"
                    />
                    <p className="text-xs text-muted-foreground">
                      {profile.loyaltyProgram.nextTierPoints} more points to reach Platinum tier
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button onClick={() => setIsEditingProfile(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 gap-1 h-auto p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2 text-xs">
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 text-xs">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2 text-xs">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2 text-xs">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="flex items-center gap-2 text-xs">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 text-xs">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 text-xs">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Stats */}
                <Card className="hover-lift">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-brand" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <HeartLoader size="sm" />
                      </div>
                    ) : profile.orderHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">No orders yet</p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <Link href="/collections">Start Shopping</Link>
                        </Button>
                      </div>
                    ) : (
                      profile.orderHistory.slice(0, 2).map((order) => (
                        <div key={order.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <Image
                            src={order.thumbnail || DEFAULT_IMAGES.PRODUCT}
                            alt="Order"
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{order.totalAmount} • {order.status}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))
                    )}
                    {profile.orderHistory.length > 0 && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between" 
                        onClick={() => setActiveTab("orders")}
                      >
                        View All Orders
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Loyalty Status */}
                <Card className="hover-lift">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Crown className="h-5 w-5 text-brand" />
                      Loyalty Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brand mb-1">
                        {profile.loyaltyProgram.points.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">points available</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Tier</span>
                        <Badge className="bg-brand/10 text-brand">
                          {profile.loyaltyProgram.tier}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Next Reward</span>
                        <span className="font-medium">{profile.loyaltyProgram.nextTierPoints} points</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="?tab=loyalty">
                        View Rewards
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Account Security */}
                <Card className="hover-lift">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-brand" />
                      Account Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Verified</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Phone Verified</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Two-Factor Auth</span>
                      {profile.security.twoFactorEnabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="?tab=security">
                        Security Settings
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity and Badges */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Account Badges */}
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-brand" />
                      Achievement Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {profile.accountStatus.badges.map((badge) => (
                        <motion.div
                          key={badge.id}
                          className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className="text-2xl mb-2">{badge.icon}</div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Jewelry Preferences */}
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-brand" />
                      Jewelry Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Preferred Metals</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.personalInfo.metalPreferences.map((metal) => (
                          <Badge key={metal} variant="secondary" className="text-xs">
                            {metal.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Style Preferences</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.personalInfo.stylePreferences.map((style) => (
                          <Badge key={style} variant="outline" className="text-xs">
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href="?tab=settings">
                        Update Preferences
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <PersonalInfoSection
                personalInfo={profile.personalInfo}
                onUpdate={(updatedInfo) => {
                  // Prepare payload for API - NOW INCLUDING AVATAR!
                  // Use the mutation to update profile
                  updateProfileMutation.mutate({
                    firstName: updatedInfo.firstName || undefined,
                    lastName: updatedInfo.lastName || undefined,
                    displayName: updatedInfo.displayName || undefined,
                    title: updatedInfo.title || undefined, // ✅ Include title/suffix
                    avatar: updatedInfo.avatar || undefined, // ✅ Include avatar URL from Cloudinary upload
                    phone: updatedInfo.phone || undefined,
                    dateOfBirth: updatedInfo.dateOfBirth || undefined,
                    gender: updatedInfo.gender && updatedInfo.gender.trim() 
                      ? updatedInfo.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | undefined
                      : undefined,
                  });
                }}
              />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <OrderManagement orders={profile.orderHistory} />
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist">
              <WishlistTab 
                wishlistItems={profileData?.wishlist}
                isLoading={profileLoading}
              />
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <AddressesTab 
                addresses={addressesData?.addresses || []}
                isLoading={addressesLoading}
              />
            </TabsContent>

            {/* Loyalty Tab */}
            <TabsContent value="loyalty">
              <LoyaltyTab 
                loyaltyData={loyaltyData}
                isLoading={loyaltyLoading}
              />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <SecurityTab 
                securityData={securityData}
                isLoading={securityLoading}
              />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <NotificationsTab 
                notificationSettings={notificationsData}
                isLoading={notificationsLoading}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <SettingsTab 
                accountSettings={settingsData}
                isLoading={settingsLoading}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </Container>
      
      {/* Edit Profile Dialog */}
      <EditProfileDialog
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        initialData={{
          firstName: profile.personalInfo.firstName,
          lastName: profile.personalInfo.lastName,
          displayName: profile.personalInfo.displayName || '',
          title: profile.personalInfo.title, // ✅ Pass title to dialog
          phone: profile.personalInfo.phone,
          dateOfBirth: profile.personalInfo.dateOfBirth,
          gender: profile.personalInfo.gender,
          avatar: profile.personalInfo.avatar,
        }}
      />
    </motion.div>
    </ProtectedRoute>
  );
}