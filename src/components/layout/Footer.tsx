import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-base-border bg-white">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-5">
        <div className="space-y-3 md:col-span-2">
          <h3 className="font-serif text-xl tracking-tight">𝙔𝙤𝙪𝙧 𝙚𝙣𝙚𝙧𝙜𝙮. 𝙊𝙪𝙧 𝙚𝙡𝙚𝙢𝙚𝙣𝙩 🫶🏻</h3>
          <p className="text-sm text-base-muted leading-relaxed max-w-sm">Timeless pieces crafted to resonate with your inner radiance. Explore rings, necklaces, earrings and more in the curated NUMA collection.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-sm tracking-wide uppercase">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/collections" className="hover:text-brand-dark">Collections</Link></li>
            <li><Link href="/new-arrivals" className="hover:text-brand-dark">New Arrivals</Link></li>
            <li><Link href="/bestsellers" className="hover:text-brand-dark">Bestsellers</Link></li>
            <li><Link href="/gifts" className="hover:text-brand-dark">Gifts</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-sm tracking-wide uppercase">Brand</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-brand-dark">About</Link></li>
            <li><Link href="/sustainability" className="hover:text-brand-dark">Sustainability</Link></li>
            <li><Link href="/care" className="hover:text-brand-dark">Care</Link></li>
            <li><Link href="/lookbook" className="hover:text-brand-dark">Lookbook</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-sm tracking-wide uppercase">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy" className="hover:text-brand-dark">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-dark">Terms</Link></li>
            <li><Link href="/refunds" className="hover:text-brand-dark">Refunds</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-base-border py-6 text-center text-xs text-base-muted">
        © {new Date().getFullYear()} NUMA — All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
