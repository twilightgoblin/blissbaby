"use client"

import { ShoppingCart, User, Search, Menu, Heart, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { ClerkSignInButton, ClerkSignUpButton } from "@/components/clerk-wrapper"
import { useCart } from "@/contexts/cart-context"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [wishlistCount] = useState(5)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { cartCount } = useCart()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  const isActive = (path: string) => pathname === path

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) return
    
    // Navigate to products page with search query
    const searchParams = new URLSearchParams()
    searchParams.set('search', query.trim())
    router.push(`/products?${searchParams.toString()}`)
    
    // Close mobile menu if open
    setMobileMenuOpen(false)
    
    // Clear search input
    setSearchQuery("")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(searchQuery)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary transition-transform duration-300 hover:rotate-12">
              <span className="text-xl font-bold text-primary-foreground">BB</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">BabyBliss</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className={`text-sm font-medium transition-all duration-300 hover:scale-105 relative group ${
                isActive("/") ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              Home
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  isActive("/") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-all duration-300 hover:scale-105 relative group ${
                isActive("/products") ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              Products
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  isActive("/products") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
            <Link
              href="/checkout"
              className={`text-sm font-medium transition-all duration-300 hover:scale-105 relative group ${
                isActive("/checkout") ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              Checkout
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  isActive("/checkout") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden flex-1 max-w-md lg:block">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-12 rounded-full border-border/60 bg-muted/50 focus:bg-background transition-all duration-300 focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>

          {/* Actions - Icons only */}
          <div className="flex items-center gap-2">
            {/* User Authentication */}
            {isSignedIn ? (
              <>
                {/* Account Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-muted/50 hover:scale-110 transition-all duration-300"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.fullName || user?.firstName}</p>
                      <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Cart */}
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-muted/50 hover:scale-110 transition-all duration-300"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground animate-bounce-soft">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* Sign In Button */}
                <ClerkSignInButton
                  variant="outline"
                  size="sm"
                  className="rounded-full hover:bg-muted/50 hover:scale-105 transition-all duration-300"
                >
                  Sign In
                </ClerkSignInButton>
                
                {/* Sign Up Button */}
                <ClerkSignUpButton
                  size="sm"
                  className="rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </ClerkSignUpButton>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:scale-110 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="flex flex-col gap-3 border-t border-border/40 py-4 md:hidden animate-fade-in">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors text-left ${
                isActive("/") ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors text-left ${
                isActive("/products") ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              Products
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors text-left ${
                isActive("/cart") ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              Cart
            </Link>
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors text-left ${
                isActive("/checkout") ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              Checkout
            </Link>
            
            {/* Mobile Auth Links */}
            {isSignedIn ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium transition-colors text-left text-foreground/80 hover:text-primary"
                >
                  My Account
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium transition-colors text-left text-foreground/80 hover:text-primary"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="text-sm font-medium transition-colors text-left text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <ClerkSignInButton
                  asChild
                  className="text-sm font-medium transition-colors text-left text-foreground/80 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </ClerkSignInButton>
                <ClerkSignUpButton
                  asChild
                  className="text-sm font-medium transition-colors text-left text-foreground/80 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </ClerkSignUpButton>
              </>
            )}
            
            <div className="relative mt-2 lg:hidden">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  ref={mobileSearchInputRef}
                  type="search" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-12 rounded-full" 
                />
                {searchQuery && (
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 p-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
