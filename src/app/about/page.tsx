"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import {
  Sparkles,
  Heart,
  Leaf,
  Gem,
  Award,
  Mail,
  Globe,
  Quote,
} from "lucide-react";
import { SiInstagram, SiLinkedin, SiGithub } from "react-icons/si";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Hero Section - Brand Story with Image Background */}
      <section className="relative overflow-hidden border-b-4 border-amber-400 h-[600px] md:h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop&q=80"
            alt="NUMA Jewelry"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-rose-900/80" />
        </div>

        {/* Pattern Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container className="relative h-full flex items-center">
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="inline-flex items-center justify-center w-32 h-32 mb-12 rounded-full bg-white/20 backdrop-blur-xl shadow-2xl border-4 border-white/40 relative group"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-pink-400/30 blur-xl group-hover:blur-2xl transition-all" />
              <Gem className="w-16 h-16 text-white drop-shadow-2xl relative z-10" />
            </motion.div>

            {/* Animated Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight drop-shadow-2xl"
            >
              Our Brand Story
            </motion.h1>

            {/* Animated Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl lg:text-3xl text-white/95 font-light max-w-4xl mx-auto leading-relaxed mb-12 drop-shadow-lg"
            >
              Timeless jewelry crafted with passion,{" "}
              <br className="hidden md:inline" />
              designed for your unique energy
            </motion.p>

            {/* Animated Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center gap-6 mb-8"
            >
              <div className="h-px w-24 bg-white/60" />
              <Sparkles
                className="w-8 h-8 text-amber-300 animate-spin"
                style={{ animationDuration: "4s" }}
              />
              <div className="h-px w-24 bg-white/60" />
            </motion.div>

            {/* Animated Mission Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <p className="text-lg md:text-xl text-white/90 font-light italic leading-relaxed">
                &ldquo;We believe jewelry is more than adornment—it&rsquo;s an
                extension of your soul, a celebration of your journey, and a
                reflection of the energy you bring to the world.&rdquo;
              </p>
            </motion.div>
          </div>
        </Container>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-purple-50 to-transparent" />
      </section>

      {/* Founders Section */}
      <section className="py-32 relative">
        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-24"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Meet Our Founders
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The visionaries behind NUMA&rsquo;s timeless elegance
              </p>
            </motion.div>

            {/* Founder 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-32"
            >
              <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Photo - Reduced Height */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-8 border-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                    <Image
                      src="/About/Naincy.png"
                      alt="Naincy - Co-Founder"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Decorative Elements */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/30 rounded-full blur-2xl"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-6 -left-6 w-40 h-40 bg-purple-400/30 rounded-full blur-2xl"
                  />
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                      Naincy
                    </h3>
                    <p className="text-xl text-purple-600 font-medium mb-6">
                      
                    </p>
                  </div>

                  {/* Quote */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-100"
                  >
                    <Quote className="absolute top-4 left-4 w-12 h-12 text-purple-300/50" />
                    <p className="text-lg text-gray-700 leading-relaxed italic relative z-10 pl-8">
                      &ldquo;Every piece we create tells a story. I founded NUMA
                      with the belief that jewelry should be more than just
                      beautiful—it should resonate with your soul, empower your
                      confidence, and become a part of your life&rsquo;s
                      journey. Our designs celebrate the unique energy each
                      person brings to the world.&rdquo;
                    </p>
                  </motion.div>

                  {/* Bio */}
                  <div className="space-y-4 text-gray-600">
                    <p>
                      With a passion for timeless craftsmanship and elegant design,
                      Naincy brings her vision of meaningful jewelry to life through
                      NUMA, creating pieces that resonate with modern women.
                    </p>
                    <p>
                      Her design philosophy blends traditional artistry with
                      contemporary aesthetics, creating pieces that are both
                      classic and modern.
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4 pt-4">
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://www.instagram.com/numa.iin/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <SiInstagram className="w-6 h-6" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      href="mailto:shreyaaa4404@gmail.com"
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Mail className="w-6 h-6" />
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Founder 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Content - Order reversed on desktop */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-8 md:order-1"
                >
                  <div>
                    <h3 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                      Shreya
                    </h3>
                    <p className="text-xl text-purple-600 font-medium mb-6">
                      
                    </p>
                  </div>

                  {/* Quote */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-100"
                  >
                    <Quote className="absolute top-4 left-4 w-12 h-12 text-purple-300/50" />
                    <p className="text-lg text-gray-700 leading-relaxed italic relative z-10 pl-8">
                      &ldquo;Behind every beautiful piece is a commitment to
                      excellence, sustainability, and ethical craftsmanship. At
                      NUMA, we ensure that every step—from sourcing materials to
                      the final polish—reflects our values of quality,
                      responsibility, and care for both people and
                      planet.&rdquo;
                    </p>
                  </motion.div>

                  {/* Bio */}
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Shreya brings expertise in operations management and ethical
                      business practices, ensuring NUMA operates with integrity at
                      every level.
                    </p>
                    <p>
                      Her dedication to transparency and responsible sourcing
                      has made NUMA a brand that customers can trust and feel
                      proud to wear.
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4 pt-4">
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      href="https://www.instagram.com/numa.iin/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <SiInstagram className="w-6 h-6" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      href="mailto:shreyaaa4404@gmail.com"
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Mail className="w-6 h-6" />
                    </motion.a>
                  </div>
                </motion.div>

                {/* Photo - Order reversed on desktop - Reduced Height */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative group md:order-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-500" />
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-8 border-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                    <Image
                      src="/About/Shreya.png"
                      alt="Shreya - Co-Founder"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Decorative Elements */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-6 -left-6 w-32 h-32 bg-amber-400/30 rounded-full blur-2xl"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-6 -right-6 w-40 h-40 bg-purple-400/30 rounded-full blur-2xl"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Brand Values Section */}
      <section className="py-32 bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a855f7' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />

        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/60 backdrop-blur-sm mb-6 shadow-xl">
              <Award className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we create
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Value 1 - Craftsmanship */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group"
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-purple-100 hover:border-purple-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg"
                  >
                    <Gem className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Craftsmanship
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every piece is meticulously handcrafted by skilled artisans,
                    ensuring exceptional quality and attention to detail in
                    every design.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Value 2 - Authenticity */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-purple-100 hover:border-purple-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg"
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Authenticity
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We create jewelry that reflects genuine emotions and
                    personal stories, designed to resonate with your unique
                    energy and style.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Value 3 - Sustainability */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group"
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-purple-100 hover:border-purple-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg"
                  >
                    <Leaf className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Sustainability
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Committed to ethical sourcing and eco-friendly practices, we
                    ensure our jewelry is beautiful for you and kind to our
                    planet.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Value 4 - Excellence */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group"
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-purple-100 hover:border-purple-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Excellence
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    From design to delivery, we pursue perfection in every
                    aspect, creating timeless pieces that exceed expectations.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Developers Credit Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        {/* Subtle Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container className="relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500" />
              <span className="text-sm font-medium text-purple-400 uppercase tracking-widest">
                Built with ❤️ by
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Our Development Team
            </h2>
            <p className="text-lg text-gray-400">
              Crafting exceptional digital experiences
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
            {/* Developer 1 */}
            <div className="group text-center">
              <div className="relative mb-6">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-300 scale-110" />

                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                      <Image
                        src="/About/Akash.jpg"
                        alt="Akash - Full Stack Developer"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Akash</h3>
              <p className="text-sm text-purple-400 mb-6">
                Full Stack Developer
              </p>

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                <a
                  href="https://github.com/DreamerX00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="GitHub"
                >
                  <SiGithub className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/akashs08/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Portfolio"
                >
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Developer 2 */}
            <div className="group text-center">
              <div className="relative mb-6">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-300 scale-110" />

                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                      <Image
                        src="/About/Tanisha.jpeg"
                        alt="Tanisha - UI/UX Developer"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Tanisha
              </h3>
              <p className="text-sm text-purple-400 mb-6">Full Stack  Developer</p>

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                <a
                  href="https://github.com/Ta9isha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="GitHub"
                >
                  <SiGithub className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/tanishasahu28/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  aria-label="Portfolio"
                >
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-16">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} NUMA. All rights reserved. |
              <span className="text-gray-600">
                {" "}
                Designed & Developed with passion
              </span>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
