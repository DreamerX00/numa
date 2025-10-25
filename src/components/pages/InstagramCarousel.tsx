"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Heart, MessageCircle } from "lucide-react";

interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  postUrl: string;
}

interface InstagramCarouselProps {
  posts?: InstagramPost[];
}

// Mock Instagram data - in production, this would come from Instagram API
const mockInstagramPosts: InstagramPost[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    likes: 1250,
    comments: 42,
    caption: "✨ New collection drops today! Ethically sourced, beautifully crafted 🤍",
    postUrl: "https://instagram.com/numa.iin",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1515562141207-6811bcb33ce1?w=400&h=400&fit=crop",
    likes: 2150,
    comments: 78,
    caption: "Waistchains that make you feel like a diva ✨ #NumaJewelry",
    postUrl: "https://instagram.com/numa.iin",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1599643478102-b2a0db2c11a1?w=400&h=400&fit=crop",
    likes: 1890,
    comments: 56,
    caption: "Matching sets for matching vibes 💫",
    postUrl: "https://instagram.com/numa.iin",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
    likes: 3420,
    comments: 124,
    caption: "Limited edition drops - get them before they're gone! 🔥",
    postUrl: "https://instagram.com/numa.iin",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
    likes: 2780,
    comments: 89,
    caption: "Your favorite pieces are back in stock! Shop now 💎",
    postUrl: "https://instagram.com/numa.iin",
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1515377905703-c28bde4cb853?w=400&h=400&fit=crop",
    likes: 2340,
    comments: 67,
    caption: "Sustainable luxury jewelry for the modern woman ✨",
    postUrl: "https://instagram.com/numa.iin",
  },
];

export function InstagramCarousel({ posts = mockInstagramPosts }: InstagramCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1440) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted) return null;

  const maxIndex = Math.max(0, posts.length - Math.ceil(itemsPerView));
  const canGoNext = currentIndex < maxIndex;
  const canGoPrevious = currentIndex > 0;

  const goToPrevious = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goToNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  return (
    <motion.section
      className="py-20 bg-gradient-to-b from-white via-gray-50 to-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <Container>
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.25-.148-4.772-1.701-4.919-4.919-.057-1.265-.069-1.645-.069-4.849 0-3.204.013-3.583.069-4.849.148-3.226 1.671-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Follow Us on Instagram
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Join our community for daily inspiration and exclusive behind-the-scenes looks
          </p>
          <a
            href="https://instagram.com/numa.iin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.25-.148-4.772-1.701-4.919-4.919-.057-1.265-.069-1.645-.069-4.849 0-3.204.013-3.583.069-4.849.148-3.226 1.671-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
            </svg>
            Visit Our Instagram
          </a>
        </motion.div>

        {/* Instagram Posts Grid/Carousel */}
        <div className="relative mb-12">
          {/* Carousel Container */}
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
              {posts.map((post, index) => (
                <InstagramPost key={post.id} post={post} index={index} itemsPerView={itemsPerView} />
              ))}
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          {posts.length > Math.ceil(itemsPerView) && (
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
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
              length: Math.ceil(posts.length / Math.ceil(itemsPerView)),
            }).map((_, pageIndex) => (
              <motion.button
                key={pageIndex}
                onClick={() =>
                  setCurrentIndex(Math.min(pageIndex * Math.ceil(itemsPerView), maxIndex))
                }
                className={`transition-all ${
                  pageIndex === Math.floor(currentIndex / Math.ceil(itemsPerView))
                    ? "bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 w-8 h-2 rounded-full"
                    : "bg-gray-300 w-2 h-2 rounded-full hover:bg-gray-400"
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">
            of {Math.ceil(posts.length / Math.ceil(itemsPerView))}
          </span>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          
          
        </motion.div>
      </Container>
    </motion.section>
  );
}

// Instagram Post Card Component
function InstagramPost({
  post,
  index,
  itemsPerView,
}: {
  post: InstagramPost;
  index: number;
  itemsPerView: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

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
      <a
        href={post.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        <motion.div
          className="relative overflow-hidden rounded-xl aspect-square bg-gray-200 group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Instagram Post Image */}
          <Image
            src={post.image}
            alt="Instagram post"
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
            priority={index < 4}
          />

          {/* Overlay on Hover */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-2 text-white"
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
            >
              {/* Likes Counter */}
              <motion.div
                className="flex flex-col items-center gap-1"
                whileHover={{ scale: 1.1 }}
              >
                <Heart className="w-6 h-6 fill-white" />
                <span className="text-sm font-semibold">
                  {(post.likes / 1000).toFixed(1)}k
                </span>
              </motion.div>

              {/* Comments Counter */}
              <motion.div
                className="flex flex-col items-center gap-1"
                whileHover={{ scale: 1.1 }}
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-semibold">{post.comments}</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Instagram Icon Badge */}
          <motion.div
            className="absolute top-3 right-3 z-10"
            initial={{ scale: 0, rotate: -45 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: index * 0.08 + 0.1,
            }}
            viewport={{ once: true }}
          >
            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md">
              <svg
                className="w-5 h-5 text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.25-.148-4.772-1.701-4.919-4.919-.057-1.265-.069-1.645-.069-4.849 0-3.204.013-3.583.069-4.849.148-3.226 1.671-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
              </svg>
            </div>
          </motion.div>

          {/* Caption preview at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white text-xs line-clamp-2 font-medium">{post.caption}</p>
          </motion.div>
        </motion.div>
      </a>
    </motion.div>
  );
}
