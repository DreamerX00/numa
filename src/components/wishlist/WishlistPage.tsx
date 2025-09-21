import React, { useState, useEffect } from 'react'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/client'
import { getFirebaseClient } from '@/lib/firebase/client'
import { useCartStore } from '@/lib/store/cart'
import WishlistButton from './WishlistButton'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images: string[]
  averageRating?: number | null
  reviewCount: number
  inStock: boolean
  isActive: boolean
}

interface WishlistItem {
  id: string
  createdAt: string
  product: Product
}

interface WishlistData {
  wishlistItems: WishlistItem[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export default function WishlistPage() {
  const { user } = useAuth()
  const addItem = useCartStore((state) => state.addItem)
  const [wishlistData, setWishlistData] = useState<WishlistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const getAuthToken = async () => {
    const { auth } = getFirebaseClient()
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('Not authenticated')
    return await currentUser.getIdToken()
  }

  const fetchWishlist = async (page = 1) => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const token = await getAuthToken()
      
      const response = await fetch(
        `/api/wishlist?page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist')
      }

      const data = await response.json()
      setWishlistData(data)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setError('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return

    // Convert to cart product format
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price: product.price
    }

    // Type assertion is safe here as we're providing required fields
    addItem(cartProduct as Parameters<typeof addItem>[0], null, 1)
  }

  const handleWishlistToggle = (productId: string, inWishlist: boolean) => {
    if (!inWishlist) {
      // Remove from local state when removed from wishlist
      setWishlistData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          wishlistItems: prev.wishlistItems.filter(item => item.product.id !== productId)
        }
      })
    }
  }

  const handlePageChange = (page: number) => {
    fetchWishlist(page)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your Wishlist</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your wishlist
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading && !wishlistData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchWishlist()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const wishlistItems = wishlistData?.wishlistItems || []
  const pagination = wishlistData?.pagination

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {pagination?.totalCount || 0} item{pagination?.totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative">
                    {/* Product Image */}
                    <Link href={`/product/${item.product.slug}`}>
                      <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={item.product.images[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {!item.product.inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <Badge variant="secondary">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2">
                      <WishlistButton
                        productId={item.product.id}
                        initialInWishlist={true}
                        size="sm"
                        variant="outline"
                        onToggle={(inWishlist) => handleWishlistToggle(item.product.id, inWishlist)}
                        className="bg-white/90 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {item.product.averageRating && item.product.reviewCount > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= Math.round(item.product.averageRating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({item.product.reviewCount})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.product.comparePrice)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(item.product)}
                        disabled={!item.product.inStock || !item.product.isActive}
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage || loading}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start exploring our collection and save your favorite items to your wishlist.
          </p>
          <Button asChild>
            <Link href="/collections">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  )
}