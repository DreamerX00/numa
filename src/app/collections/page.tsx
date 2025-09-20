import { fetchCollections } from '../../lib/services/catalog';
import { DEFAULT_IMAGES } from '@/lib/cloudinary';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="container py-6 md:py-8">
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <h1 className="font-serif text-2xl md:text-3xl tracking-tight">Collections</h1>
      </div>
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cols.map((col: Collection) => (
          <Link key={col.slug} href={`/collection/${col.slug}`} className="group rounded-xl overflow-hidden border border-base-border bg-white shadow-card">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <Image 
                src={col.heroImage || DEFAULT_IMAGES.CATEGORY} 
                alt={col.name} 
                width={600} 
                height={450} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="font-medium text-sm tracking-tight">{col.name}</span>
              <span className="text-xs text-base-muted group-hover:text-brand-dark transition-colors">Shop →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
