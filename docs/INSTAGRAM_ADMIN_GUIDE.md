# Instagram Section Admin Guide

## Overview
The Instagram section on your home page allows you to showcase Instagram posts and reels with animated GIF previews. This guide covers setup, configuration, and daily usage.

---

## Setup & Configuration

### 1. Environment Variables
Add these to your `.env` or `.env.local` file:

```bash
# Required - Your Cloudinary account details
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="instagram_posts"

# Server-side Cloudinary (if not already present)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 2. Cloudinary Upload Preset
Create an upload preset in your Cloudinary dashboard:

1. Go to Settings → Upload → Upload Presets
2. Click "Add upload preset"
3. Set preset name: `instagram_posts`
4. Set signing mode: **Unsigned** (for client-side uploads)
5. Set folder: `instagram` (optional but recommended)
6. Allowed formats: `gif, jpg, jpeg, png, mp4, webm`
7. Max file size: `50 MB`
8. Save the preset

### 3. Database
The Instagram feature uses two collections:
- `instagram_posts` - Stores individual posts with media URLs
- `instagram_settings` - Controls carousel behavior (display limit, speed, visibility)

These are automatically created when you first access the admin page.

---

## Using the Admin Panel

### Accessing the Panel
Navigate to: `/admin/instagram`

### Adding a New Post

1. **Upload Media Preview**
   - Click the upload button
   - Select a GIF or image file (recommended: GIF for animation)
   - Max size: 50 MB
   - Formats: GIF, JPG, PNG, MP4, WEBM
   - **Tip**: Use Instagram's "Save" feature to download posts as GIFs

2. **Provide Instagram URL**
   - Copy the Instagram post or reel URL
   - Paste into "Instagram Post URL" field
   - Example: `https://instagram.com/p/xxxxx`

3. **Select Media Type**
   - Choose "Post" for regular Instagram posts
   - Choose "Reel" for Instagram Reels (adds play icon badge)

4. **Add Post**
   - Click "Add Instagram Post"
   - Post appears at the bottom of your list

### Managing Posts

#### Reordering
- **Drag and drop** posts using the grip handle (☰) on the left
- Order changes are saved automatically
- Carousel displays posts in the order shown

#### Toggling Visibility
- Click the "Active" or "Hidden" button on each post
- **Active** (green): Post appears in the carousel
- **Hidden** (gray): Post is saved but not displayed
- Toggle instantly without confirmation

#### Deleting Posts
- Click the red trash icon
- Confirm deletion in the popup
- **Warning**: This is permanent and cannot be undone

#### Viewing on Instagram
- Click the post URL link to open in a new tab
- Verify the link works before publishing

### Carousel Settings

Click "Settings" in the top-right to access:

1. **Display Limit** (1-20)
   - How many active posts to show in carousel
   - Example: Set to 6 to show only the first 6 active posts
   - Inactive posts don't count toward the limit

2. **Auto-Scroll Speed** (1000-10000ms)
   - Time between automatic scrolls in milliseconds
   - Default: 3000ms (3 seconds)
   - Recommended: 3000-5000ms for readability

3. **Enable Instagram Section**
   - Master switch to show/hide entire Instagram section
   - Turn off during maintenance or if you want to temporarily remove it
   - Posts remain saved and can be re-enabled anytime

Click "Save Settings" to apply changes.

---

## Frontend Carousel Features

### Automatic Behaviors
- **Auto-scrolls** every 3 seconds (configurable)
- **Pauses on hover** for desktop users
- **Responsive layout**:
  - Mobile (<640px): 1 post at a time
  - Tablet (640-1024px): 2 posts
  - Desktop (1024-1440px): 3 posts
  - Large screens (>1440px): 4 posts

### User Interactions
- **Navigation arrows**: Click left/right to browse
- **Progress dots**: Show current position in carousel
- **"View on Instagram" button**: Appears on hover
- **REEL badge**: Shows play icon for Instagram Reels

### Loading States
- Shows animated skeleton while posts load
- Gracefully handles empty states
- Displays Instagram icon placeholder

---

## Best Practices

### Content Guidelines
1. **Use GIFs for previews**
   - Animated GIFs attract more attention than static images
   - Keep file size under 10 MB for fast loading
   - Use tools like Giphy or Ezgif to optimize GIFs

2. **Post Selection**
   - Choose your best-performing Instagram content
   - Mix posts and reels for variety
   - Keep carousel to 6-8 posts for optimal performance

3. **Update Regularly**
   - Add new posts weekly to keep content fresh
   - Remove outdated or underperforming posts
   - Monitor engagement through Instagram Insights

