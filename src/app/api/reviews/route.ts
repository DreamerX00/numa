import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth/session'
import { z } from 'zod'

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().optional(),
  content: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication via NextAuth session
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      select: { id: true, status: true }
    })

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 })
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: validatedData.productId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      )
    }

    // Check if user has purchased this product (for verified purchase)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: validatedData.productId,
        order: {
          userId: user.id,
          status: 'DELIVERED'
        }
      }
    })

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        images: validatedData.images || [],
        isVerifiedPurchase: !!hasPurchased,
        isApproved: true // Auto-approve for now, can add moderation later
      },
      include: {
        user: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    // Update product's average rating and review count
    const reviewStats = await prisma.review.aggregate({
      where: {
        productId: validatedData.productId,
        isApproved: true
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    })

    await prisma.product.update({
      where: { id: validatedData.productId },
      data: {
        averageRating: reviewStats._avg.rating || 0,
        reviewCount: reviewStats._count.id || 0
      }
    })

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: review.images,
        isVerifiedPurchase: review.isVerifiedPurchase,
        helpfulCount: review.helpfulCount,
        createdAt: review.createdAt,
        user: {
          name: review.user.profile ? 
            `${review.user.profile.firstName || ''} ${review.user.profile.lastName || ''}`.trim() : 
            'Anonymous',
          avatar: review.user.profile?.avatar
        }
      }
    })

  } catch (error) {
    console.error('Error creating review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const sortBy = searchParams.get('sortBy') || 'newest' // newest, oldest, highest, lowest, helpful
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Build sort conditions
    type OrderByType = { 
      createdAt?: 'asc' | 'desc'
      rating?: 'asc' | 'desc'
      helpfulCount?: 'asc' | 'desc'
    }
    
    let orderBy: OrderByType = { createdAt: 'desc' } // default: newest
    
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'highest':
        orderBy = { rating: 'desc' }
        break
      case 'lowest':
        orderBy = { rating: 'asc' }
        break
      case 'helpful':
        orderBy = { helpfulCount: 'desc' }
        break
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          isApproved: true
        },
        include: {
          user: {
            select: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({
        where: {
          productId,
          isApproved: true
        }
      })
    ])

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        isApproved: true
      },
      _count: {
        rating: true
      }
    })

    // Format rating distribution
    const distribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1
      const found = ratingDistribution.find(r => r.rating === rating)
      return {
        rating,
        count: found?._count.rating || 0
      }
    }).reverse() // 5 stars first

    // Format reviews
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      images: review.images,
      isVerifiedPurchase: review.isVerifiedPurchase,
      helpfulCount: review.helpfulCount,
      createdAt: review.createdAt,
      user: {
        name: review.user.profile ? 
          `${review.user.profile.firstName || ''} ${review.user.profile.lastName || ''}`.trim() : 
          'Anonymous',
        avatar: review.user.profile?.avatar
      }
    }))

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      },
      ratingDistribution: distribution,
      summary: {
        totalReviews: totalCount,
        averageRating: distribution.reduce((sum, item) => sum + (item.rating * item.count), 0) / totalCount || 0
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}