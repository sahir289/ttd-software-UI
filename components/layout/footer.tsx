'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'Best Sellers', href: '/products?tag=bestseller' },
    { name: 'Deals & Offers', href: '/products?tag=deal' },
    { name: 'Electronics', href: '/products?category=electronics' },
    { name: 'Fashion', href: '/products?category=fashion' },
    { name: 'Home & Kitchen', href: '/products?category=home-kitchen' },
  ],
  customer: [
    { name: 'My Account', href: '/dashboard' },
    { name: 'Order History', href: '/orders' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'Returns & Refunds', href: '/returns' },
    { name: 'FAQs', href: '/faqs' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Press', href: '/press' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Shipping Policy', href: '/shipping-policy' },
    { name: 'Return Policy', href: '/return-policy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

const features = [
  { icon: Truck, title: 'Free Delivery', description: 'On orders above Rs.500' },
  { icon: RotateCcw, title: 'Easy Returns', description: '7 day return policy' },
  { icon: Shield, title: 'Secure Payment', description: '100% secure checkout' },
  { icon: CreditCard, title: 'Multiple Payment', description: 'UPI, Cards, COD' },
]

export function Footer() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return null

  return (
    <footer className="border-t bg-muted/30">
      {/* Features Bar */}
      <div className="border-b">
        <div className="container py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-bold">S</span>
              </div>
              <span className="text-xl font-bold">TTD software</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted destination for quality products at great prices. Shop electronics, fashion, home essentials and more with fast delivery across India.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="font-medium">Subscribe to our newsletter</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Get updates on offers and new arrivals
              </p>
              <form className="mt-3 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-10"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium">Shop</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Customer Service</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Company</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Contact Us</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  123 Commerce Street,<br />
                  New Delhi, 110001, India
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href="tel:+911234567890"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  +91 12345 67890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:support@TTDsoftware.com"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  support@TTDsoftware.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t">
        <div className="container py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">We accept:</span>
              <div className="flex items-center gap-3">
                <div className="rounded border bg-background px-2 py-1 text-xs font-medium">VISA</div>
                <div className="rounded border bg-background px-2 py-1 text-xs font-medium">MasterCard</div>
                <div className="rounded border bg-background px-2 py-1 text-xs font-medium">RuPay</div>
                <div className="rounded border bg-background px-2 py-1 text-xs font-medium">UPI</div>
                <div className="rounded border bg-background px-2 py-1 text-xs font-medium">Paytm</div>
                <div className="rounded border bg-background px-2 py-1 text-xs font-medium">PhonePe</div>
                <div className="rounded border bg-background px-2 py-1 text-xs font-medium">COD</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t">
        <div className="container py-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TTD software. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
