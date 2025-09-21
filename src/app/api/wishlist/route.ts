import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFirebaseAdmin } from '@/lib/firebase/admin'
import { z } from 'zod'

const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
})

const removeFromWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { adminAuth } = getFirebaseAdmin()
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = addToWishlistSchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      select: { id: true, status: true, isActive: true }
    })

    if (!product || !product.isActive || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 })
    }

    // Check if already in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: validatedData.productId
        }
      }
    })

    if (existingWishlistItem) {
      return NextResponse.json({ 
        success: true, 
        message: 'Product already in wishlist',
        inWishlist: true 
      })
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: validatedData.productId
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      inWishlist: true,
      wishlistItem: {
        id: wishlistItem.id,
        product: wishlistItem.product
      }
    })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { adminAuth } = getFirebaseAdmin()
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = removeFromWishlistSchema.parse(body)

    // Remove from wishlist
    const deletedWishlistItem = await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: validatedData.productId
      }
    })

    if (deletedWishlistItem.count === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Product not in wishlist',
        inWishlist: false 
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist',
      inWishlist: false
    })

  } catch (error) {
    console.error('Error removing from wishlist:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { adminAuth } = getFirebaseAdmin()
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Get wishlist items with pagination
    const [wishlistItems, totalCount] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: {
          userId: user.id,
          product: {
            isActive: true,
            status: 'ACTIVE'
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              comparePrice: true,
              images: true,
              averageRating: true,
              reviewCount: true,
              quantity: true,
              isActive: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.wishlistItem.count({
        where: {
          userId: user.id,
          product: {
            isActive: true,
            status: 'ACTIVE'
          }
        }
      })
    ])

    // Format wishlist items
    const formattedWishlistItems = wishlistItems.map(item => ({
      id: item.id,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        comparePrice: item.product.comparePrice,
        images: item.product.images,
        averageRating: item.product.averageRating,
        reviewCount: item.product.reviewCount,
        inStock: item.product.quantity > 0,
        isActive: item.product.isActive && item.product.status === 'ACTIVE'
      }
    }))

    return NextResponse.json({
      success: true,
      wishlistItems: formattedWishlistItems,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}