'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem, User, Address, ProductFilters, Order } from './types'

// Cart Store
interface CartState {
  items: CartItem[]
  couponCode: string | null
  couponDiscount: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  getSubtotal: () => number
  getGST: () => number
  getDeliveryCharge: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, item.product.stock) }
                  : item
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      },

      getGST: () => {
        const subtotal = get().getSubtotal()
        return Math.round(subtotal * 0.18) // 18% GST
      },

      getDeliveryCharge: () => {
        const subtotal = get().getSubtotal()
        if (subtotal >= 500) return 0 // Free delivery above ₹500
        return 49
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const gst = get().getGST()
        const delivery = get().getDeliveryCharge()
        const { couponDiscount } = get()
        return subtotal + gst + delivery - couponDiscount
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    { name: 'cart-storage' }
  )
)

// Wishlist Store
interface WishlistState {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          if (state.items.find(item => item.id === product.id)) {
            return state
          }
          return { items: [...state.items, product] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId),
        }))
      },

      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'wishlist-storage' }
  )
)

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  addAddress: (address: Address) => void
  updateAddress: (address: Address) => void
  removeAddress: (addressId: string) => void
  setDefaultAddress: (addressId: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUser: (updates) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      },

      addAddress: (address) => {
        const { user } = get()
        if (user) {
          const addresses = address.isDefault
            ? user.addresses.map(a => ({ ...a, isDefault: false }))
            : user.addresses
          set({ user: { ...user, addresses: [...addresses, address] } })
        }
      },

      updateAddress: (address) => {
        const { user } = get()
        if (user) {
          let addresses = user.addresses.map(a =>
            a.id === address.id ? address : a
          )
          if (address.isDefault) {
            addresses = addresses.map(a =>
              a.id === address.id ? a : { ...a, isDefault: false }
            )
          }
          set({ user: { ...user, addresses } })
        }
      },

      removeAddress: (addressId) => {
        const { user } = get()
        if (user) {
          set({
            user: {
              ...user,
              addresses: user.addresses.filter(a => a.id !== addressId),
            },
          })
        }
      },

      setDefaultAddress: (addressId) => {
        const { user } = get()
        if (user) {
          set({
            user: {
              ...user,
              addresses: user.addresses.map(a => ({
                ...a,
                isDefault: a.id === addressId,
              })),
            },
          })
        }
      },
    }),
    { name: 'auth-storage' }
  )
)

// Filter Store
interface FilterState {
  filters: ProductFilters
  setFilters: (filters: ProductFilters) => void
  updateFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>()((set) => ({
  filters: {},

  setFilters: (filters) => set({ filters }),

  updateFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }))
  },

  clearFilters: () => set({ filters: {} }),
}))

// UI Store
interface UIState {
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  isCartOpen: boolean
  theme: 'light' | 'dark'
  toggleMobileMenu: () => void
  toggleSearch: () => void
  toggleCart: () => void
  setTheme: (theme: 'light' | 'dark') => void
  closeMobileMenu: () => void
  closeSearch: () => void
  closeCart: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      isCartOpen: false,
      theme: 'light',

      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setTheme: (theme) => set({ theme }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      closeSearch: () => set({ isSearchOpen: false }),
      closeCart: () => set({ isCartOpen: false }),
    }),
    { name: 'ui-storage' }
  )
)

// Orders Store (for demo purposes)
interface OrdersState {
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (order) => {
        set((state) => ({ orders: [order, ...state.orders] }))
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, orderStatus: status } : order
          ),
        }))
      },
    }),
    { name: 'orders-storage' }
  )
)
