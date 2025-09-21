import React, { useState, useEffect } from 'react'
import { Star, Filter, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ReviewCard, ReviewSummary } from './ReviewCard'
import ReviewForm from './ReviewForm'
import { useAuth } from '@/lib/auth/client'

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

interface RatingDistribution {
  rating: number
  count: number
}

interface ReviewsData {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  ratingDistribution: RatingDistribution[]
  summary: {
    totalReviews: number
    averageRating: number
  }
}

interface ProductReviewsProps {
  productId: string
  productName: string
  showWriteReview?: boolean
}

export default function ProductReviews({ productId, productName, showWriteReview = true }: ProductReviewsProps) {
  const { user } = useAuth()
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const fetchReviews = async (page = 1, sort = sortBy) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/reviews?productId=${productId}&page=${page}&sortBy=${sort}&limit=10`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      setReviewsData(data)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    fetchReviews(1, newSort)
  }

  const handlePageChange = (page: number) => {
    fetchReviews(page, sortBy)
  }

  const handleReviewSubmitted = () => {
    setShowReviewForm(false)
    fetchReviews(1, sortBy) // Refresh reviews
  }

  // TODO: Implement helpful vote functionality
  // const handleHelpful = async (reviewId: string) => {
  //   // Implementation pending
  // }

  if (loading && !reviewsData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchReviews()}>Try Again</Button>
      </div>
    )
  }

  if (!reviewsData) {
    return null
  }

  const { reviews, pagination, ratingDistribution, summary } = reviewsData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Reviews ({summary.totalReviews})
        </h2>

        {showWriteReview && user && (
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogTrigger asChild>
              <Button>
                <Star className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ReviewForm
                productId={productId}
                productName={productName}
                onSuccess={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {!user && showWriteReview && (
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>{' '}
            to write a review
          </p>
        )}
      </div>

      {/* Summary */}
      {summary.totalReviews > 0 && (
        <ReviewSummary
          totalReviews={summary.totalReviews}
          averageRating={summary.averageRating}
          ratingDistribution={ratingDistribution}
        />
      )}

      {/* Controls */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              // onHelpful={handleHelpful} // TODO: Implement helpful vote functionality
            />
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
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
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your thoughts about this product.
          </p>
          {user && showWriteReview && (
            <Button onClick={() => setShowReviewForm(true)}>
              Write the first review
            </Button>
          )}
        </div>
      )}
    </div>
  )
}