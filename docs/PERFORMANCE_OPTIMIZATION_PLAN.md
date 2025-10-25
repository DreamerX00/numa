# 🚀 Performance Optimization Action Plan
**Based on PageSpeed Insights Report - Oct 24, 2025**

## 📊 Current Metrics
- **Performance Score:** 84/100
- **FCP:** 1.0s ✅
- **LCP:** 3.8s 🟡 (Target: <2.5s)
- **TBT:** 80ms ✅
- **CLS:** 0 ✅
- **Speed Index:** 5.5s 🔴 (Target: <3.4s)

---

## 🎯 Priority Action Items

### **P0 - CRITICAL (Immediate Action Required)**

#### 1. **Optimize Image Delivery** (Est. savings: 23 KiB)

**Issues:**
- Images not using modern formats (WebP/AVIF)
- Missing responsive image sizing
- No lazy loading on some images
- Large image dimensions

**Solutions:**

```typescript
// Update next.config.ts - Add image optimization
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'], // ✅ Add modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      // ... existing patterns
    ],
  },
};
```

**Component Updates:**
```tsx
// Use Next.js Image component with priority for hero images
import Image from 'next/image';

// Hero/above-fold images
<Image 
  src="/hero.jpg" 
  alt="Hero" 
  width={1920} 
  height={1080}
  priority // ✅ Preload critical images
  quality={85} // ✅ Balanced quality
/>

// Below-fold images
<Image 
  src="/product.jpg" 
  alt="Product" 
  width={800} 
  height={600}
  loading="lazy" // ✅ Lazy load
  placeholder="blur" // ✅ Add blur placeholder
/>
```

**Cloudinary Optimization:**
```typescript
// lib/cloudinary.ts - Add automatic format detection
export function getOptimizedImageUrl(publicId: string, options = {}) {
  return cloudinary.url(publicId, {
    fetch_format: 'auto', // ✅ Auto WebP/AVIF
    quality: 'auto', // ✅ Auto quality
    width: 800,
    crop: 'scale',
    dpr: 'auto', // ✅ Device pixel ratio
    ...options
  });
}
```

---

#### 2. **Remove Legacy JavaScript** (Est. savings: 12 KiB)

**Issues:**
- Using older JavaScript syntax
- Polyfills for modern browsers
- Unnecessary babel transforms

**Solutions:**

```typescript
// next.config.ts - Update browser targets
const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Target modern browsers only
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
};
```

**Update .browserslistrc:**
```
# .browserslistrc
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 11
not op_mini all
```

---

#### 3. **Reduce Unused JavaScript** (Est. savings: 22 KiB)

**Issues:**
- Importing entire libraries when only using few functions
- Large bundle sizes
- No code splitting

**Solutions:**

```tsx
// ❌ Bad: Import entire library
import * as Icons from 'lucide-react';

// ✅ Good: Import only what you need
import { Heart, ShoppingCart, User } from 'lucide-react';

// ❌ Bad: Import all of framer-motion
import { motion } from 'framer-motion';

// ✅ Good: Use LazyMotion for smaller bundle
import { LazyMotion, domAnimation, m } from 'framer-motion';

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }}>Content</m.div>
</LazyMotion>
```

**Dynamic Imports for Heavy Components:**
```tsx
// app/profile/page.tsx
import dynamic from 'next/dynamic';

// ✅ Lazy load heavy components
const EditProfileDialog = dynamic(() => 
  import('@/components/profile/EditProfileDialog').then(mod => ({ 
    default: mod.EditProfileDialog 
  })),
  { ssr: false }
);

const OrdersTab = dynamic(() => 
  import('@/components/profile/OrdersTab'),
  { loading: () => <Skeleton /> }
);
```

---

#### 4. **Optimize LCP (3.8s → <2.5s)**

**Issues:**
- Large hero images blocking render
- Slow font loading
- Render-blocking resources

**Solutions:**

**A. Preload Critical Resources:**
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* ✅ Preconnect to external domains */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**B. Optimize Hero Section:**
```tsx
// app/page.tsx
import Image from 'next/image';

export default function HomePage() {
  return (
    <>
      {/* ✅ Use priority for LCP image */}
      <div className="hero">
        <Image
          src="/hero-image.jpg"
          alt="Hero"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </>
  );
}
```

