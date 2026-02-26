"use client"

import React, { Suspense } from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: 5 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function NavItem({ item, pathname, onClick }: { item: typeof NAV_ITEMS[0]; pathname: string; onClick?: () => void }) {
  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon className="h-5 w-5" />
        {item.label}
      </div>
      {item.badge && (
        <Badge variant="secondary" className={isActive ? "bg-primary-foreground/20 text-primary-foreground" : ""}>
          {item.badge}
        </Badge>
      )}
    </Link>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-screen bg-muted/30">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
              <Package className="h-6 w-6 text-primary" />
              <span>Admin</span>
            </Link>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
          
          <div className="border-t p-4">
            <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
              Back to Store
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
            {/* Mobile Menu */}
            <div className="flex items-center gap-4 lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-16 items-center border-b px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
                      <Package className="h-6 w-6 text-primary" />
                      <span>Admin</span>
                    </Link>
                  </div>
                  <nav className="space-y-1 p-4">
                    {NAV_ITEMS.map((item) => (
                      <NavItem
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        onClick={() => setIsMobileMenuOpen(false)}
                      />
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <span className="font-semibold lg:hidden">Admin</span>
            </div>

            {/* Search */}
            <div className="hidden flex-1 lg:block lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products, orders, customers..."
                  className="w-full pl-10"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@TTDsoftware.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  )
}
