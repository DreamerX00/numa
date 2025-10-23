import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { FileText, ShoppingBag, CreditCard, Package, RefreshCw, Scale, AlertCircle, MessageCircle, Sparkles, Clock, Menu, ChevronRight, Heart, ShieldCheck, Truck, Gift, Star, Award, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Numa - Shopping Terms & Conditions',
  description: 'Read our terms of service for shopping at Numa. Understand your rights, obligations, and our policies for jewelry purchases.',
  openGraph: {
    title: 'Terms of Service | Numa',
    description: 'Terms and conditions for shopping at Numa jewelry store.',
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-indigo-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-60 right-10 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-fuchsia-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Hero Section with Rich Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 border-b-4 border-amber-400 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon with Animation */}
            <div className="inline-flex items-center justify-center w-32 h-32 mb-10 rounded-3xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl shadow-2xl border-4 border-white/40 relative group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/30 to-fuchsia-400/30 blur-xl group-hover:blur-2xl transition-all" />
              <Scale className="w-20 h-20 text-white drop-shadow-2xl relative z-10 animate-pulse" />
              <Award className="w-8 h-8 text-amber-200 absolute -top-2 -right-2 animate-ping" />
            </div>

            {/* Title with Sparkle Effect */}
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight drop-shadow-2xl relative">
              Terms of Service
              <Zap className="inline-block w-10 h-10 ml-4 text-amber-300 animate-bounce" />
            </h1>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white to-white rounded-full" />
              <Star className="w-8 h-8 text-amber-300 animate-spin fill-amber-300" style={{ animationDuration: '3s' }} />
              <div className="h-1 w-24 bg-gradient-to-r from-white via-white to-transparent rounded-full" />
            </div>

            {/* Description */}
            <p className="text-2xl md:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light mb-10">
              Your trust matters to us. These terms ensure a fair, transparent, and secure shopping experience for all our valued customers.
            </p>

            {/* Date Badge */}
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-xl rounded-full border-2 border-white/40 shadow-xl hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-white" />
              <span className="text-lg text-white font-semibold">Effective: October 23, 2025</span>
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
          </div>
        </Container>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(238 242 255)" />
          </svg>
        </div>
      </div>

      <Container className="relative py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Quick Navigation Card */}
          <div className="mb-16 p-10 rounded-3xl bg-gradient-to-br from-white via-indigo-50/80 to-purple-50/80 backdrop-blur-xl border-2 border-indigo-300 shadow-2xl relative overflow-hidden group">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-300/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-fuchsia-300/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Menu className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">Quick Navigation</h2>
              <Sparkles className="w-6 h-6 text-amber-500 animate-pulse ml-auto" />
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Acceptance of Terms', href: '#acceptance', icon: FileText, color: 'from-blue-500 to-cyan-500' },
                { title: 'Products & Orders', href: '#products', icon: ShoppingBag, color: 'from-purple-500 to-pink-500' },
                { title: 'Pricing & Payment', href: '#pricing', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
                { title: 'Shipping & Delivery', href: '#shipping', icon: Package, color: 'from-amber-500 to-orange-500' },
                { title: 'Returns & Refunds', href: '#returns', icon: RefreshCw, color: 'from-rose-500 to-pink-500' },
                { title: 'Contact Information', href: '#contact', icon: MessageCircle, color: 'from-violet-500 to-purple-500' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group/item relative flex items-center gap-4 px-6 py-4 text-base font-semibold text-gray-700 bg-white hover:text-white rounded-2xl border-2 border-indigo-200 hover:border-transparent transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-105 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover/item:opacity-100 transition-opacity duration-300`} />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 group-hover/item:from-white/20 group-hover/item:to-white/10 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5 text-indigo-600 group-hover/item:text-white transition-colors" />
                    </div>
                    <span className="relative flex-1">{item.title}</span>
                    <ChevronRight className="relative w-5 h-5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-10">
            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        Acceptance of Terms
                      </h2>
                      <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-blue-700 leading-relaxed text-xl font-medium">
                      By using our services, you agree to these terms and conditions.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-6 pl-8">
                  <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-blue-200 shadow-md">
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                      These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Numa website, mobile applications, and related services. By creating an account, placing an order, or otherwise using our Services, you agree to comply with these Terms.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                      If you do not agree to these Terms, you may not access or use our Services. We reserve the right to modify these Terms at any time, and your continued use of the Services constitutes acceptance of any changes.
                    </p>
                    <div className="mt-4 p-4 rounded-xl bg-amber-50 border-2 border-amber-300">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
                        <p className="text-amber-900 font-semibold">
                          <strong>Age Requirement:</strong> You must be at least 18 years old to use our Services and make purchases. By using Numa, you represent that you meet this age requirement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Products & Orders */}
            <section id="products" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <ShoppingBag className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                        Products & Orders
                      </h2>
                      <Gift className="w-8 h-8 text-amber-500 animate-bounce" />
                    </div>
                    <p className="text-purple-700 leading-relaxed text-xl font-medium">
                      Information about our jewelry products and ordering process.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-6 pl-8">
                  <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-200 shadow-md">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <span className="text-3xl">💎</span> Product Information
                    </h3>
                    <ul className="space-y-3 text-gray-700 text-lg">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mt-2.5 flex-shrink-0" />
                        <span>All jewelry items are described and photographed as accurately as possible</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mt-2.5 flex-shrink-0" />
                        <span>Colors may vary slightly due to screen settings and photography lighting</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mt-2.5 flex-shrink-0" />
                        <span>We reserve the right to limit quantities and discontinue products</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mt-2.5 flex-shrink-0" />
                        <span>Custom or personalized items may have extended processing times</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">✅</span> Order Acceptance
                      </h3>
                      <p className="text-gray-700">
                        We reserve the right to accept or decline any order. Order confirmation does not guarantee acceptance. We&apos;ll notify you if we cannot fulfill your order.
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">❌</span> Order Cancellation
                      </h3>
                      <p className="text-gray-700">
                        Orders can be cancelled within 2 hours of placement. Custom items cannot be cancelled once production begins.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Pricing & Payment */}
            <section id="pricing" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-green-50 via-white to-emerald-50 border-2 border-green-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-green-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                        Pricing & Payment
                      </h2>
                      <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-green-700 leading-relaxed text-xl font-medium">
                      Understanding our pricing and accepted payment methods.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-6 pl-8">
                  <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-green-200 shadow-md">
                    <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                      <span className="text-3xl">💰</span> Pricing Policy
                    </h3>
                    <ul className="space-y-3 text-gray-700 text-lg">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mt-2.5 flex-shrink-0" />
                        <span>All prices displayed in Indian Rupees (INR)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mt-2.5 flex-shrink-0" />
                        <span>Prices subject to change without notice</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mt-2.5 flex-shrink-0" />
                        <span>Shipping charges and taxes added at checkout</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: 'Credit/Debit Cards', desc: 'Visa, Mastercard, RuPay, Amex', icon: '💳', gradient: 'from-blue-400 to-cyan-400' },
                      { title: 'UPI Payments', desc: 'Google Pay, PhonePe, Paytm', icon: '📱', gradient: 'from-purple-400 to-pink-400' },
                      { title: 'Net Banking', desc: 'All major Indian banks', icon: '🏦', gradient: 'from-green-400 to-emerald-400' },
                      { title: 'Cash on Delivery', desc: 'Available on select orders', icon: '💵', gradient: 'from-amber-400 to-orange-400' },
                    ].map((item) => (
                      <div key={item.title} className={`p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-green-200 shadow-md hover:shadow-xl hover:scale-105 transition-all`}>
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} shadow-md mb-4 text-2xl`}>
                          {item.icon}
                        </div>
                        <h3 className="text-lg font-bold text-green-900 mb-2">{item.title}</h3>
                        <p className="text-gray-700">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
                    <p className="text-green-900 font-semibold flex items-start gap-3">
                      <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-1" />
                      <span>All payment transactions are encrypted and PCI-DSS compliant. We never store your complete credit card information.</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Shipping & Delivery */}
            <section id="shipping" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                        Shipping & Delivery
                      </h2>
                      <Truck className="w-8 h-8 text-indigo-500 animate-bounce" />
                    </div>
                    <p className="text-amber-700 leading-relaxed text-xl font-medium">
                      Fast, secure delivery to your doorstep.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-6 pl-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { label: 'Processing Time', value: '1-3 Days', icon: '⏱️', color: 'blue' },
                      { label: 'Standard Delivery', value: '5-7 Days', icon: '📦', color: 'purple' },
                      { label: 'Express Delivery', value: '2-3 Days', icon: '⚡', color: 'amber' },
                    ].map((item) => (
                      <div key={item.label} className={`p-6 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-${item.color}-200 shadow-md hover:shadow-xl hover:scale-105 transition-all text-center`}>
                        <div className="text-4xl mb-3">{item.icon}</div>
                        <div className={`text-3xl font-bold text-${item.color}-600 mb-2`}>{item.value}</div>
                        <div className="text-gray-600 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-200 shadow-md">
                    <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="text-3xl">🚚</span> Delivery Terms
                    </h3>
                    <ul className="space-y-3 text-gray-700 text-lg">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-amber-700">Free Shipping:</strong> On orders above ₹500 within India</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-amber-700">Tracking:</strong> Receive tracking info once your order ships</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-amber-700">International:</strong> 7-14 business days (select countries)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300">
                    <p className="text-amber-900 font-semibold flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                      <span>Delivery times are estimates. We&apos;re not responsible for courier delays. Ensure someone is available to receive packages.</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Returns & Refunds */}
            <section id="returns" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-pink-50 border-2 border-rose-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-rose-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <RefreshCw className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">
                        Returns & Refunds
                      </h2>
                      <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-rose-700 leading-relaxed text-xl font-medium">
                      Hassle-free returns within 7 days of delivery.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-6 pl-8">
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <span className="text-3xl">✓</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-green-900">7-Day Return Policy</h3>
                        <p className="text-green-700 font-medium">Items must be unworn and in original packaging</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-rose-200 shadow-md">
                      <h3 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">✅</span> Eligible Items
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Unused, undamaged items</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Original packaging intact</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>Tags and certificates included</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-rose-200 shadow-md">
                      <h3 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">❌</span> Non-Eligible Items
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>Personalized/custom jewelry</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>Earrings (hygiene reasons)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>Clearance/final sale items</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-rose-200 shadow-md">
                    <h3 className="text-2xl font-bold text-rose-900 mb-4 flex items-center gap-2">
                      <span className="text-3xl">💰</span> Refund Process
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {[
                        { step: '1', label: 'Contact Us', desc: 'Within 7 days', icon: '📧' },
                        { step: '2', label: 'Get Authorization', desc: 'Receive return label', icon: '✅' },
                        { step: '3', label: 'Ship Item', desc: 'Use tracking', icon: '📦' },
                        { step: '4', label: 'Get Refund', desc: '7-10 business days', icon: '💳' },
                      ].map((item) => (
                        <div key={item.step} className="text-center p-4 rounded-xl bg-rose-50 border border-rose-200">
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <div className="font-bold text-rose-900 mb-1">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
                    <p className="text-green-900 font-bold text-lg flex items-start gap-3">
                      <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-1" />
                      <span>100% Authentic Guarantee: If you receive a counterfeit item, we&apos;ll provide a full refund and cover all return shipping costs.</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="scroll-mt-24">
              <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 border-2 border-violet-300 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-300/20 via-transparent to-fuchsia-300/20 rounded-3xl" />
                
                <div className="relative flex items-start gap-6 mb-10">
                  <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-2xl">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                        Questions or Concerns?
                      </h2>
                      <Heart className="w-8 h-8 text-pink-500 animate-pulse fill-pink-500" />
                    </div>
                    <p className="text-violet-700 leading-relaxed text-xl font-medium">
                      Our customer service team is here to help with any questions.
                    </p>
                  </div>
                </div>

                <div className="relative grid md:grid-cols-3 gap-6">
                  <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-violet-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-4xl mb-4">📧</div>
                    <h3 className="text-xl font-bold text-violet-900 mb-2">Email Support</h3>
                    <a href="mailto:support@numa.com" className="text-lg font-bold text-violet-600 hover:text-violet-500">
                      support@numa.com
                    </a>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-violet-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-4xl mb-4">📞</div>
                    <h3 className="text-xl font-bold text-violet-900 mb-2">Phone Support</h3>
                    <a href="tel:+911234567890" className="text-lg font-bold text-violet-600 hover:text-violet-500">
                      +91 123 456 7890
                    </a>
                    <p className="text-sm text-gray-600 mt-2">Mon-Sat, 10 AM - 7 PM IST</p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-violet-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-4xl mb-4">📍</div>
                    <h3 className="text-xl font-bold text-violet-900 mb-2">Visit Us</h3>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      123 Elegance Avenue<br />
                      Connaught Place<br />
                      New Delhi, 110001
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-12 border-t-2 border-indigo-200">
              <div className="text-center space-y-4">
                <p className="text-gray-600 text-lg">
                  These Terms of Service are effective as of <strong>October 23, 2025</strong>
                </p>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  View Privacy Policy
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
