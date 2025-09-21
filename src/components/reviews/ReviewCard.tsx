import React from 'react'
import { Star, ThumbsUp, Badge as BadgeIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  title?: string
  content?: string
  images: string[]
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
  user: {
    name: string
    avatar?: string
  }
}

interface ReviewCardProps {
  review: Review
  onHelpful?: (reviewId: string) => void
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user.avatar} alt={review.user.name} />
                <AvatarFallback>
                  {getUserInitials(review.user.name || 'Anonymous')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.user.name || 'Anonymous'}</span>
                  {review.isVerifiedPurchase && (
                    <Badge variant="secondary" className="text-xs">
                      <BadgeIcon className="w-3 h-3 mr-1" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="font-semibold">{review.title}</h4>
          )}

          {/* Content */}
          {review.content && (
            <p className="text-muted-foreground leading-relaxed">
              {review.content}
            </p>
          )}

          {/* Images */}
          {review.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-w-md">
              {review.images.map((imageUrl, index) => (
                <div key={index} className="aspect-square relative">
                  <Image
                    src={imageUrl}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Could open a modal or lightbox here
                      window.open(imageUrl, '_blank')
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onHelpful?.(review.id)}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Helpful ({review.helpfulCount})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RatingDistribution {
  rating: number
  count: number
}

interface ReviewSummaryProps {
  totalReviews: number
  averageRating: number
  ratingDistribution: RatingDistribution[]
}

export function ReviewSummary({ totalReviews, averageRating, ratingDistribution }: ReviewSummaryProps) {
  const maxCount = Math.max(...ratingDistribution.map(r => r.count))

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}