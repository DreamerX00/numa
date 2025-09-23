# Profile Page Completion Plan

## Overview
The profile page has a sophisticated 9-tab interface but needs API completion and database alignment for full functionality.

## Current Status ✅

### ✅ Completed
- **Profile Page UI**: 9 comprehensive tabs (overview, personal, orders, wishlist, addresses, loyalty, security, notifications, settings)
- **Basic Profile API**: `/api/user/profile` with GET/PUT endpoints
- **Address Management**: Complete CRUD operations for addresses
- **Wishlist API**: Full wishlist functionality
- **Database Schema**: User, UserProfile, Address, Order models with extensive fields
- **Authentication**: Firebase integration with protected routes
- **React Query Hooks**: Data fetching with useUserProfile, useAddresses
- **Button Styling**: Consistent global button styling with brand colors

## Missing Components ❌

### 1. **API Endpoints Created** ✅
- `/api/user/orders` - User order history with pagination and filtering
- `/api/user/loyalty` - Loyalty program data and activity history
- `/api/user/security` - Security settings and password management
- `/api/user/notifications` - Notification preferences
- `/api/user/settings` - Account settings (language, currency, timezone)

### 2. **React Query Hooks Added** ✅
- `useUserOrders()` - Order history with pagination
- `useLoyaltyProgram()` - Loyalty data and tier progress
- `useSecuritySettings()` / `useUpdateSecuritySettings()` - Security management
- `useNotificationSettings()` / `useUpdateNotificationSettings()` - Notification preferences
- `useAccountSettings()` / `useUpdateAccountSettings()` - Account settings

### 3. **Database Schema Enhancements Needed** ⚠️

#### UserProfile Model Extensions Required:
```prisma
model UserProfile {
  // ... existing fields ...
  
  // Additional notification preferences
  orderUpdates              Boolean   @default(true)
  promotionalOffers         Boolean   @default(false)
  productRecommendations    Boolean   @default(false)
  priceDropAlerts          Boolean   @default(false)
  restockNotifications     Boolean   @default(false)
  reviewReminders          Boolean   @default(true)
  loyaltyProgramNotifications Boolean @default(true)
  
  // Additional account settings
  theme                    String    @default("system") // light, dark, system
  dateFormat              String    @default("DD/MM/YYYY")
  autoSaveCart            Boolean   @default(true)
  showRecommendations     Boolean   @default(true)
  
  // Security settings
  sessionTimeout          Int       @default(60) // minutes
  loginNotifications      Boolean   @default(true)
  passwordChangeNotifications Boolean @default(true)
}
```

#### New Model Needed:
```prisma
model LoyaltyActivity {
  id          String            @id @default(auto()) @map("_id") @db.ObjectId
  userId      String            @db.ObjectId
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        LoyaltyActivityType
  points      Int
  reason      String
  orderId     String?           @db.ObjectId
  order       Order?            @relation(fields: [orderId], references: [id])
  
  createdAt   DateTime          @default(now())

  @@map("loyalty_activities")
}

enum LoyaltyActivityType {
  EARNED
  REDEEMED
  EXPIRED
  ADJUSTMENT
}
```

## Implementation Priority

### Phase 1: Core Functionality ✅ DONE
- [x] Create missing API endpoints
- [x] Add React Query hooks
- [x] Test basic API functionality

### Phase 2: Data Integration (NEXT)
- [ ] Update profile page to use real API data
- [ ] Replace mock data transformations with API calls
- [ ] Implement proper error handling
- [ ] Add loading states for all tabs

### Phase 3: Database Enhancement (OPTIONAL)
- [ ] Add extended UserProfile fields
- [ ] Create LoyaltyActivity model
- [ ] Migrate existing data
- [ ] Update API endpoints to use new fields

### Phase 4: Feature Completion
- [ ] Implement password change functionality
- [ ] Add email verification flow
- [ ] Implement two-factor authentication
- [ ] Add export data functionality
- [ ] Account deletion workflow

## Profile Page Tab Status

### 1. Overview Tab ⚠️ (Needs API Integration)
- Shows user stats, recent orders, loyalty progress
- **Current**: Mock data transformation
- **Needed**: Integrate with `/api/user/orders` and `/api/user/loyalty`

### 2. Personal Info Tab ✅ (Complete)
- User profile editing
- **Current**: Working with `/api/user/profile`

### 3. Orders Tab ⚠️ (Needs API Integration)
- Order history with filters
- **Current**: Mock data
- **Needed**: Integrate with `/api/user/orders`

### 4. Wishlist Tab ✅ (Complete)
- Working with existing `/api/wishlist`

### 5. Addresses Tab ✅ (Complete)
- Working with `/api/user/addresses`

### 6. Loyalty Tab ⚠️ (Needs API Integration)
- Loyalty points, tier progress, activity history
- **Current**: Mock data
- **Needed**: Integrate with `/api/user/loyalty`

### 7. Security Tab ⚠️ (Needs API Integration)
- Password change, 2FA, security settings
- **Current**: Mock interface
- **Needed**: Integrate with `/api/user/security`

### 8. Notifications Tab ⚠️ (Needs API Integration)
- Notification preferences
- **Current**: Mock interface
- **Needed**: Integrate with `/api/user/notifications`

### 9. Settings Tab ⚠️ (Needs API Integration)
- Account preferences
- **Current**: Mock interface
- **Needed**: Integrate with `/api/user/settings`

## Key Files Modified

### API Endpoints
- `src/app/api/user/orders/route.ts` - User order history
- `src/app/api/user/loyalty/route.ts` - Loyalty program data
- `src/app/api/user/security/route.ts` - Security settings
- `src/app/api/user/notifications/route.ts` - Notification preferences
- `src/app/api/user/settings/route.ts` - Account settings

### React Query Hooks
- `src/hooks/useApi.ts` - Added hooks for all new endpoints

### Database
- `prisma/schema.prisma` - Enhanced with additional fields (pending)

## Next Immediate Steps

1. **Update Profile Page Components** - Replace mock data with real API calls
2. **Test All API Endpoints** - Ensure they work correctly
3. **Add Error Handling** - Proper error states for each tab
4. **Add Loading States** - Better UX during data fetching
5. **Database Migration** - Add extended fields for complete functionality

## Database Field Mapping

### Current UserProfile ↔ Profile Page Data
```typescript
// Database → Profile Page
firstName → personalInfo.firstName
lastName → personalInfo.lastName
displayName → personalInfo.displayName
phone → personalInfo.phone
dateOfBirth → personalInfo.dateOfBirth
gender → personalInfo.gender
loyaltyPoints → loyaltyProgram.currentPoints
loyaltyTier → loyaltyProgram.tier
emailMarketing → notifications.emailMarketing
smsMarketing → notifications.smsMarketing
pushNotifications → notifications.pushNotifications
language → settings.language
currency → settings.currency
timezone → settings.timezone
```

## API Integration Required

The profile page currently uses sophisticated data transformation but with mock data. All tabs need to be updated to use the new API endpoints for full functionality.