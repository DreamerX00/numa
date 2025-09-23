# Profile System Production Readiness Plan

## Current Architecture Analysis

### ✅ **Solid Foundation Already Built**
- **Complete Prisma Schema**: User, UserProfile, Address, Order models with comprehensive fields
- **Firebase Authentication**: Full integration with server-side session management
- **Profile UI**: 9-tab sophisticated interface with real-time updates
- **React Query Integration**: Data fetching hooks with caching and error handling
- **API Structure**: All endpoints created (`/api/user/*`)

### ⚠️ **Critical Gap: Stub Data → Real Data Integration**
All API endpoints currently return mock data instead of integrating with Firebase + Prisma.

## Production Implementation Strategy

### Phase 1: Core Authentication & Profile Data (High Priority)

#### 1. **Update User Profile API** - `src/app/api/user/profile/route.ts`
**Current**: Returns guest fallback data
**Target**: Firebase auth + Prisma user data

```typescript
// GET: Fetch real user profile from database
// - Verify Firebase session cookie
// - Query Prisma for User + UserProfile
// - Include Firebase photoURL in response
// - Handle missing profile gracefully

// PUT: Update user profile in database
// - Validate Firebase authentication
// - Update UserProfile fields in Prisma
// - Sync with Firebase displayName if changed
```

#### 2. **Enhanced Authentication Middleware**
**Current**: Basic session validation exists
**Target**: Reusable auth helper for all user endpoints

```typescript
// Create: src/lib/auth/getUserFromSession.ts
// - Extract Firebase user from session cookie
// - Query database for corresponding User record
// - Return unified user object for API use
// - Handle authentication errors consistently
```

### Phase 2: E-commerce Data Integration (Medium Priority)

#### 3. **User Orders API** - `src/app/api/user/orders/route.ts`
**Current**: Returns empty orders array
**Target**: Real order history with pagination

```typescript
// Implementation needed:
// - Query Order table filtered by authenticated user
// - Include related OrderItem, Product data
// - Support pagination, filtering, sorting
// - Calculate order statistics for profile overview
```

#### 4. **Loyalty Program API** - `src/app/api/user/loyalty/route.ts`
**Current**: Returns Bronze tier with 0 points
**Target**: Dynamic loyalty calculation

```typescript
// Implementation needed:
// - Calculate loyalty points from UserProfile.loyaltyPoints
// - Determine tier from LoyaltyTier enum
// - Calculate points needed for next tier
// - Track loyalty activity history
```

#### 5. **Addresses API Enhancement** - `src/app/api/user/addresses/route.ts`
**Current**: Returns empty addresses
**Target**: Full CRUD operations

```typescript
// Implementation needed:
// - GET: Query Address table for user
// - POST: Create new address with validation
// - PUT: Update existing address
// - DELETE: Remove address (check if used in orders)
// - Set default shipping/billing addresses
```

### Phase 3: Security & Settings (Medium Priority)

#### 6. **Security Settings API** - `src/app/api/user/security/route.ts`
**Current**: Returns disabled 2FA settings
**Target**: Real security management

```typescript
// Implementation needed:
// - Password change functionality
// - 2FA setup/disable (if implementing)
// - Login history tracking
// - Trusted device management
// - Security audit log
```

#### 7. **Notification Settings API** - `src/app/api/user/notifications/route.ts`
**Current**: Returns default preferences
**Target**: User-specific notification preferences

```typescript
// Implementation needed:
// - Store preferences in UserProfile
// - Email marketing consent tracking
// - SMS notification preferences
// - Push notification settings
// - Preference history for compliance
```

#### 8. **Account Settings API** - `src/app/api/user/settings/route.ts`
**Current**: Returns Indian locale defaults
**Target**: User-customizable settings

```typescript
// Implementation needed:
// - Language, currency, timezone from UserProfile
// - Theme preferences
// - Privacy settings
// - Data export/deletion requests
```

## Database Schema Enhancements Needed

### UserProfile Model Extensions
```prisma
model UserProfile {
  // Add missing fields for full profile functionality:
  bio            String?          // User bio/description
  profession     String?          // Job title/profession
  website        String?          // Personal website
  
  // Enhanced preferences
  metalPreferences     String[]   // Gold, Silver, Platinum, etc.
  gemstonePreferences  String[]   // Diamond, Ruby, Emerald, etc.
  stylePreferences     String[]   // Classic, Modern, Vintage, etc.
  occasionPreferences  String[]   // Daily, Formal, Casual, etc.
  
  // Size preferences for jewelry
  ringSize       Float?
  braceletSize   Float?
  necklaceLength Float?
  
  // Security & privacy
  profileVisibility           String @default("private") // public, friends, private
  showInRecommendations       Boolean @default(true)
  allowDataForPersonalization Boolean @default(true)
  
  // Marketing preferences with timestamps
  emailMarketingOptIn      Boolean   @default(false)
  emailMarketingOptInDate  DateTime?
  smsMarketingOptIn        Boolean   @default(false)
  smsMarketingOptInDate    DateTime?
  
  // Additional tracking
  lastProfileUpdate        DateTime  @default(now())
  profileCompletionScore   Int       @default(0) // 0-100
}
```