### Performance Tips
1. **Optimize Media Files**
   - Compress GIFs before uploading
   - Target 500-800px width for previews
   - Use WebP or modern formats when possible

2. **Display Limits**
   - Don't exceed 10-12 active posts
   - More posts = longer load times
   - Quality over quantity

3. **Auto-Scroll Speed**
   - Too fast (<2s): Users can't read content
   - Too slow (>6s): Carousel feels static
   - Sweet spot: 3-4 seconds

### SEO & Accessibility
- Instagram URLs are no-follow by default
- Alt text is automatically set to "Instagram post"
- Consider adding a section heading above carousel
- Ensure contrast ratio for "View on Instagram" button

---

## Troubleshooting

### Upload Widget Not Loading
**Problem**: Clicking upload button does nothing
**Solutions**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
3. Ensure upload preset `instagram_posts` exists in Cloudinary
4. Try refreshing the page

### Posts Not Appearing on Home Page
**Problem**: Posts show in admin but not on website
**Solutions**:
1. Check if posts are marked as "Active" (green button)
2. Verify "Enable Instagram Section" is ON in settings
3. Check if display limit is high enough
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Auto-Scroll Not Working
**Problem**: Carousel doesn't automatically scroll
**Solutions**:
1. Ensure auto-scroll speed is set (should be 3000 by default)
2. Check if you're hovering over carousel (pauses on hover)
3. Verify at least 2 active posts exist
4. Try refreshing the page

### Images Not Loading
**Problem**: Broken image icons or 404 errors
**Solutions**:
1. Verify Cloudinary URL is valid (open in new tab)
2. Check if Cloudinary account is active
3. Ensure media wasn't deleted from Cloudinary
4. Re-upload the media file

### Drag-and-Drop Not Working
**Problem**: Can't reorder posts
**Solutions**:
1. Click and hold the grip handle (☰) before dragging
2. Drag vertically only (horizontal doesn't work)
3. Try using a different browser (Chrome recommended)
4. Refresh page and try again

---

## Technical Details

### Database Schema

#### InstagramPost Model
```prisma
model InstagramPost {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  mediaUrl   String   // Cloudinary URL
  mediaType  InstagramMediaType  // POST or REEL
  postUrl    String   // Instagram post URL
  isActive   Boolean  @default(true)
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

#### InstagramSettings Model
```prisma
model InstagramSettings {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  displayLimit    Int      @default(6)
  autoScrollSpeed Int      @default(3000)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### API Endpoints

#### Public API
- `GET /api/instagram` - Fetch active posts for display

#### Admin API (Protected)
- `GET /api/admin/instagram` - Fetch all posts
- `POST /api/admin/instagram` - Create new post
- `PUT /api/admin/instagram` - Update/reorder/toggle posts
- `DELETE /api/admin/instagram?id={postId}` - Delete post
- `GET /api/admin/instagram/settings` - Fetch settings
- `PUT /api/admin/instagram/settings` - Update settings

### Component Structure
- **Admin Panel**: `/src/app/admin/instagram/page.tsx`
- **Frontend Carousel**: `/src/components/pages/InstagramCarousel.tsx`
- **API Routes**: `/src/app/api/instagram/` and `/src/app/api/admin/instagram/`

---

## FAQ

**Q: Can I upload videos instead of GIFs?**
A: Yes, but GIFs are recommended. Videos require the user to click play, while GIFs auto-play as previews.

**Q: How many posts should I display?**
A: 6-8 posts is ideal. More than 10 can slow down the page.

**Q: Can customers add Instagram posts?**
A: No, only admins can manage Instagram posts. This ensures quality control.

**Q: Do I need an Instagram Business account?**
A: No, this feature doesn't connect to Instagram's API. You manually upload GIF previews.

**Q: Can I change the carousel design?**
A: Yes, but it requires code changes. The carousel uses Tailwind CSS and Framer Motion.

**Q: What happens if I delete a post from Cloudinary?**
A: The preview image will break. Always delete through the admin panel, not directly in Cloudinary.

**Q: Can I schedule posts?**
A: Not currently. This feature may be added in future updates.

---

## Support

For technical issues or feature requests:
1. Check the browser console for error messages
2. Review this guide's troubleshooting section
3. Contact your development team with:
   - Screenshots of the issue
   - Steps to reproduce
   - Browser and device information

---

## Changelog

### Version 1.0 (Current)
- Initial release with drag-drop reordering
- Cloudinary upload widget integration
- Auto-scroll with pause on hover
- Responsive design (1-4 posts per view)
- Active/inactive toggle
- Settings panel (display limit, speed, visibility)
- Loading skeleton
- REEL badge for reels
- Progress dots navigation
