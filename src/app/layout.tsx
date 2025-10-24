import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CartSyncProvider } from "@/components/providers/CartSyncProvider";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // ✅ Optimize font loading
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // ✅ Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: "NUMA Jewelry",
  description: "Luxury jewelry and fine accessories by NUMA.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-base-bg text-base-ink" suppressHydrationWarning>
      <head>
        {/* ✅ Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`} suppressHydrationWarning>
        <NextAuthProvider>
          <QueryProvider>
            <AuthProvider>
              <LoadingProvider>
                <CartSyncProvider>
                  <Header />
                  <main id="main" className="flex-1">{children}</main>
                  <Footer />
                  <Toaster 
                    position="top-right" 
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                      },
                    }}
                  />
                </CartSyncProvider>
              </LoadingProvider>
            </AuthProvider>
          </QueryProvider>
        </NextAuthProvider>
        <div id="portal-drawers" />
        <div id="portal-modals" />
      </body>
    </html>
  );
}
