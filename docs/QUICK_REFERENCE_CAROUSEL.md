# Quick Reference - Most Loved Products Carousel

## 📍 Location
- **Component File**: `src/components/pages/MostLovedProductsCarousel.tsx`
- **Used In**: `src/components/pages/AnimatedHomePage.tsx`
- **Visible On**: Homepage, between hero carousel and collections section

## 🎯 Key Features

### Visual Elements
- 🔵 **Circular Images** - Products in round frames
- 🏷️ **Sale Badge** - Black badge with "Sale" text (top-left)
- 💰 **Price Display** - Original (strikethrough), Sale, & Discount %
- ❤️ **Wishlist Button** - Heart icon (appears on hover, top-right)
- 🔘 **Quick View Button** - Full-width CTA below product

### Navigation
- ◀️ **Previous Arrow** - Navigate left
- ▶️ **Next Arrow** - Navigate right
- 🔹 **Dot Indicators** - Click to jump to page
- 📊 **Position Counter** - "1 of 4" display

## 📱 Responsive Breakpoints

| Device | Items | Gap |
|--------|-------|-----|
| Mobile | 1.5 | 16px |
| Tablet | 3 | 24px |
| Desktop | 5 | 24px |

## 🎨 Customization

### Props
```tsx
<MostLovedProductsCarousel products={featured} />
```

### Change Items Per View
```tsx
// In MostLovedProductsCarousel.tsx
if (window.innerWidth < 640) {
  setItemsPerView(2);  // Change from 1.5
}
```

### Change Colors
```tsx
// Badge color
className="bg-gray-900"  // Change to your brand color

// Button color (uses default brand from theme)
<Button ... />
```

### Change Animation Speed
```tsx
// In carousel scroll
animate={{ x: `-${currentIndex * ...}%` }}
transition={{
  stiffness: 300,  // Increase for faster snap
  damping: 30,     // Increase for less bounce
}}
```

## 🔧 Common Issues & Solutions

### Images Not Showing
```tsx
// Check if images exist
console.log(products[0].images);

// Fallback to DEFAULT_IMAGES.PRODUCT
src={product.images?.[0] || DEFAULT_IMAGES.PRODUCT}
```

### Carousel Not Scrolling
```tsx
// Check product count
console.log(products.length);

// Check items per view
console.log(itemsPerView);

// Should have: products.length > itemsPerView
```

### Animations Stuttering
- Check browser performance
- Verify `transform` only (not position changes)
- Use DevTools Performance tab

## 📊 Component Props & State

```tsx
// Props
products: Product[]

// State
currentIndex: number          // Current position
itemsPerView: number         // Items visible
maxIndex: number             // Maximum scroll position
canGoNext: boolean           // Can navigate forward
canGoPrevious: boolean       // Can navigate backward
```

## 🎬 Animation Speeds

| Element | Duration |
|---------|----------|
| Carousel Scroll | Spring (natural) |
| Image Zoom | 300ms |
| Image Hover | 500ms transform |
| Badge Entrance | Spring (200ms+) |
| Product Card Lift | 300ms |

## 💡 Tips & Tricks

### To Show More Products
```tsx
// Increase featured products fetched in page.tsx
featured = featured.slice(0, 12);  // Show 12 instead of 8
```

### To Auto-Scroll Carousel
```tsx
// Add to component
useEffect(() => {
  const timer = setInterval(() => {
    goToNext();
  }, 5000);  // Scroll every 5 seconds
  return () => clearInterval(timer);
}, [currentIndex, maxIndex]);
```

### To Disable Navigation Arrows
```tsx
// Find this section and set conditional rendering
{products && products.length > Math.ceil(itemsPerView) && (
  // Arrow buttons appear only when needed
)}
```

### To Change Button Text
```tsx
<Button size="sm" className="w-full text-xs md:text-sm rounded-lg" asChild>
  <Link href={`/product/${product.slug}`}>
    View Details  {/* Change from "Quick View" */}
  </Link>
</Button>
```

## 📈 Monitoring & Analytics

### Events to Track
```javascript
// Clicks
- Product click (goes to product page)
- Wishlist click
- Quick View click
- Navigation arrow clicks
- Dot indicator clicks

// View metrics
- Carousel loads
- Products shown
- Scroll distance
```

## 🧪 Testing Checklist

Quick tests to run:
- [ ] Products display correctly
- [ ] Images load (check Network tab)
- [ ] Previous/Next buttons work
- [ ] Dot indicators work
- [ ] Wishlist button appears on hover
- [ ] Sale badge shows for discounts
- [ ] Mobile responsive (640px)
- [ ] Tablet responsive (1024px)
- [ ] Desktop layout (1200px+)

## 🔗 Related Files

```
src/
├── components/pages/
│   ├── MostLovedProductsCarousel.tsx ← Main component
│   ├── AnimatedHomePage.tsx ← Uses component
│   └── ...
├── lib/
│   └── services/
│       └── catalog.ts ← formatPrice function
└── types/
    └── ... ← Product type from Prisma
```

## 📚 Documentation

- Full docs: `docs/MOST_LOVED_PRODUCTS_CAROUSEL.md`
- Design comparison: `docs/DESIGN_INSPIRATION_GOLDDIGGER.md`
- Collections design: `docs/COLLECTIONS_DESIGN_SPECS.md`

## ⚡ Performance Tips

1. **Image Optimization**
   - Use WebP format in Cloudinary
   - Set proper image sizes
   - Enable lazy loading

2. **Animation Performance**
   - Use transform/opacity only
   - Avoid layout-shifting properties
   - Test on 60fps target

3. **Bundle Size**
   - Component is ~10KB
   - Uses existing dependencies
   - No new packages added

## 🎓 Learning Resources

- Framer Motion: https://www.framer.com/motion/
- Next.js Image: https://nextjs.org/docs/api-reference/next/image
- Responsive Design: https://web.dev/responsive-web-design-basics/
- Touch Events: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

## 🚀 Next Steps

1. ✅ Component created and integrated
2. ✅ Fully responsive
3. ✅ Animations working
4. → [ ] Add swipe gesture support
5. → [ ] Integrate real wishlist
6. → [ ] Add product reviews
7. → [ ] Analytics tracking

---

**Last Updated**: October 25, 2025  
**Component Status**: ✅ Production Ready  
**Browser Support**: ✅ Modern browsers (Chrome 90+, Firefox 88+, Safari 15+)
