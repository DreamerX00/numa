import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/lib/services/shipping';
import { getUserFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { CartItem } from '@/lib/types/product';

// Validation schema for shipping calculation
const shippingCalculationSchema = z.object({
  orderTotal: z.number().min(0).optional(),
  userLocation: z.object({
    country: z.string().default('IN'),
    state: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  paymentMethod: z.enum(['razorpay', 'cod']).optional(),
  cartItems: z.array(z.object({
    id: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).optional(),
});

export async function GET() {
  try {
    // For backward compatibility, return basic config
    const config = await shippingService.getShippingConfig();
    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Failed to fetch shipping config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = shippingCalculationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { orderTotal, userLocation, paymentMethod, cartItems } = validationResult.data;
    const location = userLocation || { country: 'IN' };

    let items = cartItems;

    // If no cart items provided but orderTotal is given, create mock items
    if (!items && orderTotal !== undefined) {
      items = [{
        id: 'total',
        quantity: 1,
        price: orderTotal,
      }];
    }

    // If no items provided, try to get user's cart
    if (!items) {
      const user = await getUserFromRequest(req);
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { firebaseUid: user.uid }
        });

        if (dbUser) {
          const cartItems = await prisma.cartItem.findMany({
            where: { userId: dbUser.id },
            include: { product: true },
          });

          items = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          }));
        }
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No cart items found' },
        { status: 400 }
      );
    }

    // Convert to full CartItem format for shipping service
    const fullCartItems = items.map(item => ({
      id: item.id,
      productId: 'product',
      variantId: null,
      quantity: item.quantity,
      price: item.price,
      addedAt: new Date(),
      product: { id: 'product', name: 'Product' } as CartItem['product'],
      variant: null,
    }));

    // Calculate shipping options
    const result = await shippingService.calculateShipping(
      fullCartItems,
      location,
      paymentMethod
    );

    return NextResponse.json({
      success: true,
      data: {
        subtotal: result.subtotal,
        methods: result.methods,
        selectedMethod: result.selectedMethod,
        totalWithShipping: result.totalWithShipping,
        qualifiesForFreeShipping: result.qualifiesForFreeShipping,
        amountNeededForFreeShipping: result.amountNeededForFreeShipping,
        userLocation: location,
      }
    });

  } catch (error) {
    console.error('Failed to calculate shipping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}