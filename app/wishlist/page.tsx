'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, ArrowRight, Star, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWishlistStore, useCartStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const { toast } = useToast()
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const addToCart = useCartStore((state) => state.addItem)

  const handleAddToCart = (productId: string) => {
    const product = items.find((item) => item.id === productId)
    if (product) {
      addToCart(product, 1)
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      })
    }
  }

  const handleRemove = (productId: string, productName: string) => {
    removeItem(productId)
    toast({
      title: 'Removed from wishlist',
      description: `${productName} has been removed from your wishlist.`,
    })
  }

  const handleShare = async () => {
    const wishlistText = items
      .map((item) => `${item.name} - ${formatPrice(item.price)}`)
      .join('\n')

    if (navigator.share) {
      await navigator.share({
        title: 'My TTD software Wishlist',
        text: wishlistText,
      })
    } else {
      await navigator.clipboard.writeText(wishlistText)
      toast({
        title: 'Wishlist copied',
        description: 'Your wishlist has been copied to clipboard.',
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <Heart className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Your wishlist is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Save items you love by clicking the heart icon on any product.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            Explore Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist ({items.length} items)</h1>
          <p className="mt-1 text-muted-foreground">
            Items you've saved for later
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                clearWishlist()
                toast({
                  title: 'Wishlist cleared',
                  description: 'All items have been removed from your wishlist.',
                })
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <Card key={product.id} className="group overflow-hidden">
            <div className="relative">
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.discount > 0 && (
                    <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Badge variant="outline">Out of Stock</Badge>
                    </div>
                  )}
                </div>
              </Link>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => handleRemove(product.id, product.name)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {product.brand}
              </p>
              <Link
                href={`/product/${product.slug}`}
                className="mt-1 block font-medium hover:text-primary line-clamp-2"
              >
                {product.name}
              </Link>

              <div className="mt-2 flex items-center gap-1">
                <div className="flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 text-xs text-success-foreground">
                  <span>{product.rating}</span>
                  <Star className="h-3 w-3 fill-current" />
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount.toLocaleString('en-IN')})
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <Button
                className="mt-4 w-full"
                onClick={() => handleAddToCart(product.id)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/products">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
