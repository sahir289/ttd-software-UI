'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, SlidersHorizontal, X, ChevronDown, Grid, List, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card'
import { products, categories } from '@/lib/mock-data'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Discount' },
]

const brands = [...new Set(products.map(p => p.brand))]
const priceRanges = [
  { min: 0, max: 1000, label: 'Under Rs.1,000' },
  { min: 1000, max: 5000, label: 'Rs.1,000 - Rs.5,000' },
  { min: 5000, max: 10000, label: 'Rs.5,000 - Rs.10,000' },
  { min: 10000, max: 25000, label: 'Rs.10,000 - Rs.25,000' },
  { min: 25000, max: 50000, label: 'Rs.25,000 - Rs.50,000' },
  { min: 50000, max: 100000, label: 'Rs.50,000 - Rs.1,00,000' },
  { min: 100000, max: Infinity, label: 'Above Rs.1,00,000' },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false)

  // Filter states
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    searchParams.get('category')
  )
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string | null>(
    searchParams.get('subcategory')
  )
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([])
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 200000])
  const [minRating, setMinRating] = React.useState<number>(0)
  const [inStockOnly, setInStockOnly] = React.useState(false)
  const [sortBy, setSortBy] = React.useState('popularity')
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('search') || '')

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Filter products
  const filteredProducts = React.useMemo(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory)
      if (category) {
        result = result.filter(p => p.category === category.name)
      }
    }

    // Subcategory filter
    if (selectedSubcategory) {
      result = result.filter(p => p.subcategory.toLowerCase().replace(/\s+/g, '-') === selectedSubcategory)
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand))
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating)
    }

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0)
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'discount':
        result.sort((a, b) => b.discount - a.discount)
        break
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount)
    }

    return result
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedBrands, priceRange, minRating, inStockOnly, sortBy])

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSelectedBrands([])
    setPriceRange([0, 200000])
    setMinRating(0)
    setInStockOnly(false)
    setSearchQuery('')
  }

  const activeFilterCount = [
    selectedCategory,
    selectedSubcategory,
    selectedBrands.length > 0,
    priceRange[0] > 0 || priceRange[1] < 200000,
    minRating > 0,
    inStockOnly,
  ].filter(Boolean).length

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-medium">Search</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedSubcategory(null)
                }}
                className={`block w-full text-left text-sm ${!selectedCategory ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.slug)
                      setSelectedSubcategory(null)
                    }}
                    className={`block w-full text-left text-sm ${selectedCategory === category.slug ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {category.name}
                  </button>
                  {selectedCategory === category.slug && (
                    <div className="ml-3 mt-1 space-y-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubcategory(sub.slug)}
                          className={`block w-full text-left text-xs ${selectedSubcategory === sub.slug ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Price Range */}
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={200000}
                step={1000}
                className="mt-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setPriceRange([range.min, range.max === Infinity ? 200000 : range.max])}
                    className="block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Brands */}
      <Accordion type="single" collapsible defaultValue="brands">
        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Brands
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={brand}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBrands([...selectedBrands, brand])
                      } else {
                        setSelectedBrands(selectedBrands.filter(b => b !== brand))
                      }
                    }}
                  />
                  <label htmlFor={brand} className="text-sm cursor-pointer">
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Rating */}
      <Accordion type="single" collapsible defaultValue="rating">
        <AccordionItem value="rating" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Customer Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  className={`flex items-center gap-1 text-sm ${minRating === rating ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {rating}+ Stars & above
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(!!checked)}
        />
        <label htmlFor="in-stock" className="text-sm cursor-pointer">
          In Stock Only
        </label>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
          Clear All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-6 max-w-[1920px] mx-auto">
      <div className="flex gap-6 lg:gap-8">
        {/* Desktop Sidebar - Always Visible on Large Screens */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Filter className="h-5 w-5" />
              Filters
            </h2>
            <FilterContent />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedCategory
                  ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                  : searchQuery
                    ? `Search: "${searchQuery}"`
                    : 'All Products'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredProducts.length} products found
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button - Only visible on smaller screens */}
              <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden bg-transparent">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search Input */}
              <div className="relative hidden md:block lg:hidden xl:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] xl:w-[250px] pl-9"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden items-center rounded-md border sm:flex">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.slug === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedBrands.map((brand) => (
                <Badge key={brand} variant="secondary" className="gap-1">
                  {brand}
                  <button onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 200000) && (
                <Badge variant="secondary" className="gap-1">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  <button onClick={() => setPriceRange([0, 200000])}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(0)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {inStockOnly && (
                <Badge variant="secondary" className="gap-1">
                  In Stock
                  <button onClick={() => setInStockOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Products Grid - Responsive columns based on available space */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 15 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No products found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