### Security Tracking Tables (Optional)
```prisma
model LoginHistory {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress   String
  userAgent   String?
  location    String?  // City, Country
  loginTime   DateTime @default(now())
  logoutTime  DateTime?
  sessionId   String?
  
  @@map("login_history")
}

model TrustedDevice {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceName   String
  deviceId     String   @unique // Browser fingerprint or device identifier
  lastUsed     DateTime @default(now())
  isActive     Boolean  @default(true)
  
  @@map("trusted_devices")
}
```

## Implementation Priority Matrix

### 🔴 **Critical (Week 1)**
1. **User Profile API** - Replace mock data with Firebase + Prisma
2. **Authentication Helper** - Shared auth logic for all user endpoints
3. **Profile Page Data Flow** - Connect UI to real APIs

### 🟡 **High Priority (Week 2)**
4. **Orders API** - Real order history integration
5. **Addresses CRUD** - Complete address management
6. **Error Handling** - Proper error states and user feedback

### 🟢 **Medium Priority (Week 3-4)**
7. **Loyalty Program** - Dynamic points and tier calculation
8. **Settings APIs** - Notification and account preferences
9. **Security Features** - Basic security settings
10. **Performance Optimization** - Caching, lazy loading

### 🔵 **Nice to Have (Future)**
11. **Advanced Security** - 2FA, device management
12. **Profile Analytics** - Usage tracking, recommendations
13. **Social Features** - Profile sharing, public profiles (removed but may add back)

## Key Technical Decisions

### Authentication Strategy
- **Continue using Firebase + Session Cookies**: Proven working pattern
- **Centralized auth helper**: Reusable across all user endpoints
- **Error handling**: Consistent 401/403 responses

### Data Fetching Strategy
- **Keep React Query**: Excellent caching and error handling
- **Optimistic updates**: For better UX on profile edits
- **Stale-while-revalidate**: Background data refresh

### Performance Considerations
- **Profile data caching**: 10-minute stale time for profile data
- **Order pagination**: Limit 20 orders per page
- **Image optimization**: Use Next.js Image component everywhere
- **Bundle optimization**: Lazy load heavy profile components

### Error Handling Strategy
- **Graceful degradation**: Show partial data if some APIs fail
- **User-friendly messages**: Clear error communication
- **Retry mechanisms**: Automatic retry for network failures
- **Fallback states**: Loading skeletons and empty states

## Migration Strategy

### Phase 1: API Data Integration (Days 1-3)
1. Update `/api/user/profile` with real data
2. Create authentication helper
3. Test profile page with real data
4. Fix any UI issues with real vs mock data

### Phase 2: Orders & Commerce (Days 4-6)
1. Implement orders API with real data
2. Update loyalty program calculations
3. Complete address management CRUD
4. Test e-commerce flow integration

### Phase 3: Settings & Security (Days 7-10)
1. Implement notification preferences
2. Account settings management
3. Basic security features
4. User testing and feedback

## Success Metrics

### Technical Metrics
- ✅ All API endpoints return real data
- ✅ Authentication works across all user endpoints
- ✅ Profile completion rate > 80%
- ✅ API response time < 200ms average
- ✅ Zero critical security vulnerabilities

### User Experience Metrics
- ✅ Profile page load time < 2 seconds
- ✅ Profile edit success rate > 95%
- ✅ Error rate < 1% on profile operations
- ✅ User satisfaction score > 4.5/5

## Risk Mitigation

### Data Migration Risks
- **Risk**: Existing user data inconsistency
- **Mitigation**: Data validation scripts, gradual rollout

### Performance Risks
- **Risk**: Profile page becomes slow with real data
- **Mitigation**: Proper caching, pagination, lazy loading

### Security Risks
- **Risk**: User data exposure through API
- **Mitigation**: Proper authentication checks, input validation

### User Experience Risks
- **Risk**: Profile features break during transition
- **Mitigation**: Feature flags, A/B testing, rollback plan

## Next Immediate Actions

1. **Start with Profile API** (`src/app/api/user/profile/route.ts`)
2. **Create auth helper** (`src/lib/auth/getUserFromSession.ts`)
3. **Test profile page** with real Firebase user data
4. **Update orders API** with Prisma Order queries
5. **Implement address CRUD** operations

This plan transforms the current stub-data profile system into a production-ready, dynamic user management system that leverages the existing solid foundation while filling the critical data integration gaps.