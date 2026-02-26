'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Tag, Percent, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card'
import { products, categories } from '@/lib/mock-data'
import { cn, formatPrice } from '@/lib/utils'

// Hero Banner Data
const heroBanners = [
  {
    id: 1,
    title: 'Big Sale Days',
    subtitle: 'Up to 70% Off on Electronics',
    description: 'Shop the best deals on smartphones, laptops, and accessories',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    cta: 'Shop Now',
    link: '/products?category=electronics',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    id: 2,
    title: 'Fashion Week',
    subtitle: 'New Arrivals Collection',
    description: 'Discover the latest trends in fashion for men and women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    cta: 'Explore',
    link: '/products?category=fashion',
    gradient: 'from-rose-500/20 to-rose-500/5',
  },
  {
    id: 3,
    title: 'Home Essentials',
    subtitle: 'Transform Your Space',
    description: 'Kitchen appliances, furniture, and decor at best prices',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    cta: 'Shop Home',
    link: '/products?category=home-kitchen',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
]

// Deal of the Day
const dealOfTheDay = products.find(p => p.discount >= 30) || products[0]

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-rotate banners
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const featuredProducts = products.slice(0, 8)
  const bestsellers = products.filter(p => p.tags.includes('bestseller')).slice(0, 4)
  const deals = products.filter(p => p.discount >= 20).slice(0, 4)

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Banner Carousel */}
      <section className="relative overflow-hidden">
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
          {heroBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={cn(
                'absolute inset-0 transition-all duration-700',
                index === currentBanner
                  ? 'opacity-100 translate-x-0'
                  : index < currentBanner
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
              )}
            >
              <div className="relative h-full w-full">
                <Image
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className={cn('absolute inset-0 bg-gradient-to-r', banner.gradient)} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="container relative flex h-full items-end pb-12 md:items-center md:pb-0">
                  <div className="max-w-xl text-foreground">
                    <Badge className="mb-4">{banner.subtitle}</Badge>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                      {banner.title}
                    </h1>
                    <p className="mt-4 text-muted-foreground md:text-lg">
                      {banner.description}
                    </p>
                    <Button asChild size="lg" className="mt-6">
                      <Link href={banner.link}>
                        {banner.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Banner Navigation */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === currentBanner ? 'w-6 bg-primary' : 'w-2 bg-foreground/30'
                )}
              />
            ))}
          </div>

          {/* Arrow Navigation */}
          <button
            onClick={() => setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg hover:bg-background"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentBanner((prev) => (prev + 1) % heroBanners.length)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg hover:bg-background"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="container">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group"
            >
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-square">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-center text-sm font-medium">{category.name}</h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Deal of the Day */}
      <section className="container">
        <Card className="overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-0">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative aspect-square md:aspect-auto">
                <Image
                  src={dealOfTheDay.images[0] || "/placeholder.svg"}
                  alt={dealOfTheDay.name}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                  <Zap className="mr-1 h-3 w-3" />
                  Deal of the Day
                </Badge>
              </div>
              <div className="flex flex-col justify-center p-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{dealOfTheDay.brand}</Badge>
                  <Badge variant="secondary">{dealOfTheDay.category}</Badge>
                </div>
                <h3 className="mt-4 text-2xl font-bold">{dealOfTheDay.name}</h3>
                <p className="mt-2 text-muted-foreground line-clamp-2">{dealOfTheDay.description}</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-bold">{formatPrice(dealOfTheDay.price)}</span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(dealOfTheDay.originalPrice)}
                  </span>
                  <Badge className="bg-success text-success-foreground">
                    {dealOfTheDay.discount}% OFF
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Stock: </span>
                    <span className="font-medium text-success">{dealOfTheDay.stock} left</span>
                  </div>
                </div>
                <Button asChild size="lg" className="mt-6 w-fit">
                  <Link href={`/product/${dealOfTheDay.slug}`}>
                    Buy Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Products */}
      <section className="container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Featured Products</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="bg-muted/30 py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Bestsellers</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products?tag=bestseller">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="container">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/products?category=electronics" className="group">
            <Card className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600"
                alt="Electronics Sale"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
              <CardContent className="relative flex h-full flex-col justify-center">
                <Badge className="w-fit">Limited Time</Badge>
                <h3 className="mt-2 text-xl font-bold">Electronics Sale</h3>
                <p className="text-muted-foreground">Up to 50% off on gadgets</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/products?category=fashion" className="group">
            <Card className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600"
                alt="Fashion Week"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
              <CardContent className="relative flex h-full flex-col justify-center">
                <Badge variant="secondary" className="w-fit">New Arrivals</Badge>
                <h3 className="mt-2 text-xl font-bold">Fashion Week</h3>
                <p className="text-muted-foreground">Trending styles await</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Deals & Offers */}
      <section className="container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Top Deals</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products?tag=deal">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container">
        <Card>
          <CardContent className="grid grid-cols-2 gap-6 p-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">1M+</span>
              </div>
              <p className="mt-2 font-medium">Happy Customers</p>
              <p className="text-sm text-muted-foreground">Across India</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">50K+</span>
              </div>
              <p className="mt-2 font-medium">Products</p>
              <p className="text-sm text-muted-foreground">Quality assured</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">500+</span>
              </div>
              <p className="mt-2 font-medium">Cities</p>
              <p className="text-sm text-muted-foreground">Pan India delivery</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">4.8</span>
              </div>
              <p className="mt-2 font-medium">Rating</p>
              <p className="text-sm text-muted-foreground">Customer satisfaction</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