**C. Font Optimization:**
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // ✅ Use font-display: swap
  preload: true,
  variable: '--font-inter',
});
```

---

#### 5. **Reduce Speed Index (5.5s → <3.4s)**

**Issues:**
- Slow progressive rendering
- Heavy JavaScript execution
- Blocking resources

**Solutions:**

**A. Implement Streaming SSR:**
```tsx
// app/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      {/* ✅ Critical content renders immediately */}
      <Header />
      <HeroSection />
      
      {/* ✅ Non-critical content streams in */}
      <Suspense fallback={<ProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      
      <Suspense fallback={<CollectionsSkeleton />}>
        <Collections />
      </Suspense>
    </>
  );
}
```

**B. Reduce Main Thread Work:**
```tsx
// Use web workers for heavy computations
// lib/workers/productFilter.worker.ts
self.addEventListener('message', (e) => {
  const { products, filters } = e.data;
  const filtered = products.filter(/* heavy filtering logic */);
  self.postMessage(filtered);
});

// In component:
const worker = new Worker(new URL('@/lib/workers/productFilter.worker', import.meta.url));
```

---

### **P1 - HIGH PRIORITY (Complete within 1 week)**

#### 6. **Accessibility Improvements** (80 → 95+)

**A. Fix Missing Alt Text:**
```tsx
// ❌ Bad
<img src="/product.jpg" />
<Image src="/hero.jpg" alt="" />

// ✅ Good
<img src="/product.jpg" alt="Gold Diamond Ring" />
<Image src="/hero.jpg" alt="Luxury jewelry collection banner" width={1200} height={600} />
```

**B. Add ARIA Labels to Buttons:**
```tsx
// ❌ Bad
<button onClick={handleClick}>
  <Heart />
</button>

// ✅ Good
<button 
  onClick={handleClick}
  aria-label="Add to wishlist"
  aria-pressed={isWishlisted}
>
  <Heart />
</button>
```

**C. Fix Link Names:**
```tsx
// ❌ Bad
<Link href="/product/123">
  <Image src="/product.jpg" alt="" />
</Link>

// ✅ Good
<Link href="/product/123" aria-label="View Diamond Necklace details">
  <Image src="/product.jpg" alt="Diamond Necklace" />
</Link>
```

**D. Improve Color Contrast:**
```css
/* Update globals.css or tailwind config */
/* Ensure text meets WCAG AA standards */
:root {
  --muted-foreground: hsl(240 3.8% 46.1%); /* ❌ Might be too light */
  --muted-foreground: hsl(240 5% 34%);     /* ✅ Better contrast */
}
```

**E. Fix Heading Order:**
```tsx
// ❌ Bad: Skipping levels
<h1>Page Title</h1>
<h3>Subsection</h3>

// ✅ Good: Sequential order
<h1>Page Title</h1>
<h2>Main Section</h2>
<h3>Subsection</h3>
```

---

#### 7. **Minimize Main Thread Work** (3.4s)

**Solutions:**

**A. Code Splitting:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
    ],
  },
};
```

**B. Debounce Heavy Operations:**
```tsx
// hooks/useDebounce.ts - Already exists, use it more!
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300); // ✅ Reduce API calls
  
  useEffect(() => {
    if (debouncedQuery) {
      // Fetch search results
    }
  }, [debouncedQuery]);
}
```

**C. Virtualize Long Lists:**
```tsx
// For product grids with many items
import { useVirtualizer } from '@tanstack/react-virtual';

function ProductGrid({ products }) {
  const parentRef = useRef(null);
  
  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
  });
  
  return (
    <div ref={parentRef} className="overflow-auto h-screen">
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <ProductCard key={virtualRow.key} product={products[virtualRow.index]} />
      ))}
    </div>
  );
}
```

---

#### 8. **Avoid Long Main Thread Tasks**

**Issues:**
- 2 long tasks found (>50ms)
- Blocking JavaScript execution

**Solutions:**

```tsx
// Break up long tasks with scheduler API
import { startTransition } from 'react';

function HeavyOperation() {
  startTransition(() => {
    // ✅ Non-urgent updates
    setProducts(expensiveComputation());
  });
}

// Or use setTimeout to yield to browser
async function processLargeArray(items) {
  const chunks = chunkArray(items, 100);
  
  for (const chunk of chunks) {
    await new Promise(resolve => setTimeout(resolve, 0)); // ✅ Yield
    processChunk(chunk);
  }
}
```

