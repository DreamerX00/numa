# Collections Section - Design Specifications

## Component Structure

### Section Container
```
Container
├── Header (Centered)
│   ├── Heading: "Collections"
│   └── Subtitle: "Explore our curated jewelry collections..."
├── Collections Grid (Masonry Layout)
│   ├── Collection Card 1 (LARGE - Row-span-2 on lg)
│   │   ├── Image Container
│   │   ├── Gradient Overlay (appears on hover)
│   │   └── Text Content (animates on hover)
│   ├── Collection Card 2
│   └── ... more cards
└── View All Collections Button
```

## Responsive Breakpoints

### Mobile (< 768px)
- 1 column layout
- Full-width collection cards
- min-height: 350px
- No row-span modifications

### Tablet (768px - 1024px)
- 2 column layout
- min-height: 350px
- First and fourth items: row-span-2 (visual hierarchy)

### Desktop (> 1024px)
- 3 column layout
- min-height: 450px
- Large items (0, 3): md:aspect-[4/5]
- Regular items: aspect-[3/4]
- First and fourth items: md:row-span-2

## Hover Animations

### Image Transform
```css
/* Default state */
transform: scale(1);
opacity: 100%;
brightness: 100%;
transition: all 0.7s ease;

/* Hover state */
transform: scale(1.1);
opacity: 100%;
brightness: 110%;
```

### Gradient Overlay
```css
/* Default state */
opacity: 0;
background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3), transparent);

/* Hover state */
opacity: 1;
transition: opacity 0.4s ease;
```

### Text Content (Collection Name & CTA)
```css
/* Default state */
transform: translateY(20px);
opacity: 0;

/* Hover state - staggered animation */
1. Collection Name: translateY(0), opacity: 1 (delay: 0ms)
2. CTA: translateY(0), opacity: 1 (delay: 50ms)
```

## Color Scheme

- **Background**: Pure white (#FFFFFF)
- **Text (Header)**: Dark gray (#111827)
- **Text (Subtitle)**: Medium gray (#4B5563)
- **Overlay Gradient**: Black with alpha (70% to 30% to 0%)
- **Text Overlay**: White (#FFFFFF)
- **Accent Color**: Primary brand color (from theme)

## Typography

### Heading
- Font Size: 36px (md), 48px (lg)
- Font Weight: 700 (bold)
- Line Height: Tight
- Letter Spacing: Default

### Subtitle
- Font Size: 18px
- Font Weight: 400 (normal)
- Color: Medium gray
- Max Width: 42rem (centered)

### Collection Name (Overlay)
- Font Size: 20px (md), 24px (lg)
- Font Weight: 600 (semibold)
- Color: White
- Letter Spacing: 0.05em (tracking-wide)

### CTA Text
- Font Size: 14px
- Font Weight: 300 (light)
- Letter Spacing: 0.1em (uppercase)
- Color: White

## Spacing & Dimensions

- Section Padding: 96px vertical (py-24)
- Gap Between Cards: 24px (md), 32px (lg)
- Card Border Radius: 8px
- Padding in Overlay Content: 24px (md), 32px (lg)
- Section Margin Top (to features): 64px (mt-16)

## Transitions & Durations

| Element | Duration | Easing |
|---------|----------|--------|
| Image Zoom | 700ms | ease | 
| Gradient Overlay | 400ms | ease |
| Text Slide-up | 400ms | ease |
| Text Stagger | 50ms between items | - |
| Scale (Cards) | 300ms | ease |
| Shadow | 500ms | - |

## Loading State

- Aspect ratio maintained during load
- HeartLoader animation centered in placeholder
- Background color: muted theme color
- Border radius: 8px
- Skeleton animation: pulse effect

## Accessibility

- All collections wrapped in semantic Link elements
- Proper alt text on images
- Focus states preserved through Framer Motion
- Touch-friendly hover areas (minimum 44x44px)
- Semantic heading hierarchy (h2 > h3)

## Performance Optimizations

1. **Image Sizing**: 
   - Mobile: 100vw
   - Tablet: 50vw  
   - Desktop: 33vw

2. **Lazy Loading**: Images below fold use lazy loading

3. **Animation Optimization**: 
   - GPU-accelerated transforms (translate, scale)
   - Will-change hints for frequently animated elements

4. **Loading States**: Skeletons prevent layout shift

## Grid Configuration

```jsx
<motion.div 
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
>
  // Grid items with conditional row-span
  // idx === 0 or idx === 3 → md:row-span-2
</motion.div>
```

## Animation Sequence

### Page Load
1. Container animates in (opacity: 0 → 1)
2. Header fades in with slide-up
3. Collection cards stagger in with slight delay
4. Each card: scale 1 → 1.02 on mount

### Hover State
1. Image scales 1 → 1.1 (700ms)
2. Overlay appears (400ms)
3. Text slides up into view (400ms, 50ms stagger)
4. Shadow enhances

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari 15+, Chrome Mobile)

## Testing Checklist

- [ ] Responsive on mobile, tablet, desktop
- [ ] Hover effects smooth and performant
- [ ] Images load correctly
- [ ] Loading states display properly
- [ ] Navigation works on all links
- [ ] Animations smooth on 60fps
- [ ] Touch interactions work on mobile
- [ ] Accessibility features functional
- [ ] No layout shifts during load
