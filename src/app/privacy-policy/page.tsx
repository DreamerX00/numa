import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Shield, Lock, Eye, UserCheck, Database, Bell, Mail, FileText, Sparkles, Clock, Menu, ChevronRight, User, Settings, Globe, ShieldCheck, AlertCircle, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Numa - Your Privacy Matters',
  description: 'Learn how Numa protects your personal information and respects your privacy. Read our comprehensive privacy policy for jewelry e-commerce.',
  openGraph: {
    title: 'Privacy Policy | Numa',
    description: 'Your privacy is our priority. Learn how we protect your personal information.',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-amber-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      {/* Hero Section with Rich Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 border-b-4 border-amber-400 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon with Animation */}
            <div className="inline-flex items-center justify-center w-32 h-32 mb-10 rounded-3xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl shadow-2xl border-4 border-white/40 relative group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/30 to-pink-400/30 blur-xl group-hover:blur-2xl transition-all" />
              <Shield className="w-20 h-20 text-white drop-shadow-2xl relative z-10 animate-pulse" />
              <Sparkles className="w-8 h-8 text-amber-200 absolute -top-2 -right-2 animate-ping" />
            </div>

            {/* Title with Sparkle Effect */}
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight drop-shadow-2xl relative">
              Privacy Policy
              <Sparkles className="inline-block w-10 h-10 ml-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
            </h1>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white to-white rounded-full" />
              <Heart className="w-8 h-8 text-amber-300 animate-pulse fill-amber-300" />
              <div className="h-1 w-24 bg-gradient-to-r from-white via-white to-transparent rounded-full" />
            </div>

            {/* Description */}
            <p className="text-2xl md:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light mb-10">
              Your privacy is the foundation of our trust. We&apos;re committed to protecting your personal information with the highest standards of security.
            </p>

            {/* Date Badge */}
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-xl rounded-full border-2 border-white/40 shadow-xl hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-white" />
              <span className="text-lg text-white font-semibold">Last Updated: October 23, 2025</span>
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
          </div>
        </Container>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(251 245 253)" />
          </svg>
        </div>
      </div>

      <Container className="relative py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Quick Navigation Card */}
          <div className="mb-16 p-10 rounded-3xl bg-gradient-to-br from-white via-purple-50/80 to-pink-50/80 backdrop-blur-xl border-2 border-purple-300 shadow-2xl relative overflow-hidden group">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-300/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-300/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Menu className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">Quick Navigation</h2>
              <Sparkles className="w-6 h-6 text-amber-500 animate-pulse ml-auto" />
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Information We Collect', href: '#collection', icon: Database, color: 'from-blue-500 to-cyan-500' },
                { title: 'How We Use Your Info', href: '#usage', icon: Eye, color: 'from-purple-500 to-pink-500' },
                { title: 'Data Security', href: '#security', icon: Lock, color: 'from-green-500 to-emerald-500' },
                { title: 'Your Privacy Rights', href: '#rights', icon: UserCheck, color: 'from-amber-500 to-orange-500' },
                { title: 'Cookies & Tracking', href: '#cookies', icon: Bell, color: 'from-rose-500 to-pink-500' },
                { title: 'Contact Us', href: '#contact', icon: Mail, color: 'from-violet-500 to-purple-500' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group/item relative flex items-center gap-4 px-6 py-4 text-base font-semibold text-gray-700 bg-white hover:text-white rounded-2xl border-2 border-purple-200 hover:border-transparent transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-105 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover/item:opacity-100 transition-opacity duration-300`} />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 group-hover/item:from-white/20 group-hover/item:to-white/10 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5 text-purple-600 group-hover/item:text-white transition-colors" />
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
            {/* Section 1: Information We Collect */}
            <section id="collection" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-2 border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Database className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                        Information We Collect
                      </h2>
                      <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-blue-700 leading-relaxed text-xl font-medium">
                      We collect information to provide better services to all our users.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-6 pl-8">
                  {/* Personal Information */}
                  <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-900">Personal Information</h3>
                    </div>
                    <ul className="space-y-3 text-gray-700 text-lg">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-blue-700">Name & Contact:</strong> Full name, email address, phone number</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-blue-700">Shipping Address:</strong> Delivery and billing information</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-blue-700">Payment Details:</strong> Securely processed payment information</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-blue-700">Account Information:</strong> Username, password, preferences</span>
                      </li>
                    </ul>
                  </div>

                  {/* Automatic Collection */}
                  <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-900">Automatic Collection</h3>
                    </div>
                    <ul className="space-y-3 text-gray-700 text-lg">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-purple-700">Device Information:</strong> Browser type, IP address, device ID</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-purple-700">Usage Data:</strong> Pages viewed, products browsed, time spent</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2.5 flex-shrink-0" />
                        <span><strong className="text-purple-700">Cookies & Tracking:</strong> Analytics and preference cookies</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: How We Use Your Information */}
            <section id="usage" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Eye className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                        How We Use Your Information
                      </h2>
                      <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-purple-700 leading-relaxed text-xl font-medium">
                      Your information helps us provide a personalized shopping experience.
                    </p>
                  </div>
                </div>

                <div className="relative grid md:grid-cols-2 gap-6 pl-8">
                  {[
                    { title: 'Order Processing', desc: 'Fulfill and deliver your jewelry orders', icon: '📦', gradient: 'from-blue-400 to-cyan-400' },
                    { title: 'Customer Service', desc: 'Respond to inquiries and provide support', icon: '💬', gradient: 'from-green-400 to-emerald-400' },
                    { title: 'Personalization', desc: 'Recommend products based on preferences', icon: '✨', gradient: 'from-purple-400 to-pink-400' },
                    { title: 'Marketing', desc: 'Send promotional offers (with consent)', icon: '📧', gradient: 'from-amber-400 to-orange-400' },
                    { title: 'Security', desc: 'Detect and prevent fraudulent activity', icon: '🛡️', gradient: 'from-red-400 to-rose-400' },
                    { title: 'Analytics', desc: 'Improve website performance and UX', icon: '📊', gradient: 'from-violet-400 to-purple-400' },
                  ].map((item) => (
                    <div key={item.title} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-200 shadow-md hover:shadow-xl hover:scale-105 transition-all">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} shadow-md mb-4 text-2xl`}>
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">{item.title}</h3>
                      <p className="text-gray-700 text-base">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 3: Data Security */}
            <section id="security" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-green-50 via-white to-emerald-50 border-2 border-green-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-green-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                        Data Security & Protection
                      </h2>
                      <ShieldCheck className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-green-700 leading-relaxed text-xl font-medium">
                      Your data is protected with industry-leading security measures.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-4 pl-8">
                  {[
                    { title: '256-bit SSL Encryption', desc: 'All data transmitted between you and our servers is encrypted', icon: '🔐' },
                    { title: 'Secure Storage', desc: 'Your information is stored on secure, encrypted servers', icon: '💾' },
                    { title: 'Access Controls', desc: 'Strict access controls limit who can view your data', icon: '🔑' },
                    { title: 'Regular Audits', desc: 'We conduct regular security audits and updates', icon: '🔍' },
                    { title: 'PCI DSS Compliant', desc: 'Payment processing meets industry security standards', icon: '💳' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4 p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-green-200 shadow-md hover:shadow-lg hover:translate-x-2 transition-all">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-green-900 mb-2">{item.title}</h3>
                        <p className="text-gray-700">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-300/30 to-transparent rounded-full blur-2xl" />
                  <div className="relative flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                    <p className="text-green-900 font-medium">
                      <strong>Important:</strong> While we implement robust security measures, no method of transmission over the internet is 100% secure. We continuously work to protect your information but cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Your Privacy Rights */}
            <section id="rights" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <UserCheck className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                        Your Privacy Rights
                      </h2>
                      <Sparkles className="w-7 h-7 text-purple-500 animate-pulse" />
                    </div>
                    <p className="text-amber-700 leading-relaxed text-xl font-medium">
                      You have control over your personal information and how it&apos;s used.
                    </p>
                  </div>
                </div>

                <div className="relative grid md:grid-cols-2 gap-6 pl-8">
                  {[
                    { title: 'Access Your Data', desc: 'Request a copy of your personal information', icon: '📄', color: 'blue' },
                    { title: 'Correct Information', desc: 'Update or correct inaccurate data', icon: '✏️', color: 'green' },
                    { title: 'Delete Your Account', desc: 'Request deletion of your account and data', icon: '🗑️', color: 'red' },
                    { title: 'Opt-Out Marketing', desc: 'Unsubscribe from promotional emails', icon: '🚫', color: 'purple' },
                    { title: 'Data Portability', desc: 'Receive your data in a portable format', icon: '📤', color: 'cyan' },
                    { title: 'Object to Processing', desc: 'Object to certain data processing activities', icon: '⛔', color: 'amber' },
                  ].map((item) => (
                    <div key={item.title} className={`p-6 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-${item.color}-200 shadow-md hover:shadow-xl hover:scale-105 transition-all`}>
                      <div className="text-4xl mb-4">{item.icon}</div>
                      <h3 className="text-xl font-bold text-amber-900 mb-2">{item.title}</h3>
                      <p className="text-gray-700">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300">
                  <p className="text-amber-900 font-medium text-lg">
                    To exercise any of these rights, please contact us at{' '}
                    <a href="mailto:privacy@numa.com" className="text-amber-700 underline font-bold hover:text-amber-600">
                      privacy@numa.com
                    </a>
                    . We&apos;ll respond to your request within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Cookies & Tracking */}
            <section id="cookies" className="scroll-mt-24 group">
              <div className="p-10 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-pink-50 border-2 border-rose-300 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-rose-300/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative flex items-start gap-6 mb-8">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Bell className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">
                        Cookies & Tracking Technologies
                      </h2>
                      <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-rose-700 leading-relaxed text-xl font-medium">
                      We use cookies to enhance your browsing experience.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-6 pl-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { type: 'Essential Cookies', desc: 'Required for website functionality', required: true },
                      { type: 'Analytics Cookies', desc: 'Help us understand how you use our site', required: false },
                      { type: 'Preference Cookies', desc: 'Remember your settings and preferences', required: false },
                      { type: 'Marketing Cookies', desc: 'Show relevant advertisements', required: false },
                    ].map((item) => (
                      <div key={item.type} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-rose-200 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-rose-900">{item.type}</h3>
                          {item.required ? (
                            <span className="px-3 py-1 text-xs font-bold bg-rose-500 text-white rounded-full">Required</span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-bold bg-gray-400 text-white rounded-full">Optional</span>
                          )}
                        </div>
                        <p className="text-gray-700">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-300">
                    <p className="text-rose-900 font-medium">
                      <strong>Manage Cookies:</strong> You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="scroll-mt-24">
              <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 border-2 border-violet-300 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-300/20 via-transparent to-pink-300/20 rounded-3xl" />
                
                <div className="relative flex items-start gap-6 mb-10">
                  <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-2xl">
                    <Mail className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                        Questions or Concerns?
                      </h2>
                      <Heart className="w-8 h-8 text-pink-500 animate-pulse fill-pink-500" />
                    </div>
                    <p className="text-violet-700 leading-relaxed text-xl font-medium">
                      We&apos;re here to help! Contact our privacy team anytime.
                    </p>
                  </div>
                </div>

                <div className="relative grid md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-violet-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-8 h-8 text-violet-600" />
                      <h3 className="text-xl font-bold text-violet-900">Privacy Email</h3>
                    </div>
                    <a href="mailto:privacy@numa.com" className="text-2xl font-bold text-violet-600 hover:text-violet-500 transition-colors">
                      privacy@numa.com
                    </a>
                    <p className="text-gray-600 mt-2">For privacy-related inquiries</p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-violet-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-8 h-8 text-violet-600" />
                      <h3 className="text-xl font-bold text-violet-900">Business Address</h3>
                    </div>
                    <p className="text-gray-800 font-medium leading-relaxed">
                      Numa Jewelry Private Limited<br />
                      123 Elegance Avenue<br />
                      Connaught Place<br />
                      New Delhi, India 110001
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-12 border-t-2 border-purple-200">
              <div className="text-center space-y-4">
                <p className="text-gray-600 text-lg">
                  These Privacy Policy terms are effective as of <strong>October 23, 2025</strong>
                </p>
                <Link
                  href="/terms-of-service"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  View Terms of Service
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
