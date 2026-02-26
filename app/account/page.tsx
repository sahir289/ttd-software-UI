"use client"

import Link from "next/link"
import { Package, MapPin, Heart, CreditCard, ArrowRight, ShoppingBag, Clock, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore, useWishlistStore } from "@/lib/store"
import { formatPrice, formatDate } from "@/lib/utils"
import { mockOrders } from "@/lib/mock-data"

export default function AccountOverviewPage() {
  const user = useAuthStore((state) => state.user)
  const wishlistItems = useWishlistStore((state) => state.items)
  
  const recentOrders = mockOrders.slice(0, 3)
  
  const stats = [
    { label: "Total Orders", value: mockOrders.length, icon: Package },
    { label: "Wishlist Items", value: wishlistItems.length, icon: Heart },
    { label: "Saved Addresses", value: user?.addresses?.length || 0, icon: MapPin },
    { label: "Payment Methods", value: 1, icon: CreditCard },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {user?.name?.split(" ")[0] || "User"}!</h2>
              <p className="text-muted-foreground">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>
            <Link href="/products">
              <Button>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchase activity</CardDescription>
          </div>
          <Link href="/account/orders">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      {order.status === "delivered" ? (
                        <Package className="h-5 w-5 text-success" />
                      ) : order.status === "shipped" ? (
                        <Truck className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items | {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "shipped"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          order.status === "delivered"
                            ? "bg-success text-success-foreground"
                            : ""
                        }
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">No orders yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Start shopping to see your orders here
              </p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/account/addresses">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Addresses</h3>
                <p className="text-sm text-muted-foreground">Add or edit delivery addresses</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/account/payments">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">Manage saved cards and UPI</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/wishlist">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">My Wishlist</h3>
                <p className="text-sm text-muted-foreground">View and manage saved items</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
