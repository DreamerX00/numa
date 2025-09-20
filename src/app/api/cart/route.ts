import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/session';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Enhanced validation schema for adding items to cart
const addToCartSchema = z.object({
  productId: z.string()
    .min(1, "Product ID is required")
    .uuid("Invalid product ID format"),
  variantId: z.string()
    .uuid("Invalid variant ID format")
    .optional(),
  quantity: z.number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100")
    .default(1)
});

// Enhanced validation schema for updating cart items
const updateCartSchema = z.object({
  itemId: z.string()
    .min(1, "Item ID is required")
    .uuid("Invalid item ID format"),
  quantity: z.number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative")
    .max(100, "Quantity cannot exceed 100")
});

// Rate limiter for cart operations
const cartRateLimit = rateLimit(rateLimitConfigs.api);

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: dbUser.id },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            variants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate cart totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return NextResponse.json({
      items: cartItems,
      summary: {
        itemCount,
        subtotal,
        currency: 'INR'
      }
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return cartRateLimit(req, async () => {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      
      // Validate input using Zod schema
      const validationResult = addToCartSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: "Invalid input", details: errors },
          { status: 400 }
        );
      }

      const { productId, variantId, quantity } = validationResult.data;

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.uid }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or unavailable' }, { status: 404 });
    }

    // Get current price (from variant if specified, otherwise product price)
    let currentPrice = product.price;
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant || !variant.isActive) {
        return NextResponse.json({ error: 'Product variant not found' }, { status: 404 });
      }
      currentPrice = variant.price || product.price;
    }

    // Check if item already exists in cart
    const existingCartItem = variantId 
      ? await prisma.cartItem.findFirst({
          where: {
            userId: dbUser.id,
            productId,
            variantId: variantId
          }
        })
      : await prisma.cartItem.findFirst({
          where: {
            userId: dbUser.id,
            productId,
            variantId: null
          }
        });

    let cartItem;
    
    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { 
          quantity: existingCartItem.quantity + quantity,
          price: currentPrice // Update price in case it changed
        },
        include: {
          product: {
            include: {
              category: true,
              brand: true
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: dbUser.id,
          productId,
          variantId: variantId ?? undefined,
          quantity,
          price: currentPrice
        },
        include: {
          product: {
            include: {
              category: true,
              brand: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      message: 'Item added to cart successfully',
      cartItem
    });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      console.error('Error adding to cart:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}