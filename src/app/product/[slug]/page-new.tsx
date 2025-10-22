import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { ProductClient } from '@/components/product/ProductClient';
import ProductReviews from '@/components/reviews/ProductReviews';
import { fetchProduct } from '@/lib/services/catalog';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | NUMA Jewelry`,
    description: product.description || product.shortDescription || `Buy ${product.name} at NUMA Jewelry`,
    openGraph: {
      title: product.name,
      description: product.description || product.shortDescription || '',
      images: product.images.length > 0 ? [product.images[0]] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || product.shortDescription || '',
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.slug);

  if (!product) {
    return notFound();
  }

  return (
    <div className="min-h-screen">
      <Container className="py-6 md:py-8">
        <ProductClient product={product} />

        {/* Reviews Section */}
        <div className="mt-16">
          <ProductReviews
            productId={product.id}
            productName={product.name}
            showWriteReview={true}
          />
        </div>
      </Container>
    </div>
  );
}
