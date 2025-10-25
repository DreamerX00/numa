"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/services/catalog";
import type { Product } from "@prisma/client";

interface MostLovedProductsCarouselProps {
  products: Product[];
}

export function MostLovedProductsCarousel({
  products,
}: MostLovedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1.5);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  const maxIndex = Math.max(0, products.length - Math.ceil(itemsPerView));
  const canGoNext = currentIndex < maxIndex;
  const canGoPrevious = currentIndex > 0;

  const goToPrevious = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goToNext = () =>
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  return (
    <motion.section
      className="py-20 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <Container>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Most Loved Products
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Discover the jewelry pieces that our customers adore
          </p>
        </motion.div>

        <div className="relative mb-12">
          <div className="w-full overflow-hidden">
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{
                x: `calc(${-currentIndex * (100 / Math.ceil(itemsPerView))}% - ${currentIndex * (1.5 / Math.ceil(itemsPerView))}rem)`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
              }}
            >
              {products.length > 0
                ? products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      itemsPerView={itemsPerView}
                      index={index}
                    />
                  ))
                : Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonCard
                      key={`skeleton-${index}`}
                      itemsPerView={itemsPerView}
                    />
                  ))}
            </motion.div>
          </div>

          {products.length > Math.ceil(itemsPerView) && (
            <>
              <motion.button
                onClick={goToPrevious}
                disabled={!canGoPrevious}
                className={`absolute left-0 top-1/2 z-10 p-3 rounded-full transition-all transform -translate-y-1/2 -translate-x-16 ${
                  canGoPrevious
                    ? "bg-white shadow-lg hover:shadow-xl text-gray-900"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                whileHover={canGoPrevious ? { scale: 1.1 } : {}}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                onClick={goToNext}
                disabled={!canGoNext}
                className={`absolute right-0 top-1/2 z-10 p-3 rounded-full transition-all transform -translate-y-1/2 translate-x-16 ${
                  canGoNext
                    ? "bg-white shadow-lg hover:shadow-xl text-gray-900"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                whileHover={canGoNext ? { scale: 1.1 } : {}}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>

        <motion.div
          className="flex justify-center items-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm font-medium text-gray-700">
            {Math.floor(currentIndex / Math.ceil(itemsPerView)) + 1}
          </span>
          <div className="flex gap-2">
            {Array.from({
              length: Math.ceil(products.length / Math.ceil(itemsPerView)),
            }).map((_, pageIndex) => (
              <motion.button
                key={pageIndex}
                onClick={() =>
                  setCurrentIndex(
                    Math.min(pageIndex * Math.ceil(itemsPerView), maxIndex)
                  )
                }
                className={`transition-all ${
                  pageIndex ===
                  Math.floor(currentIndex / Math.ceil(itemsPerView))
                    ? "bg-brand w-8 h-2 rounded-full"
                    : "bg-gray-300 w-2 h-2 rounded-full hover:bg-gray-400"
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">
            of {Math.ceil(products.length / Math.ceil(itemsPerView))}
          </span>
        </motion.div>
      </Container>
    </motion.section>
  );
}

function ProductCard({
  product,
  itemsPerView,
  index,
}: {
  product: Product;
  itemsPerView: number;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.[0] || DEFAULT_IMAGES.PRODUCT;
  const secondaryImage = product.images?.[1] || primaryImage;
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  return (
    <motion.div
      className="flex-shrink-0"
      style={{
        width: `calc((100% - ${(Math.ceil(itemsPerView) - 1) * 1.5}rem) / ${Math.ceil(itemsPerView)})`,
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -12 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Link href={`/product/${product.slug}`}>
          <motion.div
            className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-gray-100 cursor-pointer"
            initial={{ boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)" }}
            whileHover={{ boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Primary Image */}
            <motion.div
              className="w-full h-full relative"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 30vw, 18vw"
                priority={index < 3}
              />
            </motion.div>

            {/* Secondary Image Swap */}
            <AnimatePresence>
              {isHovered && secondaryImage !== primaryImage && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={secondaryImage}
                    alt={`${product.name} view`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 30vw, 18vw"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sale Badge */}
            {hasDiscount && (
              <motion.div
                className="absolute top-3 left-3 z-10"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: isHovered ? 1.1 : 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Badge className="bg-red-600 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
                  Sale
                </Badge>
              </motion.div>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <motion.div
                className="absolute bottom-3 right-3 z-10"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: isHovered ? 1.1 : 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: 0.05,
                }}
              >
                <div className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  -{discountPercentage}%
                </div>
              </motion.div>
            )}

            {/* Wishlist Button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="absolute top-3 right-3 z-20 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
              initial={{ scale: 0, rotate: -45 }}
              animate={{
                scale: isHovered ? 1 : 0,
                rotate: isHovered ? 0 : -45,
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Heart className="w-5 h-5 text-red-500" />
            </motion.button>

            {/* Dark Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </Link>

        {/* Product Info */}
        <motion.div
          className="flex flex-col flex-grow"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 + 0.1, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <Link href={`/product/${product.slug}`}>
            <motion.h3
              className="text-sm md:text-base font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer"
              animate={{ color: isHovered ? "#E7654D" : "#111827" }}
              transition={{ duration: 0.2 }}
            >
              {product.name}
            </motion.h3>
          </Link>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-bold text-brand text-base">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              className="w-full text-xs md:text-sm font-semibold rounded-lg shadow-sm"
              asChild
            >
              <Link href={`/product/${product.slug}`}>Quick View</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function SkeletonCard({ itemsPerView }: { itemsPerView: number }) {
  return (
    <div
      className="flex-shrink-0"
      style={{
        width: `calc((100% - ${(Math.ceil(itemsPerView) - 1) * 1.5}rem) / ${Math.ceil(itemsPerView)})`,
      }}
    >
      <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mx-auto mb-3" />
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