---

#### 9. **Optimize DOM Size**

**Current Issue:**
- Large DOM tree slowing down rendering

**Solutions:**

```tsx
// ✅ Use pagination instead of rendering everything
function ProductList({ products }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 24;
  
  const displayedProducts = products.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  return (
    <>
      <ProductGrid products={displayedProducts} />
      <Pagination page={page} onChange={setPage} />
    </>
  );
}

// ✅ Remove unnecessary wrapper divs
// ❌ Bad
<div className="container">
  <div className="wrapper">
    <div className="inner">
      <ProductCard />
    </div>
  </div>
</div>

// ✅ Good
<ProductCard />
```

---

### **P2 - MEDIUM PRIORITY (Complete within 2 weeks)**

#### 10. **Best Practices Issues**

**A. Fix Console Errors:**
```typescript
// Add error boundaries
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>Something went wrong.</h2>;
    }

    return this.props.children;
  }
}
```

**B. Fix Image Aspect Ratios:**
```tsx
// ❌ Bad: No aspect ratio specified
<Image src="/product.jpg" width={400} height={300} />

// ✅ Good: Maintain aspect ratio
<div className="relative aspect-[4/3]">
  <Image 
    src="/product.jpg" 
    fill 
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>
```

**C. Enhance CSP Headers:**
```typescript
// Update security-headers.ts
export function securityHeaders() {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.razorpay.com https://res.cloudinary.com",
      "frame-src 'self' https://accounts.google.com https://api.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}
```

---

## 🎯 **Quick Wins (Implement Today)**

### 1. Add Image Optimization Config
```bash
# Update next.config.ts with modern image formats
```

### 2. Fix Missing Alt Text
```bash
# Run: grep -r "alt=\"\"" src/
# Fix all instances
```

### 3. Add Preconnect Links
```tsx
// app/layout.tsx
<link rel="preconnect" href="https://res.cloudinary.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
```

### 4. Enable Font Display Swap
```tsx
// Update font imports
display: 'swap'
```

### 5. Add Priority to Hero Images
```tsx
<Image priority src="/hero.jpg" alt="Hero banner" />
```

---

## 📈 **Expected Improvements After Implementation**

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Performance | 84 | 95+ | +11 points |
| LCP | 3.8s | 2.0s | -1.8s (47%) |
| Speed Index | 5.5s | 3.0s | -2.5s (45%) |
| Accessibility | 80 | 95+ | +15 points |
| Bundle Size | ~220KB | ~180KB | -40KB (18%) |

---

## 🔍 **Monitoring & Testing**

### 1. **Set Up Performance Monitoring**
```typescript
// app/layout.tsx
export function reportWebVitals(metric) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics
    console.log(metric);
  }
}
```

### 2. **Regular Audits**
```bash
# Run Lighthouse in CI/CD
npm run lighthouse

# Test on real devices
npm run test:perf
```

### 3. **Bundle Analysis**
```bash
npm run build -- --analyze
```

---

## 📋 **Implementation Checklist**

- [ ] Add image optimization config (formats: webp, avif)
- [ ] Add preconnect/dns-prefetch for external domains
- [ ] Use `priority` prop for hero images
- [ ] Implement dynamic imports for heavy components
- [ ] Add font-display: swap to all fonts
- [ ] Fix all missing alt text
- [ ] Add ARIA labels to icon buttons
- [ ] Fix heading hierarchy
- [ ] Improve color contrast ratios
- [ ] Add error boundaries
- [ ] Fix console errors
- [ ] Enhance CSP headers
- [ ] Implement lazy loading for images
- [ ] Add virtualization for long lists
- [ ] Use Suspense boundaries for streaming
- [ ] Optimize Cloudinary image delivery
- [ ] Remove unused JavaScript
- [ ] Add performance monitoring
- [ ] Set up bundle analysis

---

## 🚦 **Traffic Light System**

- 🔴 **Red (Urgent):** LCP, Speed Index, Image optimization
- 🟡 **Yellow (Important):** Accessibility fixes, unused JS
- 🟢 **Green (Nice to have):** Further optimizations, monitoring

---

## 📞 **Need Help?**

- PageSpeed Insights: https://pagespeed.web.dev/
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- Web.dev Performance: https://web.dev/performance/
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
