"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";
import { ArrowRight, Shield, Truck, Award, Star, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from "../../lib/services/catalog";
import type { Product } from "@prisma/client";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  overlay?: string;
  order: number;
}

// Fetch carousel slides from database
async function fetchCarouselSlides(): Promise<CarouselSlide[]> {
  try {
    const response = await fetch('/api/carousel', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch carousel slides: ${response.status}`);
    }
    
    const slides = await response.json();
    return slides.length > 0 ? slides : fallbackCarouselSlides;
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    return fallbackCarouselSlides;
  }
}

// Fallback carousel data (used if database is empty)
const fallbackCarouselSlides: CarouselSlide[] = [
  {
    id: "fallback-1",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=600&fit=crop&crop=center",
    title: "New Heritage Collection",
    subtitle: "Timeless Elegance Redefined", 
    description: "Discover our latest collection inspired by royal heritage and crafted with precision",
    ctaText: "Explore Collection",
    ctaLink: "/collections/heritage",
    overlay: "bg-gradient-to-r from-black/70 to-black/20",
    order: 0
  },
  {
    id: "fallback-2",
    image: "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=1200&h=600&fit=crop&crop=center",
    title: "Bridal Splendor",
    subtitle: "Your Perfect Wedding Jewelry",
    description: "Exquisite pieces designed to make your most special day unforgettable",
    ctaText: "Shop Bridal",
    ctaLink: "/collections/bridal", 
    overlay: "bg-gradient-to-r from-brand/80 to-brand/20",
    order: 1
  },
  {
    id: "fallback-3",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=600&fit=crop&crop=center",
    title: "Diamond Luxe",
    subtitle: "Brilliance Beyond Compare",
    description: "Premium diamond jewelry for those who appreciate the finest in life",
    ctaText: "View Diamonds", 
    ctaLink: "/collections/diamonds",
    overlay: "bg-gradient-to-r from-gray-900/80 to-gray-900/20",
    order: 2
  },
  {
    id: "fallback-4",
    image: "https://images.unsplash.com/photo-1506629905077-bc2dd2cd5bce?w=1200&h=600&fit=crop&crop=center",
    title: "Exclusive Earrings",
    subtitle: "Elegance in Every Detail",
    description: "Handcrafted earrings that complement your unique style",
    ctaText: "Shop Earrings",
    ctaLink: "/collections/earrings",
    overlay: "bg-gradient-to-r from-purple-900/80 to-purple-900/20",
    order: 3
  }
];

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  }
};

const staggeredContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Carousel animation variants
const carouselVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

interface AnimatedHomePageProps {
  featured: Product[];
  collections: Array<{
    slug: string;
    name: string;
    image?: string | null;
    heroImage?: string;
  }>;
}

export function AnimatedHomePage({ featured, collections }: AnimatedHomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(fallbackCarouselSlides);

  // Debug logging
  useEffect(() => {
    console.log('🏠 HomePage Debug:', {
      featuredCount: featured?.length || 0,
      collectionsCount: collections?.length || 0,
      featured: featured?.map(p => ({ id: p.id, name: p.name, isFeatured: p.isFeatured })) || []
    });
  }, [featured, collections]);

  // Fetch carousel slides on component mount
  useEffect(() => {
    const loadCarouselSlides = async () => {
      try {
        console.log('🎠 AnimatedHomePage: Loading carousel slides...');
        const slides = await fetchCarouselSlides();
        console.log('🎠 AnimatedHomePage: Setting carousel slides:', slides.length);
        setCarouselSlides(slides);
      } catch (error) {
        console.error('🎠 AnimatedHomePage: Failed to load carousel slides:', error);
        // Keep fallback slides if fetch fails
      }
    };
    
    loadCarouselSlides();
  }, []);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prevSlide) => {
      if (newDirection === 1) {
        return (prevSlide + 1) % carouselSlides.length;
      } else {
        return prevSlide === 0 ? carouselSlides.length - 1 : prevSlide - 1;
      }
    });
  }, [carouselSlides.length]);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [currentSlide, carouselSlides.length, paginate]);

  return (
    <motion.div 
      className="flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Carousel - Inspired by Palmonas, Tanishq, Giva */}
      <section className="relative h-[60vh] lg:h-[70vh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              <Image
                src={carouselSlides[currentSlide].image}
                alt={carouselSlides[currentSlide].title}
                fill
                className="object-cover"
                priority
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 ${carouselSlides[currentSlide].overlay}`} />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <Container>
                  <motion.div 
                    className="max-w-2xl text-white"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <motion.p 
                      className="text-sm md:text-base font-light mb-2 tracking-wider opacity-90"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      {carouselSlides[currentSlide].subtitle}
                    </motion.p>
                    
                    <motion.h1 
                      className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      {carouselSlides[currentSlide].title}
                    </motion.h1>
                    
                    <motion.p 
                      className="text-lg md:text-xl mb-8 opacity-90 max-w-lg"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      {carouselSlides[currentSlide].description}
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.6 }}
                    >
                      <Button 
                        size="lg" 
                        className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
                        asChild
                      >
                        <Link href={carouselSlides[currentSlide].ctaLink || '/collections'}>
                          {carouselSlides[currentSlide].ctaText || 'Shop Now'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </Container>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300"
          onClick={() => paginate(1)}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
              }}
            />
          ))}
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-light/20 via-background to-brand-light/10 py-8 lg:py-12">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute inset-0 bg-grid-black/[0.02] -z-10"
          animate={{
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden -z-5">
          {[
            { left: 8.4, top: 83.7, delay: 0 },
            { left: 12.8, top: 52.2, delay: 0.5 },
            { left: 69.8, top: 65.8, delay: 1.0 },
            { left: 37.0, top: 90.6, delay: 1.5 },
            { left: 99.9, top: 46.4, delay: 0.3 },
            { left: 17.3, top: 62.3, delay: 0.8 }
          ].map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-brand-accent/20 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [-20, -60, -20],
                x: [-10, 10, -10],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div 
              className="flex flex-col space-y-4 justify-center"
              variants={containerVariants}
            >
              <motion.div className="space-y-2" variants={itemVariants}>
                <motion.div 
                  className="flex items-center gap-2"
                  variants={itemVariants}
                >
                  <motion.div
                    variants={floatingVariants}
                    animate="animate"
                  >
                    <Image
                      src="/numaLogo.png"
                      alt="NUMA"
                      width={48}
                      height={48}
                      className="rounded-lg shadow-lg floating-element"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="bg-brand-light text-brand border-brand/20 shimmer-effect text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New Collection
                    </Badge>
                  </motion.div>
                </motion.div>
                
                <motion.h1 
                  className="text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl leading-tight"
                  variants={itemVariants}
                >
                  <motion.span
                    className="inline-block"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    𝙔𝙤𝙪𝙧 𝙚𝙣𝙚𝙧𝙜𝙮,
                    <p> 𝙊𝙪𝙧 𝙚𝙡𝙚𝙢𝙚𝙣𝙩 🫶🏻</p>
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-base text-muted-foreground max-w-lg leading-relaxed"
                  variants={itemVariants}
                >
                  anti-tarnish jewels that get you 💅 
                  <br />
                  <span className="text-brand font-medium">Crafted with precision, worn with confidence</span>
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" asChild>
                    <Link href="/collections">
                      Shop Collections
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/about">
                      Our Story
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 pt-2"
                variants={itemVariants}
              >
                <motion.div 
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, staggerChildren: 0.1 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 1.2 + i * 0.1,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
                    </motion.div>
                  ))}
                </motion.div>
                <motion.p 
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Featured Products Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-2 mt-0 lg:mt-0"
              variants={staggeredContainer}
            >
              {featured.slice(0, 4).map((product, index) => {
                const primaryImage = product.images?.[0] || DEFAULT_IMAGES.PRODUCT;
                const hasDiscount = product.comparePrice && product.comparePrice > product.price;
                
                return (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover="hover"
                    initial="rest"
                    className={index === 0 ? 'col-span-2' : ''}
                  >
                    <motion.div variants={cardHoverVariants}>
                      <Card 
                        className={`group overflow-hidden border border-brand/10 shadow-lg hover:shadow-xl hover:border-brand/30 transition-all duration-300 hover-lift`}
                      >
                        <Link href={`/product/${product.slug}`}>
                          <div className={`relative overflow-hidden ${index === 0 ? 'aspect-[2/1]' : 'aspect-square'} bg-muted rounded-lg`}>
                            <Image
                              src={primaryImage}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                            />
                            {product.isFeatured && (
                              <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                  delay: 0.5 + index * 0.1,
                                  type: "spring",
                                  stiffness: 200 
                                }}
                              >
                                <Badge className="absolute left-3 top-3 bg-brand-accent text-brand shadow-lg pulse-glow">
                                  FEATURED
                                </Badge>
                              </motion.div>
                            )}
                            {hasDiscount && (
                              <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                  delay: 0.5 + index * 0.1,
                                  type: "spring",
                                  stiffness: 200 
                                }}
                              >
                                <Badge className="absolute right-3 top-3 bg-red-500 text-white shadow-lg pulse-glow">
                                  SALE
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-sm mb-1 group-hover:text-brand transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">{product.shortDescription || product.description}</p>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-brand">{formatPrice(product.price)}</p>
                              {hasDiscount && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatPrice(product.comparePrice!)}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Features Section - Professional & Minimal */}
      <motion.section 
        className="py-16 bg-[#FAF9F7]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Container>
          <motion.div 
            className="grid gap-12 md:grid-cols-3"
            variants={staggeredContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Ethically Sourced",
                description: "Materials from audited suppliers ensuring responsible practices."
              },
              {
                icon: Award,
                title: "Limited Releases", 
                description: "Small batch craftsmanship for uniqueness and sustainability."
              },
              {
                icon: Truck,
                title: "Lasting Finish",
                description: "Engineered coatings to resist daily wear and retain luster."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="group text-center"
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Icon Container */}
                <motion.div 
                  className="relative mx-auto mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-white border-2 border-[#E7654D]/20 flex items-center justify-center shadow-sm group-hover:border-[#E7654D] group-hover:shadow-md transition-all duration-300"
                    whileHover={{ 
                      backgroundColor: "#E7654D",
                      borderColor: "#E7654D"
                    }}
                  >
                    <motion.div
                      whileHover={{ color: "white" }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="h-7 w-7 text-[#E7654D] group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Content */}
                <div className="space-y-3">
                  <motion.h3 
                    className="font-semibold text-lg text-gray-900"
                    whileHover={{ color: "#E7654D" }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 leading-relaxed max-w-xs mx-auto"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>

                {/* Subtle accent line */}
                <motion.div 
                  className="mt-6 mx-auto h-0.5 bg-[#E7654D]/20 transition-all duration-500 group-hover:bg-[#E7654D]"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "30%" }}
                  transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
                  whileHover={{ width: "50%" }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators - Simplified */}
          <motion.div 
            className="mt-16 pt-12 border-t border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-12 text-center"
              variants={staggeredContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { stat: "10,000+", label: "Happy Customers" },
                { stat: "99.9%", label: "Customer Satisfaction" },
                { stat: "500+", label: "Unique Designs" },
                { stat: "24/7", label: "Customer Support" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="group"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="text-2xl font-bold text-[#E7654D] mb-1"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.stat}
                  </motion.div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </motion.section>

      {/* Collections Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Container>
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight animated-gradient-text">
                Featured Collections
              </h2>
              <p className="text-muted-foreground">Discover our curated jewelry collections</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" asChild>
                <Link href="/collections">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggeredContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {collections.slice(0, 4).map((collection) => (
              <motion.div
                key={collection.slug}
                variants={itemVariants}
                whileHover="hover"
                initial="rest"
              >
                <motion.div variants={cardHoverVariants}>
                  <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
                    <Link href={`/collection/${collection.slug}`}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={collection.image || collection.heroImage || DEFAULT_IMAGES.CATEGORY}
                          alt={collection.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold group-hover:text-brand transition-colors">
                            {collection.name}
                          </h3>
                          <motion.div
                            initial={{ x: 0 }}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </motion.section>
    </motion.div>
  );
}