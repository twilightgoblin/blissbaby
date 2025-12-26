import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
                <span className="text-xl font-bold text-primary-foreground">BB</span>
              </div>
              <span className="text-xl font-bold tracking-tight">BabyBliss</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted destination for premium baby products. Making parenting easier, one product at a time.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products?category=baby-care"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Baby Care
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=feeding"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Feeding
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=toys"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Toys
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=clothing"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=hygiene"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Hygiene
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground transition-colors hover:text-primary">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground transition-colors hover:text-primary">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground transition-colors hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscribe to get special offers and parenting tips!
            </p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Your email" className="rounded-full" />
              <Button className="rounded-full bg-primary hover:bg-primary/90">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BabyBliss. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
