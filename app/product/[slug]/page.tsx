'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Heart,
  ShoppingCart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  Minus,
  Plus,
  Check,
  ChevronRight,
  Package,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ProductCard } from '@/components/product/product-card'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { products, mockReviews } from '@/lib/mock-data'
import { formatPrice, formatDate, validatePincode, calculateGST } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [pincode, setPincode] = React.useState('')
  const [pincodeChecked, setPincodeChecked] = React.useState(false)
  const [deliveryInfo, setDeliveryInfo] = React.useState<string | null>(null)

  const product = products.find((p) => p.slug === params.slug)
  const addToCart = useCartStore((state) => state.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const isWishlisted = product ? isInWishlist(product.id) : false

  if (!product) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The product you are looking for does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const gstBreakdown = calculateGST(product.price)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: 'Added to cart',
      description: `${quantity} x ${product.name} added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    addToCart(product, quantity)
    window.location.href = '/checkout'
  }

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  const handleCheckPincode = () => {
    if (validatePincode(pincode)) {
      setPincodeChecked(true)
      // Simulate delivery date calculation
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 2)
      setDeliveryInfo(`Delivery by ${formatDate(deliveryDate)}`)
    } else {
      toast({
        title: 'Invalid PIN code',
        description: 'Please enter a valid 6-digit PIN code.',
        variant: 'destructive',
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copied',
        description: 'Product link copied to clipboard.',
      })
    }
  }

  // Rating distribution (mock data)
  const ratingDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 8 },
    { stars: 2, percentage: 4 },
    { stars: 1, percentage: 3 },
  ]

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/products?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`}
          className="hover:text-foreground"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.discount > 0 && (
              <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                -{product.discount}% OFF
              </Badge>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                  selectedImage === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-muted-foreground'
                )}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand & Title */}
          <div>
            <Link
              href={`/products?brand=${product.brand}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {product.brand}
            </Link>
            <h1 className="mt-1 text-2xl font-bold leading-tight lg:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded bg-success px-2 py-1 text-sm font-medium text-success-foreground">
              <span>{product.rating}</span>
              <Star className="h-4 w-4 fill-current" />
            </div>
            <span className="text-sm text-muted-foreground">
              {product.reviewCount.toLocaleString('en-IN')} Ratings & Reviews
            </span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge className="bg-success text-success-foreground">
                    {product.discount}% off
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Inclusive of all taxes
            </p>
          </div>

          <Separator />

          {/* Key Features */}
          <div>
            <h3 className="font-medium">Highlights</h3>
            <ul className="mt-2 space-y-1">
              {product.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Quantity */}
          <div>
            <h3 className="font-medium">Quantity</h3>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {product.stock <= 10 && product.stock > 0 && (
                <span className="text-sm text-warning">
                  Only {product.stock} left!
                </span>
              )}
            </div>
          </div>

          {/* Delivery Check */}
          <div>
            <h3 className="flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4" />
              Delivery
            </h3>
            <div className="mt-2 flex gap-2">
              <Input
                type="text"
                placeholder="Enter PIN code"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value)
                  setPincodeChecked(false)
                  setDeliveryInfo(null)
                }}
                maxLength={6}
                className="w-40"
              />
              <Button variant="outline" onClick={handleCheckPincode}>
                Check
              </Button>
            </div>
            {pincodeChecked && deliveryInfo && (
              <p className="mt-2 flex items-center gap-2 text-sm text-success">
                <Truck className="h-4 w-4" />
                {deliveryInfo}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <Badge variant="outline" className="bg-success/10 text-success">
                In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToggleWishlist}
              className={cn(isWishlisted && 'text-destructive')}
            >
              <Heart
                className={cn('mr-2 h-4 w-4', isWishlisted && 'fill-current')}
              />
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
            <div className="flex flex-col items-center text-center">
              <Truck className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs">7 Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <h3 className="mt-6 font-semibold">Key Features</h3>
                <ul className="mt-3 space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b py-2 last:border-0"
                    >
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {/* GST Breakdown */}
                <Separator className="my-6" />
                <h3 className="font-semibold">Price Breakdown (GST Invoice)</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxable Amount</span>
                    <span>{formatPrice(gstBreakdown.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST (9%)</span>
                    <span>{formatPrice(gstBreakdown.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST (9%)</span>
                    <span>{formatPrice(gstBreakdown.sgst)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(product.price + gstBreakdown.totalGst)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Rating Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{product.rating}</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-4 w-4',
                              i < Math.floor(product.rating)
                                ? 'fill-warning text-warning'
                                : 'text-muted-foreground'
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.reviewCount.toLocaleString('en-IN')} reviews
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {ratingDistribution.map((item) => (
                      <div key={item.stars} className="flex items-center gap-2">
                        <span className="w-8 text-sm">{item.stars}</span>
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <Progress value={item.percentage} className="flex-1" />
                        <span className="w-10 text-right text-sm text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 text-xs font-medium text-success-foreground">
                                <span>{review.rating}</span>
                                <Star className="h-3 w-3 fill-current" />
                              </div>
                              <span className="font-medium">{review.title}</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>{review.userName}</span>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Related Products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
