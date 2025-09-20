import { fetchProductsByCollection, fetchCollections } from '../../../mocks/services/catalog';
import ProductCard from '../../../components/product/ProductCard';
import { notFound } from 'next/navigation';

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const cols = await fetchCollections();
  return cols.map(c => ({ slug: c.slug }));
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const products = await fetchProductsByCollection(slug);
  if (!products.length) return notFound();
  return (
    <div className="container py-6 md:py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl tracking-tight capitalize">{slug.replace(/-/g,' ')}</h1>
          <p className="mt-2 text-sm text-base-muted">{products.length} product{products.length>1 && 's'}</p>
        </div>
        <div className="flex gap-3">
          <select className="h-10 rounded-md border border-base-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
          <button className="h-10 rounded-md border border-base-border bg-white px-4 text-sm font-medium hover:bg-base-bg focus:outline-none focus:ring-2 focus:ring-brand/30">Filters</button>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
