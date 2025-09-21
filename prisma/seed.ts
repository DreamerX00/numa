import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'rings' },
      update: {},
      create: {
        name: 'Rings',
        slug: 'rings',
        description: 'Beautiful rings for every occasion',
        isActive: true,
        sortOrder: 1
      }
    }),
    prisma.category.upsert({
      where: { slug: 'necklaces' },
      update: {},
      create: {
        name: 'Necklaces',
        slug: 'necklaces',
        description: 'Elegant necklaces and pendants',
        isActive: true,
        sortOrder: 2
      }
    }),
    prisma.category.upsert({
      where: { slug: 'earrings' },
      update: {},
      create: {
        name: 'Earrings',
        slug: 'earrings',
        description: 'Stunning earrings for every style',
        isActive: true,
        sortOrder: 3
      }
    }),
    prisma.category.upsert({
      where: { slug: 'bracelets' },
      update: {},
      create: {
        name: 'Bracelets',
        slug: 'bracelets',
        description: 'Stylish bracelets and bangles',
        isActive: true,
        sortOrder: 4
      }
    }),
    prisma.category.upsert({
      where: { slug: 'signature' },
      update: {},
      create: {
        name: 'Signature Collection',
        slug: 'signature',
        description: 'Our exclusive signature pieces',
        isActive: true,
        sortOrder: 5
      }
    })
  ]);

  console.log('✅ Categories created');

  // Create Sponsors (instead of brands)
  await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'de-beers' },
      update: {},
      create: {
        name: 'De Beers',
        slug: 'de-beers',
        description: 'Diamond mining and trading company',
        isActive: true
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'gemological-institute' },
      update: {},
      create: {
        name: 'Gemological Institute',
        slug: 'gemological-institute',
        description: 'Certified gemstone authentication',
        isActive: true
      }
    }),
    prisma.brand.upsert({
      where: { slug: 'swiss-gold' },
      update: {},
      create: {
        name: 'Swiss Gold Refiners',
        slug: 'swiss-gold',
        description: 'Premium gold and precious metals',
        isActive: true
      }
    })
  ]);

  console.log('✅ Sponsors created');

  // Create Products
  const products = [
    {
      name: 'Sunrise Gold Ring',
      slug: 'sunrise-gold-ring',
      description: 'Hand-finished ring capturing the first light shimmer with 18K gold and citrine gemstone',
      shortDescription: 'Radiant 18K finish with citrine',
      price: 125000,
      comparePrice: 135000,
      sku: 'SRG-18K-001',
      quantity: 12,
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'
      ],
      categoryId: categories[0].id, // Rings
      status: 'ACTIVE' as const,
      isActive: true,
      isFeatured: true,
      tags: ['gold', 'citrine', 'signature']
    },
    {
      name: 'Luna Pearl Necklace',
      slug: 'luna-pearl-necklace',
      description: 'Minimalist strand highlighting organic pearl forms with sterling silver clasp',
      shortDescription: 'Freshwater pearls with silver clasp',
      price: 189000,
      comparePrice: 205000,
      sku: 'LPN-SLV-001',
      quantity: 8,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'
      ],
      categoryId: categories[1].id, // Necklaces
      status: 'ACTIVE' as const,
      isActive: true,
      isFeatured: true,
      tags: ['pearl', 'silver', 'minimal']
    },
    {
      name: 'Ember Stud Earrings',
      slug: 'ember-stud-earrings',
      description: 'Understated gold pieces reflecting subtle inner glow with polished finish',
      shortDescription: 'Polished minimal gold studs',
      price: 75000,
      comparePrice: 85000,
      sku: 'ESE-GLD-001',
      quantity: 15,
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'
      ],
      categoryId: categories[2].id, // Earrings
      status: 'ACTIVE' as const,
      isActive: true,
      isFeatured: false,
      tags: ['gold', 'minimal', 'studs']
    },
    {
      name: 'Diamond Tennis Bracelet',
      slug: 'diamond-tennis-bracelet',
      description: 'Classic tennis bracelet featuring brilliant cut diamonds in 18K white gold setting',
      shortDescription: 'Brilliant diamond tennis bracelet',
      price: 350000,
      comparePrice: 380000,
      sku: 'DTB-WG-001',
      quantity: 5,
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'
      ],
      categoryId: categories[3].id, // Bracelets
      status: 'ACTIVE' as const,
      isActive: true,
      isFeatured: true,
      tags: ['diamond', 'white-gold', 'luxury']
    }
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData
    });
  }

  console.log('✅ Products created');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });