// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number
  discount: number
  images: string[]
  category: string
  subcategory: string
  brand: string
  rating: number
  reviewCount: number
  stock: number
  specifications: Record<string, string>
  features: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  slug: string
}

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  gst: number
  deliveryCharge: number
  discount: number
  couponCode: string | null
  total: number
}

// User Types
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  addresses: Address[]
  role: 'user' | 'admin'
  createdAt: string
}

export interface Address {
  id: string
  name: string
  phone: string
  fullName: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  type: 'home' | 'work' | 'other'
}

// Order Types
export interface Order {
  status: string
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: PaymentMethod
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  orderStatus: OrderStatus
  subtotal: number
  gst: number
  deliveryCharge: number
  discount: number
  total: number
  couponCode: string | null
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: Product
  quantity: number
  price: number
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type PaymentMethod = 
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'cod'
  | 'razorpay'

// Review Types
export interface Review {
  id: string
  userId: string
  userName: string
  productId: string
  rating: number
  title: string
  comment: string
  images?: string[]
  helpful: number
  verified: boolean
  createdAt: string
}

// Coupon Types
export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  maxDiscount?: number
  validFrom: string
  validTo: string
  usageLimit: number
  usedCount: number
}

// Filter Types
export interface ProductFilters {
  category?: string
  subcategory?: string
  priceRange?: [number, number]
  brands?: string[]
  rating?: number
  inStock?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity'
  search?: string
}

// GST Calculation
export interface GSTBreakdown {
  cgst: number
  sgst: number
  igst: number
  totalGst: number
  taxableAmount: number
}

// Admin Types
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  ordersToday: number
  revenueToday: number
  pendingOrders: number
  lowStockProducts: number
}

export interface InventoryItem {
  product: Product
  stockLevel: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastRestocked: string
}
