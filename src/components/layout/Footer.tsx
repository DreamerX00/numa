import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <Container>
        <div className="py-16 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand section */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/numaLogo.png"
                alt="NUMA"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-serif text-lg tracking-tight">NUMA</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Timeless jewelry crafted for your energy. Discover limited signature releases and elevated everyday forms that resonate with who you are.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com/numa.iin/" className="text-muted-foreground hover:text-brand transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              {/* <Link href="" className="text-muted-foreground hover:text-brand transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link> */}
              {/* <Link href="#" className="text-muted-foreground hover:text-brand transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link> */}
              <a  href="mailto:shreyaaa4404@gmail.com" className="text-muted-foreground hover:text-brand transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Navigation sections */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/collections" className="text-muted-foreground hover:text-foreground transition-colors">Collections</Link></li>
              <li><Link href="/collection/rings" className="text-muted-foreground hover:text-foreground transition-colors">Rings</Link></li>
              <li><Link href="/collection/necklaces" className="text-muted-foreground hover:text-foreground transition-colors">Necklaces</Link></li>
              <li><Link href="/collection/earrings" className="text-muted-foreground hover:text-foreground transition-colors">Earrings</Link></li>
              <li><Link href="/new-arrivals" className="text-muted-foreground hover:text-foreground transition-colors">Bangles</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Brand</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/lookbook" className="text-muted-foreground hover:text-foreground transition-colors"></Link></li>
              <li><Link href="/sustainability" className="text-muted-foreground hover:text-foreground transition-colors"></Link></li>
              <li><Link href="/care" className="text-muted-foreground hover:text-foreground transition-colors"></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors"></Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors"></Link></li>
              <li><Link href="/size-guide" className="text-muted-foreground hover:text-foreground transition-colors"></Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NUMA. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
