import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/product/ProductCard';
import { ChevronRight, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enable static generation with ISR
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow dynamic routes

interface Props { 
  params: Promise<{ slug: string }> 
}

// Generate static paths for collections at build time
// Commented out to prevent database connection during build
// Pages will be generated on-demand (SSR) instead
// export async function generateStaticParams() {
//   try {
//     const categories = await prisma.category.findMany({
//       where: {
//         isActive: true,
//       },
//       select: {
//         slug: true,
//       },
//       take: 50, // Generate top 50 categories at build time
//     });
//
//     return categories.map((category) => ({
//       slug: category.slug,
//     }));
//   } catch (error) {
//     console.error('Error generating static params for collections:', error);
//     return [];
//   }
// }

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const category = await prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        name: true,
        description: true,
        image: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return {
        title: 'Collection Not Found',
      };
    }

    const title = `${category.name} Collection | Numa`;
    const description =
      category.description ||
      `Explore our curated collection of ${category.name.toLowerCase()}. Browse ${category._count.products} premium products crafted with elegance and precision.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: category.image
          ? [
              {
                url: category.image,
                width: 1200,
                height: 630,
                alt: category.name,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: category.image ? [category.image] : [],
      },
      alternates: {
        canonical: `/collection/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for collection:', error);
    return {
      title: 'Collection | Numa',
    };
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  
  // Fetch category and products on server
  const category = await prisma.category.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
    },
  });

  if (!category) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: category.id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { updatedAt: 'desc' },
    ],
    take: 100,
  });

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `Browse our ${category.name} collection`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://numaiin.vercel.app'}/collection/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://numaiin.vercel.app'}/product/${product.slug}`,
          image: product.images[0],
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.quantity > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        },
      })),
    },
  };
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-brand-light/30 to-white">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-brand transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/collections" className="hover:text-brand transition-colors">
                Collections
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
          </div>
        </div>

        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Enhanced Header Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl tracking-tight text-foreground mb-4">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {category.description || `Discover our exquisite collection of ${category.name.toLowerCase()} crafted with precision and elegance`}
              </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{products.length}</span>
              <span>product{products.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
          
          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-4 order-2 sm:order-1">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <select className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all duration-200">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
          {/* Enhanced Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          
          {/* Empty State (if needed) */}
          {products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">No products found in this collection.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
