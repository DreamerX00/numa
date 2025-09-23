import { fetchCollections } from '../../lib/services/catalog';
import { DEFAULT_IMAGES } from '@/lib/cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Collections • NUMA' };

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  heroImage: string | null;
  productCount: number;
}

export default async function CollectionsPage() {
  const cols = await fetchCollections();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header Section */}
      <section className="relative overflow-hidden bg-white border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand-accent/10" />
        <div className="relative">
          <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                <span className="block font-serif">Our Collections</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                Discover our carefully curated collections of fine jewelry, each piece crafted with 
                precision and designed to celebrate life&apos;s most precious moments.
              </p>
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Package className="h-4 w-4" />
                <span>{cols.length} Collections Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {cols.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cols.map((collection: Collection) => (
                <article key={collection.id} className="group relative">
                  <Link 
                    href={`/collection/${collection.slug}`}
                    className="block"
                  >
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:shadow-lg hover:ring-brand/20">
                      {/* Image Container */}
                      <div className="aspect-[4/3] overflow-hidden">
                        <Image
                          src={collection.heroImage || collection.image || DEFAULT_IMAGES.CATEGORY}
                          alt={collection.name}
                          width={400}
                          height={300}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand transition-colors">
                              {collection.name}
                            </h3>
                            {collection.description && (
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {collection.description}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="ml-4 h-5 w-5 text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand" />
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {collection.productCount} {collection.productCount === 1 ? 'Item' : 'Items'}
                          </span>
                          <span className="text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                            Explore →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto max-w-md">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No Collections Available</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Collections will appear here once they are created.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
