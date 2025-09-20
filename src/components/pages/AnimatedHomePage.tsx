"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { ArrowRight, Shield, Truck, Award, Star, Sparkles } from "lucide-react";
import { motion } from 'framer-motion';
import { formatPrice } from "../../mocks/fixtures/products";
import type { Product, Collection } from "../../mocks/types";

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
      type: "spring",
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
      ease: "easeInOut"
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
      ease: "easeOut"
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

interface AnimatedHomePageProps {
  featured: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  collections: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function AnimatedHomePage({ featured, collections }: AnimatedHomePageProps) {
  return (
    <motion.div 
      className="flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-light/20 via-background to-brand-light/10 py-20 lg:py-32">
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
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-brand-accent/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -60, -20],
                x: [-10, 10, -10],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div 
              className="flex flex-col space-y-6"
              variants={containerVariants}
            >
              <motion.div className="space-y-4" variants={itemVariants}>
                <motion.div 
                  className="flex items-center gap-3"
                  variants={itemVariants}
                >
                  <motion.div
                    variants={floatingVariants}
                    animate="animate"
                  >
                    <Image
                      src="/numaLogo.png"
                      alt="NUMA"
                      width={60}
                      height={60}
                      className="rounded-xl shadow-lg floating-element"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge variant="secondary" className="bg-brand-light text-brand border-brand/20 shimmer-effect">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New Collection Available
                    </Badge>
                  </motion.div>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl"
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
                    𝙔𝙤𝙪𝙧 𝙚𝙣𝙚𝙧𝙜𝙮. 𝙊𝙪𝙧 𝙚𝙡𝙚𝙢𝙚𝙣𝙩 🫶🏻
                  </motion.span>{" "}
                  <span className="animated-gradient-text">
                    
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg text-muted-foreground max-w-lg"
                  variants={itemVariants}
                >
                  anti-tarnish jewels that get you 💅 
                  <br />
                  <span className="text-brand font-medium">Crafted with precision, worn with confidence</span>
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-brand hover:bg-brand-dark text-white shadow-lg pulse-glow" asChild>
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
                  <Button size="lg" variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white" asChild>
                    <Link href="/about">
                      Our Story
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 pt-4"
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
                      <Star className="h-4 w-4 fill-brand-accent text-brand-accent" />
                    </motion.div>
                  ))}
                </motion.div>
                <motion.p 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  Trusted by 10,000+ customers worldwide
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Featured Products Grid */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={staggeredContainer}
            >
              {featured.slice(0, 4).map((product, index) => {
                const variant = product.variants[0];
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
                          <div className={`relative overflow-hidden ${index === 0 ? 'aspect-[2/1]' : 'aspect-square'}`}>
                            <Image
                              src={variant.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {product.badges?.includes('NEW') && (
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
                                  NEW
                                </Badge>
                              </motion.div>
                            )}
                            {product.badges?.includes('LIMITED') && (
                              <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                  delay: 0.5 + index * 0.1,
                                  type: "spring",
                                  stiffness: 200 
                                }}
                              >
                                <Badge className="absolute left-3 top-3 bg-brand text-white shadow-lg pulse-glow">
                                  LIMITED
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-sm mb-1 group-hover:text-brand transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">{product.subtitle}</p>
                            <p className="font-bold text-brand">{formatPrice(variant.priceCents)}</p>
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

      {/* Features Section */}
      <motion.section 
        className="py-16 bg-muted/30"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Container>
          <motion.div 
            className="grid gap-8 md:grid-cols-3"
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
                className="flex flex-col items-center text-center space-y-4"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center"
                  whileHover={{ 
                    backgroundColor: "var(--brand)",
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div
                    whileHover={{ color: "white" }}
                  >
                    <feature.icon className="h-6 w-6 text-brand" />
                  </motion.div>
                </motion.div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
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
                          src={collection.heroImage}
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