export interface MockProductVariant {
  id: string;
  sku: string;
  size?: string;
  metal?: string;
  priceCents: number;
  compareAtCents?: number;
  stock: number;
  images: string[];
}

export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description?: string;
  badges?: string[];
  materials: string[];
  gemstones: string[];
  collections: string[];
  variants: MockProductVariant[];
  createdAt: string;
}

const now = Date.now();

export const mockProducts: MockProduct[] = [
  {
    id: 'p1',
    slug: 'sunrise-gold-ring',
    name: 'Sunrise Gold Ring',
    subtitle: 'Radiant 18K finish',
    description: 'Hand‑finished ring capturing the first light shimmer.',
    badges: ['NEW'],
    materials: ['Gold'],
    gemstones: ['Citrine'],
    collections: ['signature', 'rings'],
    createdAt: new Date(now - 3 * 86400000).toISOString(),
    variants: [
      {
        id: 'p1v1',
        sku: 'SRG-18K-6',
        size: '6',
        metal: '18K Gold',
        priceCents: 125000,
        stock: 12,
        images: ['/images/products/ring1-1.jpg','/images/products/ring1-2.jpg']
      },
      {
        id: 'p1v2',
        sku: 'SRG-18K-7',
        size: '7',
        metal: '18K Gold',
        priceCents: 125000,
        stock: 4,
        images: ['/images/products/ring1-1.jpg','/images/products/ring1-2.jpg']
      }
    ]
  },
  {
    id: 'p2',
    slug: 'luna-pearl-necklace',
    name: 'Luna Pearl Necklace',
    subtitle: 'Freshwater pearls',
    description: 'Minimalist strand highlighting organic pearl forms.',
    badges: ['LIMITED'],
    materials: ['Silver'],
    gemstones: ['Pearl'],
    collections: ['signature','necklaces'],
    createdAt: new Date(now - 18 * 86400000).toISOString(),
    variants: [
      {
        id: 'p2v1',
        sku: 'LPN-SLV-16',
        size: '16',
        metal: 'Sterling Silver',
        priceCents: 189000,
        compareAtCents: 205000,
        stock: 2,
        images: ['/images/products/necklace1-1.jpg','/images/products/necklace1-2.jpg']
      }
    ]
  },
  {
    id: 'p3',
    slug: 'ember-stud-earrings',
    name: 'Ember Stud Earrings',
    subtitle: 'Polished minimal form',
    description: 'Understated pieces reflecting subtle inner glow.',
    badges: ['SALE'],
    materials: ['Gold'],
    gemstones: [],
    collections: ['earrings'],
    createdAt: new Date(now - 40 * 86400000).toISOString(),
    variants: [
      {
        id: 'p3v1',
        sku: 'ESE-GLD',
        metal: 'Gold',
        priceCents: 59000,
        compareAtCents: 69000,
        stock: 25,
        images: ['/images/products/earring1-1.jpg']
      }
    ]
  }
];

export const mockCollections = [
  { slug: 'signature', name: 'Signature Edit', heroImage: '/images/collections/signature.jpg' },
  { slug: 'rings', name: 'Rings', heroImage: '/images/collections/rings.jpg' },
  { slug: 'necklaces', name: 'Necklaces', heroImage: '/images/collections/necklaces.jpg' },
  { slug: 'earrings', name: 'Earrings', heroImage: '/images/collections/earrings.jpg' }
];

export function findProductBySlug(slug: string) {
  return mockProducts.find(p => p.slug === slug) || null;
}

export function listProductsByCollection(collection: string) {
  return mockProducts.filter(p => p.collections.includes(collection));
}

export function formatPrice(cents: number, currency: string = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(cents / 100);
}
