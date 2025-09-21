import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/client'
import { getFirebaseClient } from '@/lib/firebase/client'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  initialInWishlist?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  showText?: boolean
  onToggle?: (inWishlist: boolean) => void
  className?: string
}

export default function WishlistButton({
  productId,
  initialInWishlist = false,
  size = 'md',
  variant = 'ghost',
  showText = false,
  onToggle,
  className
}: WishlistButtonProps) {
  const { user } = useAuth()
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [isLoading, setIsLoading] = useState(false)

  const getAuthToken = async () => {
    const { auth } = getFirebaseClient()
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('Not authenticated')
    return await currentUser.getIdToken()
  }

  const handleToggleWishlist = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/login'
      return
    }

    setIsLoading(true)

    try {
      const token = await getAuthToken()
      const method = inWishlist ? 'DELETE' : 'POST'
      
      const response = await fetch('/api/wishlist', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update wishlist')
      }

      setInWishlist(result.inWishlist)
      onToggle?.(result.inWishlist)

    } catch (error) {
      console.error('Error toggling wishlist:', error)
      // Could show a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  // Update local state if initialInWishlist changes
  useEffect(() => {
    setInWishlist(initialInWishlist)
  }, [initialInWishlist])

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        showText && 'w-auto px-3',
        className
      )}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500',
          isLoading && 'animate-pulse'
        )} 
      />
      {showText && (
        <span className="ml-2 text-sm">
          {inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        </span>
      )}
    </Button>
  )
}