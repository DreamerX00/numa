import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/session';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';

// Enhanced validation schema for adding items to cart
const addToCartSchema = z.object({
  productId: z.string()
    .min(1, "Product ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
  variantId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid variant ID format")
    .optional()
    .or(z.literal(null)),
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
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid item ID format"),
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

    // Atomic upsert-like flow without upsert (safe for nullable variantId)
    const whereFilter = {
      userId: dbUser.id,
      productId: productId,
      variantId: variantId ?? null,
    } as const;

    // 1) Attempt atomic increment if item exists
    const updated = await prisma.cartItem.updateMany({
      where: whereFilter,
      data: {
        quantity: { increment: quantity },
        price: currentPrice,
      },
    });

    let cartItem;
    if (updated.count > 0) {
      // 2) If updated, fetch the item to return
      cartItem = await prisma.cartItem.findFirst({
        where: whereFilter,
        include: {
          product: {
            include: {
              category: true,
              brand: true,
              variants: true,
            },
          },
        },
      });
    } else {
      // 3) Not found: try to create
      try {
        cartItem = await prisma.cartItem.create({
          data: {
            userId: dbUser.id,
            productId: productId,
            variantId: variantId ?? null,
            quantity: quantity,
            price: currentPrice,
          },
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                variants: true,
              },
            },
          },
        });
      } catch (err) {
        // 4) Race condition: someone created it concurrently -> increment and fetch
        type PrismaKnownError = { code: string };
        const code = (typeof err === 'object' && err && 'code' in err ? (err as PrismaKnownError).code : undefined);
        if (code === 'P2002') {
          await prisma.cartItem.updateMany({
            where: whereFilter,
            data: {
              quantity: { increment: quantity },
              price: currentPrice,
            },
          });
          cartItem = await prisma.cartItem.findFirst({
            where: whereFilter,
            include: {
              product: {
                include: {
                  category: true,
                  brand: true,
                  variants: true,
                },
              },
            },
          });
        } else {
          throw err;
        }
      }
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

export async function PUT(req: NextRequest) {
  return cartRateLimit(req, async () => {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      
      // Validate input using Zod schema
      const validationResult = updateCartSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Validation error', details: validationResult.error.issues },
          { status: 400 }
        );
      }

      const { itemId, quantity } = validationResult.data;

      const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: user.uid }
      });

      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Find the cart item
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          userId: dbUser.id
        }
      });

      if (!existingCartItem) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }

      if (quantity === 0) {
        // Delete the item
        await prisma.cartItem.delete({
          where: { id: itemId }
        });

        return NextResponse.json({
          message: 'Item removed from cart successfully'
        });
      } else {
        // Update quantity
        const cartItem = await prisma.cartItem.update({
          where: { id: itemId },
          data: { quantity },
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                variants: true,
              }
            }
          }
        });

        return NextResponse.json({
          message: 'Cart updated successfully',
          cartItem
        });
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      console.error('Error updating cart:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req: NextRequest) {
  return cartRateLimit(req, async () => {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { itemId } = body;

      if (!itemId) {
        return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
      }

      const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: user.uid }
      });

      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Find and delete the cart item
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          userId: dbUser.id
        }
      });

      if (!existingCartItem) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }

      await prisma.cartItem.delete({
        where: { id: itemId }
      });

      return NextResponse.json({
        message: 'Item removed from cart successfully'
      });

    } catch (error) {
      console.error('Error removing from cart:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}