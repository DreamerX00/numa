# Instagram Feature - Quick Setup

## ⚡ Quick Start (5 minutes)

### Step 1: Add Environment Variables
Add these to your `.env` or `.env.local` file:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="instagram_posts"
```

**Get these values from**: https://console.cloudinary.com/

### Step 2: Create Cloudinary Upload Preset

1. Go to: https://console.cloudinary.com/settings/upload
2. Click **"Add upload preset"**
3. Configure:
   - **Preset name**: `instagram_posts`
   - **Signing mode**: `Unsigned` ⚠️ Important!
   - **Folder**: `instagram` (optional)
   - **Allowed formats**: `gif, jpg, jpeg, png, mp4, webm`
   - **Max file size**: `50 MB`
4. Click **"Save"**

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Access Admin Panel

Navigate to: http://localhost:3000/admin/instagram

---

## 🎬 Adding Your First Post

1. **Get a GIF preview**:
   - Open Instagram post/reel on desktop
   - Use a tool like [Imgur](https://imgur.com/) or [Giphy](https://giphy.com/) to create a GIF
   - Or use browser extension like "Video to GIF"
   - Download the GIF (recommended size: 500-800px width)

2. **Upload to admin panel**:
   - Click "Click to upload GIF or Image"
   - Select your GIF file
   - Wait for upload to complete (green checkmark)

3. **Add Instagram URL**:
   - Open the Instagram post in browser
   - Copy the URL (e.g., `https://instagram.com/p/xxxxx`)
   - Paste into "Instagram Post URL" field

4. **Select type**:
   - Choose "Post" for regular posts
   - Choose "Reel" for Instagram Reels

5. **Click "Add Instagram Post"**

6. **View on homepage**:
   - Navigate to http://localhost:3000/
   - Scroll to Instagram section
   - Your post should appear and auto-scroll!

---

## 🎨 Customizing Settings

Click **"Settings"** button in admin panel:

- **Display Limit**: How many posts to show (default: 6)
- **Auto-Scroll Speed**: Time between scrolls in ms (default: 3000 = 3 seconds)
- **Enable Instagram Section**: Master on/off switch

---

## ✅ Verification Checklist

- [ ] Cloudinary upload preset created with "Unsigned" mode
- [ ] Environment variables added to `.env` file
- [ ] Dev server restarted
- [ ] Admin panel accessible at `/admin/instagram`
- [ ] Upload widget opens when clicking upload button
- [ ] First post successfully added
- [ ] Post appears on homepage
- [ ] Auto-scroll works (wait 3 seconds)
- [ ] Hover pauses auto-scroll
- [ ] Responsive on mobile (1 post at a time)

---

## 🐛 Common Issues

### "Cloudinary widget not loaded"
**Fix**: Refresh the page or clear cache

### Upload button doesn't open widget
**Fix**: 
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly
3. Ensure upload preset exists and is "Unsigned"

### Posts don't appear on homepage
**Fix**:
1. Check post is marked "Active" (green button in admin)
2. Verify "Enable Instagram Section" is ON in settings
3. Hard refresh homepage (Ctrl+Shift+R)

---

## 📚 Full Documentation

See `docs/INSTAGRAM_ADMIN_GUIDE.md` for:
- Detailed feature explanations
- Best practices
- Troubleshooting guide
- API documentation
- Database schema

---

## 🚀 Production Deployment

Before deploying:

1. **Add environment variables to Vercel**:
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - Add `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

2. **Verify upload preset**:
   - Ensure preset works in production Cloudinary environment
   - Test upload in production admin panel

3. **Database check**:
   - Ensure production MongoDB has `instagram_posts` and `instagram_settings` collections
   - Run `npx prisma db push` if needed

---

## 🎯 Next Steps

1. Upload 4-6 high-quality posts
2. Adjust auto-scroll speed to your preference
3. Test on different devices (mobile, tablet, desktop)
4. Share admin panel access with team members
5. Update posts weekly for fresh content

---

**Need help?** Check the full guide at `docs/INSTAGRAM_ADMIN_GUIDE.md`
