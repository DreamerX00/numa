"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface NavItem { label: string; href: string; }
const primaryNav: NavItem[] = [
  { label: 'Collections', href: '/collections' },
  { label: 'Rings', href: '/collection/rings' },
  { label: 'Necklaces', href: '/collection/necklaces' },
  { label: 'Earrings', href: '/collection/earrings' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'About', href: '/about' }
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-base-bg/80 border-b border-base-border">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        <button aria-label="Toggle navigation" className="lg:hidden p-2 focus-ring" onClick={() => setMobileOpen(o => !o)}>
          <span className="block w-5 h-0.5 bg-base-ink mb-1" />
          <span className="block w-5 h-0.5 bg-base-ink mb-1" />
          <span className="block w-5 h-0.5 bg-base-ink" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/NUMALOGO.jpg" alt="NUMA" width={40} height={40} className="rounded-sm object-cover" />
          <span className="font-serif text-xl tracking-tight">NUMA</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {primaryNav.map(item => (
            <Link key={item.href} href={item.href} className="hover:text-brand-dark transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <button aria-label="Search" className="text-sm hover:text-brand-dark focus-ring">Search</button>
          <Link href="/account" className="text-sm hover:text-brand-dark">Account</Link>
          <Link href="/cart" className="relative text-sm hover:text-brand-dark">
            Cart
            <span className="absolute -top-2 -right-3 bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full">0</span>
          </Link>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-base-border bg-base-bg animate-fadeIn">
          <nav className="flex flex-col p-4 gap-3 text-sm">
            {primaryNav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="py-1">
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-base-border" />
            <Link href="/account" onClick={() => setMobileOpen(false)} className="py-1">Account</Link>
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="py-1">Cart</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
