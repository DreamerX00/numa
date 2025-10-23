import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth/session';
import { z } from 'zod';

const syncCartSchema = z.object({
  guestCartItems: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
    selectedAttributes: z.record(z.string(), z.any()).optional()
  }))
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { guestCartItems } = syncCartSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing cart items
    const existingCartItems = await prisma.cartItem.findMany({
      where: { userId: dbUser.id },
      include: {
        product: true
      }
    });

    // Merge guest cart with existing cart
    const mergedItems = new Map();

    // Add existing items to map
    existingCartItems.forEach(item => {
      const key = `${item.productId}-${item.variantId || 'no-variant'}`;
      mergedItems.set(key, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      });
    });

    // Merge guest items (add quantities if same product/variant)
    for (const guestItem of guestCartItems) {
      const key = `${guestItem.productId}-${guestItem.variantId || 'no-variant'}`;
      
      if (mergedItems.has(key)) {
        const existing = mergedItems.get(key);
        existing.quantity += guestItem.quantity;
      } else {
        mergedItems.set(key, guestItem);
      }
    }

    // Validate merged items and check inventory
    const validatedItems: Array<{
      productId: string;
      variantId: string | null;
      quantity: number;
      price: number;
    }> = [];
    for (const item of mergedItems.values()) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });

      if (!product || !product.isActive) {
        continue; // Skip inactive products
      }

      let availableQuantity = product.quantity;
      let price = product.price;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) continue; // Skip invalid variants
        availableQuantity = variant.quantity;
        price = variant.price ?? product.price; // Use product price if variant price is null
      }

      // Limit quantity to available stock
      const finalQuantity = Math.min(item.quantity, availableQuantity);
      
      if (finalQuantity > 0) {
        validatedItems.push({
          ...item,
          quantity: finalQuantity,
          price
        });
      }
    }

    // Clear existing cart and add merged items
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { userId: dbUser.id }
      });

      if (validatedItems.length > 0) {
        await tx.cartItem.createMany({
          data: validatedItems.map(item => ({
            userId: dbUser.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          }))
        });
      }
    });

    // Fetch updated cart
    const updatedCart = await prisma.cartItem.findMany({
      where: { userId: dbUser.id },
      include: {
        product: {
          include: {
            variants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      message: 'Cart synced successfully',
      items: updatedCart,
      mergedCount: validatedItems.length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error syncing cart:', error);
    return NextResponse.json(
      { error: 'Failed to sync cart' },
      { status: 500 }
    );
  }
}