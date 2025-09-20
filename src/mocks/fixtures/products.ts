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
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&crop=center','https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&crop=center']
      },
      {
        id: 'p1v2',
        sku: 'SRG-18K-7',
        size: '7',
        metal: '18K Gold',
        priceCents: 125000,
        stock: 4,
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&crop=center','https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&crop=center']
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
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&crop=center','https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&crop=center']
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
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&crop=center']
      }
    ]
  },
  {
    id: 'p4',
    slug: 'celestial-diamond-ring',
    name: 'Celestial Diamond Ring',
    subtitle: 'Sparkling brilliance',
    description: 'Elegant solitaire with brilliant cut diamond centerpiece.',
    badges: ['NEW'],
    materials: ['Platinum'],
    gemstones: ['Diamond'],
    collections: ['signature', 'rings'],
    createdAt: new Date(now - 5 * 86400000).toISOString(),
    variants: [
      {
        id: 'p4v1',
        sku: 'CDR-PT-6',
        size: '6',
        metal: 'Platinum',
        priceCents: 299000,
        stock: 8,
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop&crop=center']
      }
    ]
  },
  {
    id: 'p5',
    slug: 'aurora-chain-necklace',
    name: 'Aurora Chain Necklace',
    subtitle: 'Delicate layering piece',
    description: 'Fine chain necklace perfect for daily elegance.',
    badges: [],
    materials: ['Gold'],
    gemstones: [],
    collections: ['necklaces'],
    createdAt: new Date(now - 12 * 86400000).toISOString(),
    variants: [
      {
        id: 'p5v1',
        sku: 'ACN-14K-18',
        size: '18',
        metal: '14K Gold',
        priceCents: 89000,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop&crop=center']
      }
    ]
  },
  {
    id: 'p6',
    slug: 'moonstone-drop-earrings',
    name: 'Moonstone Drop Earrings',
    subtitle: 'Ethereal elegance',
    description: 'Graceful drops featuring luminous moonstone gems.',
    badges: ['LIMITED'],
    materials: ['Silver'],
    gemstones: ['Moonstone'],
    collections: ['earrings'],
    createdAt: new Date(now - 8 * 86400000).toISOString(),
    variants: [
      {
        id: 'p6v1',
        sku: 'MDE-SLV',
        metal: 'Sterling Silver',
        priceCents: 119000,
        stock: 6,
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&crop=center']
      }
    ]
  }
];

export const mockCollections = [
  { slug: 'signature', name: 'Signature Edit', heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&crop=center' },
  { slug: 'rings', name: 'Rings', heroImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop&crop=center' },
  { slug: 'necklaces', name: 'Necklaces', heroImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop&crop=center' },
  { slug: 'earrings', name: 'Earrings', heroImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop&crop=center' }
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
