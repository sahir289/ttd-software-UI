"use client"

import { useState } from "react"
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Users,
  ShoppingCart,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice, formatDate, getInitials } from "@/lib/utils"

const mockCustomers = [
  {
    id: "cust-1",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 9876543210",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
    totalOrders: 12,
    totalSpent: 45000,
    lastOrder: "2026-02-01",
    status: "active",
  },
  {
    id: "cust-2",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 9876543211",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    totalOrders: 8,
    totalSpent: 32000,
    lastOrder: "2026-01-28",
    status: "active",
  },
  {
    id: "cust-3",
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    phone: "+91 9876543212",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
    totalOrders: 5,
    totalSpent: 18500,
    lastOrder: "2026-01-15",
    status: "active",
  },
  {
    id: "cust-4",
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 9876543213",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha",
    totalOrders: 3,
    totalSpent: 12000,
    lastOrder: "2026-01-10",
    status: "inactive",
  },
  {
    id: "cust-5",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 9876543214",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram",
    totalOrders: 15,
    totalSpent: 67000,
    lastOrder: "2026-02-03",
    status: "active",
  },
]

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: mockCustomers.length,
    active: mockCustomers.filter((c) => c.status === "active").length,
    totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: Math.round(
      mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) /
      mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0)
    ),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer base
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-success/10 p-2">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.totalOrders}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.lastOrder)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === "active" ? "default" : "secondary"}
                        className={customer.status === "active" ? "bg-success text-success-foreground" : ""}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No customers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
