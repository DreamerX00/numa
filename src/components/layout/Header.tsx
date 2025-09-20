"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, Menu, ShoppingBag, User, LogOut } from 'lucide-react';
import { useAuth, getAuthDisplayName } from '@/lib/auth/client';
import { useCartStore } from '@/lib/store/cart';
import { MiniCart } from '@/components/cart/MiniCart';

interface NavItem { label: string; href: string; }
const primaryNav: NavItem[] = [
  { label: 'Collections', href: '/collections' },
  { label: 'Rings', href: '/collection/rings' },
  { label: 'Necklaces', href: '/collection/necklaces' },
  { label: 'Earrings', href: '/collection/earrings' },
  
  { label: 'About', href: '/about' }
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                <div className="flex items-center gap-3 pb-4">
                  <Image
                    src="/numaLogo.png"
                    alt="NUMA"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  
                </div>
                {primaryNav.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/numaLogo.png"
              alt="NUMA"
              width={70}
              height={60}
              className="rounded-lg"
              style={{ width: "70px", height: "60px" }}
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {primaryNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jewelry..."
                className="w-64 pl-8"
              />
            </div>

            {/* Auth buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">
                          {getAuthDisplayName(user)}
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">
                        <User className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="sm" className="bg-brand hover:bg-brand-dark text-white" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Cart */}
            <MiniCart>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {getTotalItems()}
                </span>
              </Button>
            </MiniCart>
          </div>
        </div>
      </Container>
    </motion.header>
  );
}

export default Header;
