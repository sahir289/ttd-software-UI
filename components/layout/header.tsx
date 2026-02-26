'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  MapPin,
  Package,
  LogOut,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCartStore, useAuthStore, useWishlistStore } from '@/lib/store'
import { categories } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  const cartItemCount = useCartStore((state) => state.getItemCount())
  const wishlistItems = useWishlistStore((state) => state.items)
  const { user, isAuthenticated, logout } = useAuthStore()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="hidden border-b bg-muted/30 md:block">
        <div className="container flex h-8 items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Package className="h-3 w-3" />
              Track Order
            </Link>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Free Delivery on orders above Rs.500</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-muted-foreground hover:text-foreground">
              Help
            </Link>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              {mounted && (theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />)}
              {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Theme'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container">
        <div className="flex h-16 items-center gap-4">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col">
                {isAuthenticated && user ? (
                  <div className="border-b p-4">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="border-b p-4 text-primary hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login / Sign Up
                  </Link>
                )}
                <nav className="flex flex-col">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      className="border-b px-4 py-3 hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col border-t p-4">
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist ({wishlistItems.length})
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      setTheme(theme === 'dark' ? 'light' : 'dark')
                    }}
                    className="flex items-center gap-2 py-2 text-left"
                  >
                    {mounted && (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
                    {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Theme'}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">S</span>
            </div>
            <span className="hidden text-xl font-bold md:block">TTD software</span>
          </Link>

          {/* Location Selector (Desktop) */}
          <Button variant="ghost" className="hidden items-center gap-1 text-sm lg:flex">
            <MapPin className="h-4 w-4" />
            <span className="max-w-[100px] truncate">Deliver to Delhi</span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-1 md:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products, brands and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-4"
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex"
            >
              {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/addresses">
                        <MapPin className="mr-2 h-4 w-4" />
                        Addresses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/register">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    {wishlistItems.length}
                  </Badge>
                )}
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation (Desktop) */}
      <div className="hidden border-t md:block">
        <div className="container">
          <nav className="flex items-center gap-1 overflow-x-auto py-2 hide-scrollbar">
            {categories.map((category) => (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'flex items-center gap-1 whitespace-nowrap',
                      pathname === `/products?category=${category.slug}` && 'bg-muted'
                    )}
                  >
                    {category.name}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/products?category=${category.slug}`}>
                      All {category.name}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {category.subcategories.map((sub) => (
                    <DropdownMenuItem key={sub.id} asChild>
                      <Link href={`/products?category=${category.slug}&subcategory=${sub.slug}`}>
                        {sub.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
