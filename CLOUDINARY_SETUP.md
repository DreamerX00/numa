# 🌟 **Cloudinary Setup Guide for Image Management**

## 📋 **Step 1: Create Free Cloudinary Account**

1. **Go to**: [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. **Sign up** with your email
3. **Verify** your email address
4. **Complete** the onboarding process

## 🔑 **Step 2: Get Your Credentials**

After signing up, go to your **Dashboard** and copy:

- **Cloud Name**: `your-cloud-name`
- **API Key**: `123456789012345`
- **API Secret**: `abcdefghijklmnopqrstuvwxyz123456`

## ⚙️ **Step 3: Add to Environment Variables**

Add these to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## 🎯 **Step 4: Install Cloudinary SDK**

Run this command in your terminal:

```bash
npm install cloudinary next-cloudinary
```

## 📦 **Free Tier Limits**

- ✅ **25GB Storage**
- ✅ **25GB Bandwidth/month**
- ✅ **1000 transformations/month**
- ✅ **Unlimited uploads**
- ✅ **CDN delivery**
- ✅ **Auto-optimization**

## 🚀 **Ready-to-Use Integration**

The integration code is already prepared in the admin panel for:

- 📸 **Product image uploads**
- 🖼️ **Gallery management**
- 🔄 **Automatic resizing**
- ⚡ **CDN delivery**
- 🎨 **Image transformations**

## 🎉 **That's It!**

Once you add your credentials, the admin panel will automatically handle:
- Image uploads for products
- Automatic optimization
- Different sizes for thumbnails/full images
- Fast CDN delivery worldwide

---

**💡 Pro Tip**: Cloudinary automatically optimizes images for web delivery, reducing load times and improving user experience!