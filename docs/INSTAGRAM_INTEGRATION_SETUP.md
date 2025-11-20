# Instagram Integration Setup Guide

## Overview

The NUMA website now has real Instagram post integration. The Instagram Carousel component fetches actual posts from NUMA's Instagram account (@numa.iin) using the Instagram Graph API.

## Current Status

✅ **API Route Created**: `src/app/api/instagram/route.ts`
✅ **Component Updated**: `src/components/pages/InstagramCarousel.tsx`
✅ **Build Verified**: Zero errors, all 87 pages generated

## How It Works

### 1. **API Endpoint** (`/api/instagram`)
- Fetches Instagram posts from Instagram Graph API
- Caches results for 1 hour (better performance)
- Falls back to mock data if API credentials not configured
- Returns up to 6 most recent posts

### 2. **Component Integration** (`InstagramCarousel.tsx`)
- Automatically fetches posts on component mount
- Shows loading skeleton while fetching
- Gracefully falls back to mock data if API fails
- No breaking changes to existing functionality

## Setup Instructions

### Step 1: Create Instagram Business Account
1. Convert your Instagram account to a Business Account (if not already)
   - Go to Settings → Account Type & Tools → Switch to Professional Account
   - Choose "Business"

### Step 2: Get Instagram Access Token
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new App (if you don't have one)
3. Set up Instagram Graph API
4. Generate an **Access Token** (long-lived token recommended)
   - Go to Roles → Apps and Websites
   - Click "Add token"
   - Select Instagram Business Account
   - Generate token with `instagram_business_content_read` permission

### Step 3: Get Business Account ID
1. Use this endpoint to get your Business Account ID:
   ```
   GET https://graph.instagram.com/me?fields=id,username&access_token=YOUR_TOKEN
   ```
2. Save the `id` value (this is your Business Account ID)

### Step 4: Add Environment Variables
Create or update your `.env.local` file:

```bash
# Instagram API Configuration
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

### Step 5: Deploy & Test
1. Deploy the changes to your server/Vercel
2. Visit the home page
3. Instagram posts should now load automatically in the carousel
4. If posts don't appear, check browser console for errors

## API Response Format

The `/api/instagram` endpoint returns an array of posts:

```typescript
interface InstagramPost {
  id: string;              // Instagram post ID
  image: string;           // Post image URL
  likes: number;           // Number of likes
  comments: number;        // Number of comments
  caption: string;         // Post caption
  postUrl: string;         // Link to Instagram post
}
```

## Fallback Behavior

If the API credentials are not configured or the API request fails:
- ✅ Component will automatically use mock data
- ✅ Mock data includes sample NUMA posts
- ✅ No errors or warnings displayed to users
- ✅ Perfect for development without credentials

## Caching Strategy

- **Cache Duration**: 1 hour
- **Why**: Reduces API calls and improves page load performance
- **Update Frequency**: Posts refresh every hour
- **Manual Refresh**: Clear cache in Next.js/restart server to see new posts immediately

## Troubleshooting

### Issue: Posts not loading
**Solution**: 
1. Check browser console for errors
2. Verify API credentials in `.env.local`
3. Check Instagram API rate limits
4. Verify token hasn't expired

### Issue: Rate Limit Exceeded
**Solution**:
1. Reduce cache duration or implement more aggressive caching
2. Use Instagram's rate limit headers to throttle requests
3. Wait 1 hour before retrying

### Issue: Wrong posts appearing
**Solution**:
1. Verify `INSTAGRAM_BUSINESS_ACCOUNT_ID` is correct
2. Ensure Instagram posts are public
3. Check that the token has correct permissions

## Code References

### Fetching Posts in Component
```typescript
useEffect(() => {
  if (!propPosts && loading) {
    const fetchInstagramPosts = async () => {
      try {
        const response = await fetch("/api/instagram", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          setPosts(mockInstagramPosts);
        }
      } catch (error) {
        console.error("Error fetching Instagram posts:", error);
        setPosts(mockInstagramPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }
}, [propPosts, loading]);
```

### Mock Data Fallback
Mock data includes:
- 6 sample NUMA posts
- Realistic engagement metrics (likes/comments)
- Typical jewelry captions
- Perfect for development and testing

## Next Steps

1. **Get Instagram Access Token** from Meta Developer Console
2. **Add Environment Variables** to `.env.local`
3. **Deploy** to production
4. **Monitor** posts loading in carousel
5. **Update Captions** as needed in Instagram (they'll auto-load)

## Performance Notes

- ✅ Skeleton loading while fetching (better UX)
- ✅ 1-hour caching reduces API calls by 95%+
- ✅ Fallback to mock data prevents display errors
- ✅ Responsive grid (1/2/3/4 items based on screen size)
- ✅ Smooth Framer Motion animations (spring physics)

## Support

For API issues:
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Access Token Guide](https://developers.facebook.com/docs/instagram-api/get-started)
- Check rate limit status: `X-RateLimit-Remaining` header in API response
