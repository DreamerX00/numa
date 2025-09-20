// Professional-grade user profile types for NUMA luxury jewelry platform

export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // Personal Information
  personalInfo: PersonalInfo;
  
  // Address Management
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  
  // Account Settings
  preferences: UserPreferences;
  security: SecuritySettings;
  
  // Commerce Data
  orderHistory: OrderSummary[];
  wishlist: WishlistItem[];
  favorites: FavoriteCollection[];
  
  // Loyalty & Rewards
  loyaltyProgram: LoyaltyData;
  
  // Account Status
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface PersonalInfo {
  title?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO date string for form compatibility
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  anniversary?: Date;
  profession?: string;
  bio?: string;
  avatar?: string;
  
  // Jewelry Preferences
  metalPreferences: MetalType[];
  gemstonePreferences: string[];
  sizePreferences: SizePreferences;
  stylePreferences: StylePreference[];
  occasionPreferences: string[];
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing' | 'both';
  label: string; // Home, Office, etc.
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  
  // Communication Preferences
  notifications: NotificationPreferences;
  
  // Shopping Preferences
  measurementUnit: 'metric' | 'imperial';
  priceRange: {
    min: number;
    max: number;
  };
  preferredPaymentMethods: string[];
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'friends';
  showInRecommendations: boolean;
  allowDataForPersonalization: boolean;
}

export interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newCollections: boolean;
    priceDrops: boolean;
    wishlistItems: boolean;
    reviews: boolean;
    newsletter: boolean;
  };
  sms: {
    orderUpdates: boolean;
    deliveryNotifications: boolean;
    securityAlerts: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    recommendations: boolean;
    reminders: boolean;
  };
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: '2fa-app' | 'sms' | 'email';
  backupCodes: string[];
  trustedDevices: TrustedDevice[];
  loginHistory: LoginHistory[];
  securityQuestions: SecurityQuestion[];
  passwordLastChanged: Date;
  accountLockout: {
    isLocked: boolean;
    lockReason?: string;
    lockedUntil?: Date;
  };
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceType: string;
  browser: string;
  ipAddress: string;
  location: string;
  addedAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface LoginHistory {
  id: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  success: boolean;
  failureReason?: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answerHash: string;
  createdAt: Date;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  orderDate: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  thumbnail: string;
  canReturn: boolean;
  canReview: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  variantId: string;
  addedAt: Date;
  priceWhenAdded: number;
  currentPrice: number;
  inStock: boolean;
  notes?: string;
}

export interface FavoriteCollection {
  id: string;
  name: string;
  description?: string;
  items: WishlistItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyData {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  points: number;
  totalPointsEarned: number;
  nextTierPoints: number;
  benefits: string[];
  expiringPoints: {
    points: number;
    expiryDate: Date;
  }[];
  referralCode: string;
  referrals: {
    count: number;
    totalRewards: number;
  };
}

export interface AccountStatus {
  isActive: boolean;
  isVerified: boolean;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  restrictions: string[];
  badges: AccountBadge[];
  memberSince: Date;
  totalOrders: number;
  totalSpent: number;
}

export interface AccountBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'milestone' | 'achievement' | 'special';
}

// Supporting Types
export type MetalType = 'gold' | 'silver' | 'platinum' | 'rose-gold' | 'white-gold' | 'titanium';

export interface SizePreferences {
  ring?: number;
  bracelet?: number;
  necklace?: number; // length in cm
  earrings?: 'small' | 'medium' | 'large';
}

export type StylePreference = 
  | 'minimalist' 
  | 'vintage' 
  | 'modern' 
  | 'classic' 
  | 'bohemian' 
  | 'luxury' 
  | 'statement' 
  | 'delicate';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned' 
  | 'refunded';

// API Response Types
export interface ProfileUpdateRequest {
  personalInfo?: Partial<PersonalInfo>;
  preferences?: Partial<UserPreferences>;
  addresses?: {
    add?: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>[];
    update?: Partial<Address>[];
    remove?: string[];
  };
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
  validationErrors?: Record<string, string>;
}

// Form Types
export interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  profession: string;
  bio: string;
}

export interface AddressFormData {
  type: 'shipping' | 'billing' | 'both';
  label: string;
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  instructions: string;
  isDefault: boolean;
}

export interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: '2fa-app' | 'sms' | 'email';
}