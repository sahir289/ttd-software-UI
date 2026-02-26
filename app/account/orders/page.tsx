"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, Truck, Clock, CheckCircle2, Search, Filter, ArrowRight, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice, formatDate } from "@/lib/utils"
import { mockOrders } from "@/lib/mock-data"

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "text-warning" },
  processing: { label: "Processing", icon: Package, color: "text-primary" },
  shipped: { label: "Shipped", icon: Truck, color: "text-primary" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-success" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-destructive" },
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filteredOrders = mockOrders
    .filter((order) => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "highest") return b.total - a.total
      if (sortBy === "lowest") return a.total - b.total
      return 0
    })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>Track and manage your orders</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order number..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
                return (
                  <div
                    key={order.id}
                    className="rounded-lg border p-4 transition-colors hover:border-primary/50"
                  >
                    {/* Order Header */}
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg bg-muted p-2 ${statusConfig.color}`}>
                          <statusConfig.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={order.status === "delivered" ? "default" : "secondary"}
                          className={order.status === "delivered" ? "bg-success text-success-foreground" : ""}
                        >
                          {statusConfig.label}
                        </Badge>
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted"
                        >
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    {/* Order Footer */}
                    <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""} | 
                        Payment: {order.paymentMethod.replace("_", " ").toUpperCase()}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        {order.status === "delivered" && (
                          <Button variant="secondary" size="sm">
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">No orders found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "You haven't placed any orders yet"}
              </p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
