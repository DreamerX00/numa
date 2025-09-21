import { fetchProductsByCollection, fetchCollections } from '../../../lib/services/catalog';
import ProductCard from '../../../components/product/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Filter, SortAsc, Grid3X3, List, Package } from 'lucide-react';
import type { Product } from '@prisma/client';

interface Props { 
  params: Promise<{ slug: string }> 
}

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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav className="border-b bg-white" aria-label="Breadcrumb">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </li>
            <li>
              <Link href="/collections" className="text-gray-500 hover:text-gray-700 transition-colors">
                Collections
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </li>
            <li>
              <span className="font-medium text-gray-900">{categoryName}</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Page Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              <span className="font-serif">{categoryName}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Discover our exquisite collection of {categoryName.toLowerCase()} crafted with precision and elegance
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Package className="h-4 w-4" />
              <span>{products.length} {products.length === 1 ? 'Product' : 'Products'} Available</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Controls */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-400" />
              <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto max-w-md">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No Products Found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  No products are available in this collection at the moment.
                </p>
                <Link
                  href="/collections"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"
                >
                  Browse Other Collections
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}