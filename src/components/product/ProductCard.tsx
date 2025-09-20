import Link from 'next/link';
import Image from 'next/image';
import { MockProduct } from '../../mocks/fixtures/products';
import { formatPrice } from '../../mocks/fixtures/products';

interface ProductCardProps { product: MockProduct; }

export function ProductCard({ product }: ProductCardProps) {
  const v = product.variants[0];
  return (
    <Link href={`/product/${product.slug}`} className="group relative rounded-lg overflow-hidden shadow-card bg-white border border-base-border">
      <div className="aspect-[4/5] w-full overflow-hidden">
        <Image src={v.images[0]} alt={product.name} width={600} height={750} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium tracking-tight line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-xs text-base-muted line-clamp-1">{product.subtitle}</p>
        <p className="mt-2 text-sm font-semibold">{formatPrice(v.priceCents)}</p>
      </div>
      {product.badges?.includes('NEW') && <span className="absolute left-2 top-2 rounded-full bg-brand text-white px-2 py-0.5 text-[10px] font-medium">NEW</span>}
      {product.badges?.includes('LIMITED') && <span className="absolute left-2 top-2 rounded-full bg-base-ink/80 text-white px-2 py-0.5 text-[10px] font-medium">LIMITED</span>}
      {product.badges?.includes('SALE') && <span className="absolute left-2 top-2 rounded-full bg-brand-dark text-white px-2 py-0.5 text-[10px] font-medium">SALE</span>}
    </Link>
  );
}

export default ProductCard;
