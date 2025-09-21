import { fetchProductsByCollection, fetchCollections } from '../../../lib/services/catalog';
import ProductCard from '../../../components/product/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Filter, SortAsc } from 'lucide-react';
import type { Product } from '@prisma/client';

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const cols = await fetchCollections();
  return cols.map((c: { slug: string }) => ({ slug: c.slug }));
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const products = await fetchProductsByCollection(slug);
  if (!products.length) return notFound();
  
  const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light/30 to-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-brand transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/collections" className="hover:text-brand transition-colors">
              Collections
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{categoryName}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8 lg:py-12">
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl tracking-tight text-foreground mb-4">
              {categoryName}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our exquisite collection of {categoryName.toLowerCase()} crafted with precision and elegance
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{products.length}</span>
              <span>product{products.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
          
          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-4 order-2 sm:order-1">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-brand/50 transition-all duration-200 bg-white hover:bg-brand/5">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
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
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
          {products.map((p: Product) => (
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
  );
}
