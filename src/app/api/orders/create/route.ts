import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import Razorpay from 'razorpay';

// Rate limiter for order creation
const orderRateLimit = rateLimit(rateLimitConfigs.payment);

// Order creation schema with cart items
const createOrderSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().optional(),
    quantity: z.number().min(1).max(100),
    price: z.number().min(0)
  })).min(1).max(50),
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  notes: z.record(z.string(), z.string()).optional()
});

// Contract
// POST /api/orders/create
// Body: { cartItems: CartItem[], shippingAddressId?: string, billingAddressId?: string, notes?: Record<string,string> }
// Response: { orderId: string, razorpayOrderId: string, amount: number, key_id: string }

export async function POST(req: NextRequest) {
  return orderRateLimit(req, async () => {
    try {
      // Get and validate user
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

      // Validate request body
      const body = await req.json();
      const validationResult = createOrderSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: "Invalid order data", details: errors },
          { status: 400 }
        );
      }

      const { cartItems, shippingAddressId, billingAddressId, notes } = validationResult.data;

      // Validate inventory and calculate totals in a transaction
      const orderData = await prisma.$transaction(async (tx) => {
        let subtotal = 0;
        const validatedItems = [];

        // Validate each cart item and check inventory
        for (const cartItem of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: cartItem.productId },
            include: {
              variants: cartItem.variantId ? {
                where: { id: cartItem.variantId }
              } : false
            }
          });

          if (!product || !product.isActive) {
            throw new Error(`Product not found or inactive: ${cartItem.productId}`);
          }

          // Check inventory (product level or variant level)
          let availableQuantity = product.quantity;
          let itemPrice = product.price;

          if (cartItem.variantId && product.hasVariants) {
            const variant = product.variants?.[0];
            if (!variant || !variant.isActive) {
              throw new Error(`Product variant not found: ${cartItem.variantId}`);
            }
            availableQuantity = variant.quantity;
            itemPrice = variant.price || product.price;
          }

          // Validate inventory
          if (product.trackQuantity && availableQuantity < cartItem.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${availableQuantity}, Requested: ${cartItem.quantity}`);
          }

          // Validate price (protect against price manipulation)
          if (Math.abs(cartItem.price - itemPrice) > 0.01) {
            throw new Error(`Price mismatch for ${product.name}. Expected: ${itemPrice}, Received: ${cartItem.price}`);
          }

          validatedItems.push({
            productId: product.id,
            variantId: cartItem.variantId,
            name: product.name,
            sku: product.sku,
            price: itemPrice,
            quantity: cartItem.quantity,
            productSnapshot: {
              name: product.name,
              description: product.description,
              images: product.images,
              price: product.price
            }
          });

          subtotal += itemPrice * cartItem.quantity;
        }

        // Calculate shipping and taxes
        const shippingAmount = subtotal >= 50000 ? 0 : 10000; // Free shipping over ₹500
        const taxAmount = subtotal * 0.18; // 18% GST
        const totalAmount = subtotal + shippingAmount + taxAmount;

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create Razorpay order
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        
        if (!key_id || !key_secret) {
          throw new Error("Razorpay keys not configured");
        }

        const razorpay = new Razorpay({ key_id, key_secret });
        
        // Create detailed order description with pricing
        const productDetails = validatedItems.slice(0, 2).map(item => {
          const itemTotal = item.price * item.quantity;
          return `${item.name} (₹${item.price} x${item.quantity} = ₹${itemTotal.toFixed(2)})`;
        });
        
        const orderDescription = validatedItems.length <= 2 
          ? productDetails.join(', ')
          : `${productDetails.join(', ')} + ${validatedItems.length - 2} more`;
        
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // amount in paise
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            orderNumber,
            customerEmail: dbUser.email,
            description: orderDescription,
            itemCount: validatedItems.length.toString(),
            subtotal: `₹${subtotal.toFixed(2)}`,
            shipping: `₹${shippingAmount.toFixed(2)}`,
            total: `₹${totalAmount.toFixed(2)}`,
            products: validatedItems.map(item => `${item.name} x${item.quantity}`).join(', '),
            source: notes?.source || 'web_checkout'
          }
        });

        // Create order in database
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: dbUser.id,
            subtotal,
            taxAmount,
            shippingAmount,
            totalAmount,
            currency: 'INR',
            status: 'PENDING',
            paymentStatus: 'PENDING',
            fulfillmentStatus: 'UNFULFILLED',
            razorpayOrderId: razorpayOrder.id,
            shippingAddressId,
            billingAddressId,
            items: {
              create: validatedItems
            }
          },
          include: {
            items: true
          }
        });

        return {
          order,
          razorpayOrder,
          key_id
        };
      });

      return NextResponse.json({
        orderId: orderData.order.id,
        orderNumber: orderData.order.orderNumber,
        razorpayOrderId: orderData.razorpayOrder.id,
        amount: orderData.razorpayOrder.amount,
        currency: orderData.razorpayOrder.currency,
        key_id: orderData.key_id,
        subtotal: orderData.order.subtotal,
        shippingAmount: orderData.order.shippingAmount,
        taxAmount: orderData.order.taxAmount,
        totalAmount: orderData.order.totalAmount
      }, { status: 201 });

    } catch (error: unknown) {
      console.error('Order creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Return specific error messages for inventory issues
      if (errorMessage.includes('Insufficient stock') || errorMessage.includes('not found')) {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create order',
        details: errorMessage 
      }, { status: 500 });
    }
  });
}