# Most Loved Products Carousel - Implementation Guide

**Date Created**: October 25, 2025  
**Inspired By**: [Gold Digger - Most Loved Products Section](https://golddigger.in/)  
**Component**: `MostLovedProductsCarousel.tsx`

## Overview

The "Most Loved Products" carousel is a premium, horizontally-scrollable product showcase featuring:
- Circular product image frames (matching Gold Digger's design)
- Sale badges for discounted items
- Price comparison (original vs. sale price)
- Responsive carousel with navigation controls
- Wishlist functionality
- Quick view buttons
- Smooth animations and transitions

## Visual Design

### Layout
```
┌─────────────────────────────────────────┐
│   Most Loved Products (Heading)         │
│   Discover the jewelry pieces...        │
├─────────────────────────────────────────┤
│  ◄  [O]  [O]  [O]  [O]  [O]  ►         │
│     Product 1  Product 2  Product 3    │
│     Price Info | Quick View Button     │
├─────────────────────────────────────────┤
│   1  ● ○ ○ ○  of 4                    │
│              View All Products         │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints

| Screen Size | Items Shown | Gap |
|-------------|------------|-----|
| Mobile (<640px) | 1.5 items | 1rem |
| Tablet (640-1024px) | 3 items | 1.5rem |
| Desktop (>1024px) | 5 items | 1.5rem |

## Component Features

### 1. Circular Product Images
- **Aspect Ratio**: 1:1 (square, displayed as circular with `rounded-full`)
- **Image Handling**: Uses Next.js Image component for optimization
- **Hover Effect**: Scale up to 1.05 with brightness increase
- **Loading State**: Animated skeleton loader

### 2. Sale Badge
- **Position**: Top-left corner
- **Appearance**: Dark background with white text, circular shape
- **Visibility**: Only shows if product has discount
- **Animation**: Spring animation on component mount

### 3. Wishlist Button
- **Position**: Top-right corner
- **Icon**: Heart icon (lucide-react)
- **Visibility**: Appears only on hover
- **Behavior**: Scale animation on interaction

### 4. Product Information
- **Product Name**: 2-line clamp with hover color change
- **Price Display**:
  - Sale Price (bold, in brand color)
  - Original Price (strikethrough, gray)
  - Discount Percentage badge (red background)
- **Quick View Button**: Full-width, prominent CTA

### 5. Navigation Controls
- **Previous/Next Buttons**: Circular buttons on sides
- **State Management**: Disabled when at boundaries
- **Animations**: Scale and shadow effects on hover
- **Mobile**: Positioned outside the carousel (-left-4 and -right-4)

### 6. Carousel Indicators
Shows current position and total number of "pages"
```
1 ● ○ ○ ○ of 4
```
- Click dots to jump to specific pages
- Animated dot sizing based on active state
- Responsive text size

## Code Structure

### Props
```typescript
interface MostLovedProductsCarouselProps {
  products: Product[];  // Array of products from Prisma
}
```

### Key State Variables
```typescript
const [currentIndex, setCurrentIndex] = useState(0);  // Current scroll position
const [itemsPerView, setItemsPerView] = useState(5);  // Items visible at once
```

### Key Functions
```typescript
goToPrevious()     // Move carousel left
goToNext()         // Move carousel right
handleResize()     // Recalculate items per view on window resize
```

## Animations

### Carousel Scroll
- **Type**: Spring animation
- **Stiffness**: 300
- **Damping**: 30
- **Smooth, bouncy feel for premium experience**

### Image Hover
- **Scale**: 1 → 1.1 (10% zoom)
- **Duration**: 500ms
- **Easing**: ease

### Product Card Hover
- **Y-axis**: 0 → -8px (lift effect)
- **Duration**: 300ms

### Product Info Animation
- **Type**: Fade-in and slide-up
- **Stagger**: 50ms between items
- **Viewport-based**: Only animates when visible

## Integration with Home Page

### Import
```tsx
import { MostLovedProductsCarousel } from "./MostLovedProductsCarousel";
```

### Usage
```tsx
// In AnimatedHomePage component
<MostLovedProductsCarousel products={featured} />
```

**Placement**: Between Featured Products and Collections sections

### Data Flow
```
HomePage (page.tsx)
  ↓
  fetchFeaturedProducts() 
  ↓
  AnimatedHomePage <featured={featured}>
  ↓
  MostLovedProductsCarousel <products={featured}>
```

## Styling Details

### Colors
- **Background**: White to light gray gradient (`from-white to-gray-50`)
- **Text Primary**: Dark gray (`text-gray-900`)
- **Text Secondary**: Medium gray (`text-gray-600`)
- **Accent**: Brand color (from theme)
- **Badge**: Dark background with white text
- **Discount**: Red background (`bg-red-50`)

### Typography
- **Heading**: 24px (md), 32px (lg), 700 weight
- **Product Name**: 14px (md), 16px (lg), 600 weight
- **Pricing**: 16px (md), 18px (lg), 700 weight
- **Button Text**: 12px (md), 14px (lg)

### Spacing
- **Section Padding**: 80px vertical
- **Gap between items**: 16px (sm), 24px (md/lg)
- **Header spacing**: 64px bottom margin
- **Button spacing**: 48px top margin

## Performance Optimizations

### Image Optimization
```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
```
- Lazy loading for non-visible images
- Responsive sizing for different breakpoints
- Format optimization (WebP/AVIF via Next.js)

### Animation Performance
- GPU-accelerated transforms (translate-x)
- Uses Framer Motion for optimized animations
- Will-change hints for frequently animated elements

### Responsive Calculation
- Debounced resize listener
- Recalculates items per view only on actual changes
- Prevents unnecessary re-renders

## Accessibility Features

### Semantic HTML
- Links wrapped in proper anchor tags
- Button elements for interactive controls
- Proper heading hierarchy

### Keyboard Navigation
- All buttons are keyboard accessible
- Focus states preserved through animations
- Tab order maintained

### Screen Readers
- Alt text on all images
- Descriptive link text
- Aria-labels on icon buttons (future enhancement)

### Mobile Accessibility
- Touch-friendly button sizes (minimum 44x44px)
- Proper spacing for touch interaction
- Readable text sizes on all devices

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge 90+ | ✅ Full | Recommended |
| Firefox 88+ | ✅ Full | Recommended |
| Safari 15+ | ✅ Full | Recommended |
| Mobile Safari (iOS 15+) | ✅ Full | Touch-optimized |
| Chrome Mobile | ✅ Full | Touch-optimized |

## Future Enhancements

1. **Swipe Gestures**: Add touch swipe support for mobile
2. **Auto-play**: Option to auto-advance carousel
3. **Wishlist Integration**: Connect to actual wishlist
4. **Reviews**: Show star ratings
5. **Color Variants**: Display available color options
6. **Quick Add to Cart**: Direct add-to-cart from carousel
7. **Personalization**: Show "recommended for you" vs "most loved"
8. **Analytics**: Track carousel interactions

## Testing Checklist

- [ ] Responsive on mobile (< 640px)
- [ ] Responsive on tablet (640-1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Carousel navigation works smoothly
- [ ] Indicators work correctly
- [ ] Images load properly
- [ ] Animations are smooth (60fps)
- [ ] Hover effects display correctly
- [ ] Wishlist button appears on hover
- [ ] Sale badge shows for discounted items
- [ ] Pricing displays correctly
- [ ] Quick View button navigates properly
- [ ] Loading state displays correctly
- [ ] Touch/swipe works on mobile
- [ ] Keyboard navigation works
- [ ] Accessibility features functional
- [ ] No layout shift during load

## Troubleshooting

### Images not showing
- Check product image URLs are valid
- Verify Cloudinary configuration
- Check DEFAULT_IMAGES.PRODUCT fallback

### Carousel not scrolling
- Check products array length
- Verify itemsPerView calculation
- Check window resize listener is attached

### Animations stuttering
- Check browser performance
- Reduce animation complexity
- Use GPU-accelerated properties only

### Mobile issues
- Verify responsive breakpoints
- Check touch event handling
- Test on actual devices

## Files Modified

- `src/components/pages/MostLovedProductsCarousel.tsx` - New component
- `src/components/pages/AnimatedHomePage.tsx` - Added import and component usage
- `src/app/page.tsx` - No changes needed (data already fetched)

## References

- Gold Digger Website: https://golddigger.in/
- Framer Motion Docs: https://www.framer.com/motion/
- Next.js Image Component: https://nextjs.org/docs/api-reference/next/image
