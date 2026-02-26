'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import type { Product } from '@/lib/types'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [imageIndex, setImageIndex] = React.useState(0)

  const addToCart = useCartStore((state) => state.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const { toast } = useToast()

  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

  return (
    <Card
      className={cn('group relative overflow-hidden transition-all hover:shadow-lg', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setImageIndex(0)
      }}
    >
      <Link href={`/product/${product.slug}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[imageIndex] || product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
              -{product.discount}%
            </Badge>
          )}

          {/* Tags */}
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {product.tags.includes('bestseller') && (
              <Badge variant="secondary" className="text-xs">
                Bestseller
              </Badge>
            )}
            {product.tags.includes('new') && (
              <Badge className="bg-success text-success-foreground text-xs">
                New
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className={cn(
              'absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 transition-all duration-300',
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
          >
            <Button
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          {/* Wishlist Button */}
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              'absolute right-2 top-12 h-8 w-8 transition-all duration-300',
              isHovered || isWishlisted ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
            )}
            onClick={handleToggleWishlist}
          >
            <Heart
              className={cn('h-4 w-4', isWishlisted && 'fill-destructive text-destructive')}
            />
          </Button>

          {/* Image Dots */}
          {product.images.length > 1 && isHovered && (
            <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-all',
                    index === imageIndex ? 'bg-primary w-3' : 'bg-background/80'
                  )}
                  onMouseEnter={() => setImageIndex(index)}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setImageIndex(index)
                  }}
                />
              ))}
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="outline" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3">
          {/* Brand */}
          <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>

          {/* Name */}
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 text-xs text-success-foreground">
              <span className="font-medium">{product.rating}</span>
              <Star className="h-3 w-3 fill-current" />
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount.toLocaleString('en-IN')})
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-xs font-medium text-success">
                  {product.discount}% off
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="mt-1 text-xs text-warning">
              Only {product.stock} left in stock!
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

// Skeleton for loading state
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square animate-pulse bg-muted" />
      <CardContent className="p-3">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex items-center gap-2">
          <div className="h-5 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-6 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}
