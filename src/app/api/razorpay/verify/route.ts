import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/session";
import { z } from "zod";
import { rateLimit, rateLimitConfigs } from "@/lib/rate-limit";

// Rate limiter for payment verification
const paymentRateLimit = rateLimit(rateLimitConfigs.payment);

// Validation schema for payment verification
const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

// Contract
// POST /api/razorpay/verify
// Body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
// Response: { success: boolean; order?: Order }

export async function POST(req: NextRequest) {
  return paymentRateLimit(req, async () => {
    try {
      const body = await req.json();
      
      // Validate input using Zod schema
      const validationResult = verifyPaymentSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: "Invalid input", details: errors },
          { status: 400 }
        );
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validationResult.data;

      // Verify user authentication
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

      // Find the order
      const order = await prisma.order.findFirst({
        where: { 
          razorpayOrderId: razorpay_order_id,
          userId: dbUser.id 
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          shippingAddress: true,
          billingAddress: true
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Verify the payment signature
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      if (!key_secret) {
        return NextResponse.json({ error: "Razorpay key secret not configured" }, { status: 500 });
      }

      const body_str = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(body_str)
        .digest("hex");

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        // Update order as payment verification failed
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            paymentStatus: "FAILED",
            status: "CANCELLED",
            updatedAt: new Date()
          }
        });

        return NextResponse.json(
          { 
            error: "Payment verification failed", 
            success: false 
          }, 
          { status: 400 }
        );
      }

      // Payment verified successfully - update order status
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { 
          paymentStatus: "PAID",
          paymentMethod: "razorpay",
          paymentIntentId: razorpay_payment_id,
          status: "CONFIRMED",
          updatedAt: new Date()
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          shippingAddress: true,
          billingAddress: true,
          user: {
            include: {
              profile: true
            }
          }
        }
      });

      // Clear user's cart after successful payment
      await prisma.cartItem.deleteMany({
        where: { userId: dbUser.id }
      });

      return NextResponse.json({
        success: true,
        order: {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          totalAmount: updatedOrder.totalAmount,
          currency: updatedOrder.currency,
          items: updatedOrder.items,
          shippingAddress: updatedOrder.shippingAddress,
          createdAt: updatedOrder.createdAt
        }
      });

    } catch (err: unknown) {
      console.error("/api/razorpay/verify error", err);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
    }
  });
}