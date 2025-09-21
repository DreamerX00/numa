"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useUserProfile, useAddresses, useUpdateUserProfile } from "@/hooks/useApi";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import { OrderManagement } from "@/components/profile/OrderManagement";
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
  Eye,
  Star,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import type { UserProfile } from "@/types/profile";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use real API calls
  const { 
    data: profileData, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useUserProfile();
  
  const { 
    data: addressesData,
    // isLoading: addressesLoading,
    // error: addressesError 
  } = useAddresses();  const updateProfileMutation = useUpdateUserProfile();

  // ProtectedRoute already handles authentication, so user is guaranteed to be authenticated here

  if (profileLoading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </Container>
    );
  }

  if (profileError) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t load your profile data. Please try again.
            </p>
            <Button onClick={() => refetchProfile()} className="mr-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
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
      title: "Ms.", // Default or from API
      firstName: profileData.user.profile?.firstName || "",
      lastName: profileData.user.profile?.lastName || "",
      displayName: profileData.user.profile?.displayName || `${profileData.user.profile?.firstName || ""} ${profileData.user.profile?.lastName || ""}`.trim() || "User",
      email: profileData.user.email,
      phone: profileData.user.profile?.phone || "",
      dateOfBirth: profileData.user.profile?.dateOfBirth || "",
      gender: profileData.user.profile?.gender?.toLowerCase() || "",
      profession: "", // Would need to add to API
      bio: "", // Would need to add to API
      avatar: profileData.user.profile?.avatar || DEFAULT_IMAGES.USER,
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
      language: profileData.user.profile?.language || "en",
      currency: profileData.user.profile?.currency || "USD",
      timezone: profileData.user.profile?.timezone || "America/New_York",
      theme: "light",
      notifications: {
        email: {
          orderUpdates: profileData.user.profile?.emailMarketing || true,
          promotions: profileData.user.profile?.emailMarketing || false,
          newCollections: false,
          priceDrops: false,
          wishlistItems: false,
          reviews: false,
          newsletter: profileData.user.profile?.emailMarketing || false
        },
        sms: {
          orderUpdates: profileData.user.profile?.smsMarketing || true,
          deliveryNotifications: profileData.user.profile?.smsMarketing || true,
          securityAlerts: true
        },
        push: {
          orderUpdates: profileData.user.profile?.pushNotifications || true,
          promotions: false,
          recommendations: profileData.user.profile?.pushNotifications || false,
          reminders: false
        }
      },
      measurementUnit: "metric",
      priceRange: { min: 100, max: 5000 },
      preferredPaymentMethods: ["credit-card"],
      profileVisibility: "private",
      showInRecommendations: true,
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
    orderHistory: [], // Would need to create order API hook
    wishlist: [],
    favorites: [],
    loyaltyProgram: {
      tier: "Bronze", // Default tier
      points: 0,
      totalPointsEarned: 0,
      nextTierPoints: 1000,
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
                      {profile.personalInfo.firstName[0]}{profile.personalInfo.lastName[0]}
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
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                      {profile.phoneNumber && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <Phone className="h-4 w-4" />
                          {profile.phoneNumber}
                        </>
                      )}
                    </p>
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
                  <Button className="bg-brand hover:bg-brand-dark">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Public View
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
                    {profile.orderHistory.slice(0, 2).map((order) => (
                      <div key={order.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Image
                          src={order.thumbnail}
                          alt="Order"
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            ${order.totalAmount} • {order.status}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full justify-between" asChild>
                      <Link href="?tab=orders">
                        View All Orders
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
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
                  // Use the mutation to update profile
                  updateProfileMutation.mutate({
                    firstName: updatedInfo.firstName,
                    lastName: updatedInfo.lastName,
                    displayName: updatedInfo.displayName,
                    phone: updatedInfo.phone,
                    dateOfBirth: updatedInfo.dateOfBirth,
                    gender: updatedInfo.gender?.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | undefined,
                  });
                }}
              />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <OrderManagement orders={profile.orderHistory} />
            </TabsContent>

            {/* Additional tab contents will be added in the next steps */}
            {['wishlist', 'addresses', 'loyalty', 'security', 'notifications', 'settings'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="h-12 w-12 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Settings className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 capitalize">{tab.replace('-', ' ')}</h3>
                    <p className="text-muted-foreground">
                      This section will be implemented in the next steps.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </Container>
    </motion.div>
    </ProtectedRoute>
  );
}