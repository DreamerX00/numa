import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Rate limiter for order creation
const orderRateLimit = rateLimit(rateLimitConfigs.payment);

// Order item schema
const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().min(1).max(100),
  priceAtAdd: z.number().min(0)
});

// Shipping address schema
const shippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().regex(/^\d{6}$/, "Invalid postal code"),
  country: z.string().default('IN'),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  alternateEmail: z.string().email().optional(),
  alternatePhone: z.string().regex(/^[6-9]\d{9}$/, "Invalid alternate phone").optional()
});

// Create order schema
const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.string().min(1),
  currency: z.string().default('INR')
});

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
  return orderRateLimit(req, async () => {
    try {
      console.log('Creating order...');
      
      // Validate request body
      const body = await req.json();
      const validationResult = createOrderSchema.safeParse(body);
      
      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.error.errors);
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid request data',
            details: validationResult.error.errors
          },
          { status: 400 }
        );
      }

      const { items, shippingAddress, shippingMethod, currency } = validationResult.data;

      // Get user (optional for guest checkout)
      const user = await getUserFromRequest(req);
      let dbUser = null;
      
      if (user) {
        dbUser = await prisma.user.findUnique({
          where: { firebaseUid: user.uid }
        });
        
        if (!dbUser) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }
      }

      // Fetch product details and validate inventory
      const productPromises = items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: item.variantId ? {
              where: { id: item.variantId }
            } : false
          }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (!product.isActive || product.status !== 'ACTIVE') {
          throw new Error(`Product ${product.name} is not available`);
        }

        // Check inventory
        let availableQuantity = product.quantity;
        let variant = null;
        
        if (item.variantId && product.variants && product.variants.length > 0) {
          variant = product.variants[0];
          availableQuantity = variant.quantity;
        }

        if (product.trackQuantity && availableQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${availableQuantity}, Requested: ${item.quantity}`);
        }

        return {
          product,
          variant,
          requestedQuantity: item.quantity,
          priceAtAdd: item.priceAtAdd
        };
      });

      const productDetails = await Promise.all(productPromises);

      // Calculate totals
      const subtotal = productDetails.reduce((sum, detail) => {
        return sum + (detail.priceAtAdd * detail.requestedQuantity);
      }, 0);

      // Calculate shipping (simplified - you can enhance this with your shipping service)
      const shippingAmount = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
      
      // Calculate tax (18% GST)
      const taxAmount = (subtotal + shippingAmount) * 0.18;
      const totalAmount = subtotal + shippingAmount + taxAmount;

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create address record
      let addressRecord = null;
      if (dbUser) {
        // Save address for logged-in users
        addressRecord = await prisma.address.create({
          data: {
            userId: dbUser.id,
            type: 'SHIPPING',
            isDefault: false,
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            company: shippingAddress.company,
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            phone: shippingAddress.phone
          }
        });
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // Convert to paise
        currency: currency,
        receipt: orderNumber,
        notes: {
          order_number: orderNumber,
          customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          shipping_method: shippingMethod
        }
      });

      // Create order in database
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: dbUser?.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
          subtotal,
          taxAmount,
          shippingAmount,
          discountAmount: 0,
          totalAmount,
          currency,
          shippingAddressId: addressRecord?.id,
          billingAddressId: addressRecord?.id, // Same as shipping for now
          razorpayOrderId: razorpayOrder.id,
          shippingMethod,
          items: {
            create: productDetails.map((detail) => ({
              productId: detail.product.id,
              variantId: detail.variant?.id,
              name: detail.product.name,
              sku: detail.variant?.sku || detail.product.sku,
              price: detail.priceAtAdd,
              quantity: detail.requestedQuantity,
              productSnapshot: {
                id: detail.product.id,
                name: detail.product.name,
                description: detail.product.description,
                images: detail.product.images,
                variant: detail.variant ? {
                  id: detail.variant.id,
                  name: detail.variant.name,
                  attributes: detail.variant.attributes,
                  image: detail.variant.image
                } : null
              }
            }))
          }
        },
        include: {
          items: true
        }
      });

      console.log('Order created successfully:', order.id);

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          razorpayOrderId: razorpayOrder.id,
          amount: totalAmount,
          currency: currency,
          items: order.items
        },
        razorpay: {
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: razorpayOrder.id
        }
      });

    } catch (error) {
      console.error('Order creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: 500 }
      );
    }
  });
}