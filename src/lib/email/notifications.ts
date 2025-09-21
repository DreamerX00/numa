import { sendOrderConfirmationEmail, sendShippingConfirmationEmail, sendPaymentFailedEmail } from './templates';
import { prisma } from '@/lib/prisma';

// Email notification events
export type EmailEvent = 
  | 'order.confirmed'
  | 'order.shipped' 
  | 'order.delivered'
  | 'payment.failed'
  | 'user.welcome'
  | 'password.reset';

// Email notification data
interface EmailNotificationData {
  event: EmailEvent;
  userId?: string;
  orderId?: string;
  metadata?: Record<string, string | number | boolean>;
}

// Main email notification dispatcher
export async function sendEmailNotification(data: EmailNotificationData) {
  try {
    switch (data.event) {
      case 'order.confirmed':
        if (data.orderId) {
          await handleOrderConfirmedEmail(data.orderId);
        }
        break;
        
      case 'order.shipped':
        if (data.orderId) {
          await handleOrderShippedEmail(data.orderId, data.metadata);
        }
        break;

      case 'payment.failed':
        if (data.orderId) {
          await handlePaymentFailedEmail(data.orderId);
        }
        break;

      case 'user.welcome':
        if (data.userId) {
          await handleUserWelcomeEmail(data.userId);
        }
        break;

      default:
        console.log(`Unhandled email event: ${data.event}`);
    }
  } catch (error) {
    console.error(`Failed to send email notification for ${data.event}:`, error);
    // Don't throw error to avoid breaking the main flow
  }
}

// Handler functions for each email type
async function handleOrderConfirmedEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { include: { profile: true } },
      items: { include: { product: true } },
      shippingAddress: true
    }
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  await sendOrderConfirmationEmail({
    to: order.user.email,
    customerName: order.user.profile?.firstName || order.user.email.split('@')[0],
    orderNumber: order.orderNumber,
    orderItems: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images[0] || ''
    })),
    subtotal: order.subtotal,
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress ? {
      firstName: order.shippingAddress.firstName,
      lastName: order.shippingAddress.lastName,
      address: order.shippingAddress.address1,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country
    } : undefined
  });
}

async function handleOrderShippedEmail(orderId: string, metadata?: Record<string, string | number | boolean>) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { include: { profile: true } }
    }
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  await sendShippingConfirmationEmail({
    to: order.user.email,
    customerName: order.user.profile?.firstName || order.user.email.split('@')[0],
    orderNumber: order.orderNumber,
    trackingNumber: typeof metadata?.trackingNumber === 'string' ? metadata.trackingNumber : undefined,
    estimatedDelivery: typeof metadata?.estimatedDelivery === 'string' ? metadata.estimatedDelivery : undefined
  });
}

async function handlePaymentFailedEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { include: { profile: true } }
    }
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  await sendPaymentFailedEmail({
    to: order.user.email,
    customerName: order.user.profile?.firstName || order.user.email.split('@')[0],
    orderNumber: order.orderNumber,
    amount: order.totalAmount
  });
}

async function handleUserWelcomeEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // You can implement welcome email template here
  console.log(`Welcome email should be sent to: ${user.email}`);
}

// Helper function to queue email for background processing
export function queueEmailNotification(data: EmailNotificationData) {
  // In a production environment, you might want to use a queue system like Bull or Sidekiq
  // For now, we'll use setImmediate to send emails asynchronously
  setImmediate(() => {
    sendEmailNotification(data).catch(error => {
      console.error('Background email notification failed:', error);
    });
  });
}