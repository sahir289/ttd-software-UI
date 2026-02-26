'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, Shield, Gift } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, calculateGST } from '@/lib/utils'
import { mockCoupons } from '@/lib/mock-data'

export default function CartPage() {
  const { toast } = useToast()
  const {
    items,
    couponCode,
    couponDiscount,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getGST,
    getDeliveryCharge,
    getTotal,
  } = useCartStore()

  const [couponInput, setCouponInput] = React.useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false)

  const subtotal = getSubtotal()
  const gst = getGST()
  const deliveryCharge = getDeliveryCharge()
  const total = getTotal()
  const gstBreakdown = calculateGST(subtotal)

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      toast({
        title: 'Enter coupon code',
        description: 'Please enter a valid coupon code.',
        variant: 'destructive',
      })
      return
    }

    setIsApplyingCoupon(true)

    // Simulate API call
    setTimeout(() => {
      const coupon = mockCoupons.find(
        (c) => c.code.toLowerCase() === couponInput.toLowerCase()
      )

      if (coupon) {
        if (subtotal < coupon.minPurchase) {
          toast({
            title: 'Minimum purchase not met',
            description: `Minimum purchase of ${formatPrice(coupon.minPurchase)} required.`,
            variant: 'destructive',
          })
        } else {
          let discount = 0
          if (coupon.type === 'percentage') {
            discount = Math.round((subtotal * coupon.value) / 100)
            if (coupon.maxDiscount) {
              discount = Math.min(discount, coupon.maxDiscount)
            }
          } else {
            discount = coupon.value
          }

          applyCoupon(coupon.code, discount)
          toast({
            title: 'Coupon applied!',
            description: `You saved ${formatPrice(discount)} with code ${coupon.code}`,
          })
        }
      } else {
        toast({
          title: 'Invalid coupon',
          description: 'The coupon code you entered is invalid or expired.',
          variant: 'destructive',
        })
      }

      setIsApplyingCoupon(false)
    }, 500)
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponInput('')
    toast({
      title: 'Coupon removed',
      description: 'The coupon has been removed from your cart.',
    })
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold">Shopping Cart ({items.length} items)</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="divide-y p-0">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-4">
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
                  >
                    <Image
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.product.brand}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          removeItem(item.product.id)
                          toast({
                            title: 'Item removed',
                            description: `${item.product.name} removed from cart.`,
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      {/* Quantity */}
                      <div className="flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.product.originalPrice > item.product.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.product.originalPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Coupon Section */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Apply Coupon
              </CardTitle>
            </CardHeader>
            <CardContent>
              {couponCode ? (
                <div className="flex items-center justify-between rounded-md bg-success/10 p-3">
                  <div>
                    <p className="font-medium text-success">
                      Coupon {couponCode} applied!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You save {formatPrice(couponDiscount)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  />
                  <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {mockCoupons.slice(0, 3).map((coupon) => (
                  <button
                    key={coupon.code}
                    onClick={() => setCouponInput(coupon.code)}
                    className="text-xs text-primary hover:underline"
                  >
                    {coupon.code}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({items.length} items)
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST (9%)</span>
                  <span>{formatPrice(gstBreakdown.cgst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST (9%)</span>
                  <span>{formatPrice(gstBreakdown.sgst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      formatPrice(deliveryCharge)
                    )}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {subtotal < 500 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(500 - subtotal)} more for free delivery
                </p>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Trust Badges */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border p-2">
              <Truck className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-1 text-xs">Free Delivery</p>
            </div>
            <div className="rounded-md border p-2">
              <Shield className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-1 text-xs">Secure Pay</p>
            </div>
            <div className="rounded-md border p-2">
              <Gift className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-1 text-xs">Gift Wrap</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
