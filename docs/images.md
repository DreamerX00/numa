# Sample Images for NUMA Jewelry Website

This document lists the placeholder images currently used for the NUMA jewelry e-commerce website during development.

## Image Sources

All images are sourced from **Unsplash**, a free stock photo platform with high-quality jewelry and fashion images that are free to use for both personal and commercial projects.

### Product Images

#### Rings
- **Gold Ring**: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338`
- **Diamond Ring**: `https://images.unsplash.com/photo-1605100804763-247f67b3557e`

#### Necklaces
- **Pearl/Chain Necklaces**: `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f`

#### Earrings
- **Stud/Drop Earrings**: `https://images.unsplash.com/photo-1535632066927-ab7c9ab60908`

### Collection Hero Images
- **Signature Collection**: Ring showcase
- **Rings Collection**: Diamond ring detail
- **Necklaces Collection**: Elegant necklace display
- **Earrings Collection**: Modern earring style

## Image Optimization

All images are served through Unsplash's CDN with the following optimizations:
- **Width**: 600px (products) / 800px (collections)
- **Height**: 600px
- **Crop**: Center crop for consistent aspect ratios
- **Format**: Automatic format optimization by Unsplash

## Usage Parameters

```
?w=600&h=600&fit=crop&crop=center
```

- `w=600`: Width of 600 pixels
- `h=600`: Height of 600 pixels  
- `fit=crop`: Crop to exact dimensions
- `crop=center`: Center the crop area

## Next.js Configuration

The `next.config.ts` file has been configured to allow images from:
- `images.unsplash.com` - Primary source for jewelry images
- `picsum.photos` - Backup placeholder service

## Licensing

All Unsplash images are free to use under the [Unsplash License](https://unsplash.com/license):
- ✅ Free for commercial and personal use
- ✅ No attribution required (but appreciated)
- ✅ Can be modified and redistributed

## For Production

When moving to production, consider:
1. **Replace with actual product photography**
2. **Optimize images for web delivery**
3. **Use a CDN for faster loading**
4. **Implement lazy loading for better performance**
5. **Add proper alt text for accessibility**

## Alternative Free Sources

If you need more variety:
- **Pexels**: https://www.pexels.com/search/jewelry/
- **Pixabay**: https://pixabay.com/images/search/jewelry/
- **Picsum Photos**: https://picsum.photos/ (abstract placeholders)