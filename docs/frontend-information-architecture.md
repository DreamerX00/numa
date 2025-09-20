# Frontend Information Architecture (NUMA)

This document outlines the page-level structure and route groupings for the NUMA jewelry storefront. Backend wiring is deferred; pages use mock data until APIs are integrated.

## Route Groups (Next.js App Router)

- (store)
  - `/` – Home (hero, featured products, featured collections, motto)
  - `/collections` – Collections overview
  - `/collection/[slug]` – Products filtered by collection
  - `/product/[slug]` – Product detail (gallery, variants, price)
  - `/search` – Search results + suggestions
  - `/cart` – Full cart page
  - `/checkout` – Multi-step (Address → Shipping → Review → Payment placeholder)
  - `/checkout/success` – Confirmation summary (mock)
- (account)
  - `/login` – Sign in form (mock auth)
  - `/register` – Create account (mock)
  - `/account` – Dashboard overview
  - `/account/orders` – Order history list (placeholder cards)
  - `/account/orders/[id]` – Order detail view (status timeline placeholder)
  - `/account/profile` – Profile & address management (mock persistence)
  - `/account/wishlist` – Wishlist grid (local state)
- (marketing)
  - `/about` – Brand story
  - `/care` – Jewelry care instructions
  - `/sustainability` – Sustainability statement
  - `/lookbook` – Editorial gallery (static mock)
  - `/gifts` – Seasonal / curated gift page
  - `/new-arrivals` – Latest products (date-based filter)
  - `/bestsellers` – High-demand items (badge logic placeholder)
- (legal)
  - `/privacy` – Privacy policy
  - `/terms` – Terms & conditions
  - `/refunds` – Refund & returns policy
- (admin) UI-only scaffolds
  - `/admin` – Overview dashboard (KPIs placeholders)
  - `/admin/products` – Product table
  - `/admin/products/new` – New product form (mock submit)
  - `/admin/products/[id]` – Edit form
  - `/admin/orders` – Orders table
  - `/admin/orders/[id]` – Order detail (status management placeholder)
  - `/admin/inventory` – Stock adjustment mock
  - `/admin/users` – User list placeholder
  - `/admin/content` – Content blocks (hero banners, promos) placeholder

## Cross-Cutting UI Elements

- Global Header (desktop + mobile drawer) – navigation, search trigger, account, cart badge
- Footer – motto, navigation clusters (Shop, About, Support, Legal), social placeholders
- Toast region – ephemeral feedback (add to cart, wishlist)
- Modal/Drawer portals – search command palette, cart drawer, mobile navigation

## Planned Component Mount Points

- `#portal-drawers` – mobile nav, cart drawer
- `#portal-modals` – gallery lightbox, quick view
- Toast provider near root

## Navigation Structure (Initial)

Primary (desktop): Home, Collections, Rings, Necklaces, Earrings, About, Lookbook
Utility: Search (icon), Account (icon / avatar), Cart (badge)
Footer Columns:
- Shop: Collections, New Arrivals, Bestsellers, Gifts
- Brand: About, Sustainability, Lookbook, Care
- Support: Contact (future), Shipping (future), Refunds, Sizing (future)
- Legal: Terms, Privacy

## Naming Conventions

- Components: PascalCase in `src/components`
- Feature folders: `src/components/product`, `src/components/cart`, etc.
- Mock services: `src/mocks/services/*`
- Fixtures: `src/mocks/fixtures/*`

## Phase Labels

- Phase 1 (UI Shell): Layout, header, footer, basic pages (empty states)
- Phase 2 (Catalog Visuals): Product cards, collection listing
- Phase 3 (Product Detail & Cart): Gallery, variants, add-to-cart interactions
- Phase 4 (Checkout UX): Multi-step forms & state machine (mock submission)
- Phase 5 (Account & Admin Skeletons)
- Phase 6 (Polish & Accessibility)

## Accessibility Targets

- Keyboard navigable menu and drawer
- Skip link to main content
- Descriptive alt text for hero and product imagery (placeholder until real assets)

## Open Items (To refine later)

- Final taxonomy for collections (current placeholders: signature, rings, necklaces, earrings)
- Whether engraving customization page is required
- Multi-language / currency support (deferred)

