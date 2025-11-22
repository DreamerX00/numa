import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ProductClientActions } from "@/components/product/ProductClientActions";
import ProductReviews from "@/components/reviews/ProductReviews";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";
import { Star, Truck, Shield, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/services/catalog";
import type { Product as ProductType } from "@/lib/types/product";

// Enable static generation with ISR
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow dynamic routes

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static paths for products at build time
// Commented out to prevent database connection during build
// Pages will be generated on-demand (SSR) instead
// export async function generateStaticParams() {
//   try {
//     const products = await prisma.product.findMany({
//       where: {
//         isActive: true,
//         status: "ACTIVE",
//       },
//       select: {
//         slug: true,
//       },
//       take: 100, // Generate top 100 products at build time
//     });
//
//     return products.map((product) => ({
//       slug: product.slug,
//     }));
//   } catch (error) {
//     console.error("Error generating static params:", error);
//     return [];
//   }
// }

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        shortDescription: true,
        price: true,
        comparePrice: true,
        images: true,
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
        averageRating: true,
        reviewCount: true,
      },
    });

    if (!product) {
      return {
        title: "Product Not Found",
      };
    }

    const title = `${product.name} | Numa`;
    const description =
      product.shortDescription ||
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at the best price`;
    const imageUrl = product.images[0] || DEFAULT_IMAGES.PRODUCT;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/product/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | Numa",
    };
  }
}

// Main product page component (Server Component)
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // Fetch settings for dynamic values
  const settings = await getSettings();

  // Fetch product data on server
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
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
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Calculate pricing
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  // Check stock status
  const inStock = product.quantity > 0;
  const lowStock = product.quantity > 0 && product.quantity <= 10;

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription || "",
    image: product.images,
    sku: product.sku || product.id,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://numaiin.vercel.app"}/product/${slug}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating:
      product.reviewCount && product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.averageRating || 0,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li>/</li>
            {product.category && (
              <>
                <li>
                  <Link
                    href={`/collection/${product.category.slug}`}
                    className="hover:text-foreground"
                  >
                    {product.category.name}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images - Server Rendered */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={product.images[0] || DEFAULT_IMAGES.PRODUCT}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {hasDiscount && (
                <Badge className="absolute top-4 right-4 bg-red-500">
                  {discountPercentage}% OFF
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="absolute top-4 left-4 bg-blue-500">
                  Featured
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-primary"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {/* Rating */}
              {product.reviewCount && product.reviewCount > 0 ? (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.averageRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.averageRating?.toFixed(1)} ({product.reviewCount}{" "}
                    reviews)
                  </span>
                </div>
              ) : (
                <div className="mb-4 text-sm text-muted-foreground">
                  No reviews yet
                </div>
              )}

              {/* Brand */}
              {product.brand && (
                <p className="text-sm text-muted-foreground mb-4">
                  Brand:{" "}
                  <span className="text-foreground font-medium">
                    {product.brand.name}
                  </span>
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.comparePrice!)}
                    </span>
                    <Badge variant="destructive">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {inStock ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">In Stock</span>
                    {lowStock && (
                      <span className="text-orange-600 text-sm">
                        (Only {product.quantity} left!)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-muted-foreground mb-6">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Client-side Actions (Add to Cart, Wishlist, Share) */}
            <ProductClientActions
              product={product as unknown as ProductType}
              inStock={inStock}
            />

            {/* Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span>
                  Free delivery on orders over ₹
                  {settings.shipping.freeShippingThreshold}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <span>7-day easy returns</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>100% authentic products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <div className="prose max-w-none text-muted-foreground">
              {product.description}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12 border-t pt-8">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </Container>
    </>
  );
}
