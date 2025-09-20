import { fetchCollections } from '../../mocks/services/catalog';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: 'Collections • NUMA' };

export default async function CollectionsPage() {
  const cols = await fetchCollections();
  return (
    <div className="container py-16">
      <div className="flex items-end justify-between mb-10">
        <h1 className="font-serif text-3xl tracking-tight">Collections</h1>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cols.map(col => (
          <Link key={col.slug} href={`/collection/${col.slug}`} className="group rounded-xl overflow-hidden border border-base-border bg-white shadow-card">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <Image src={col.heroImage} alt={col.name} width={600} height={450} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
