import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendDirectEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const settings = await getSettings();
    const siteName = settings.general.siteName || "NUMA Store";
    const fromEmail = process.env.FROM_EMAIL || settings.general.supportEmail;

    const info = await transporter.sendMail({
      from: `"${siteName}" <${fromEmail}>`,
      ...options,
    });
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Email template types
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderConfirmationData {
  to: string;
  customerName: string;
  orderNumber: string;
  orderItems: OrderItem[];
  subtotal: number;
  totalAmount: number;
  shippingAddress?: ShippingAddress;
}

export interface PaymentFailedData {
  to: string;
  customerName: string;
  orderNumber: string;
  amount: number;
}

// Order confirmation email template
export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  const settings = await getSettings();
  const siteName = settings.general.siteName || "NUMA";
  const supportEmail = settings.general.supportEmail || "support@numa.com";

  const itemsHtml = data.orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 12px; border-radius: 4px;">` : ""}
          <div>
            <p style="margin: 0; font-weight: 600; color: #333;">${item.name}</p>
            <p style="margin: 0; color: #666; font-size: 14px;">Qty: ${item.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const shippingHtml = data.shippingAddress
    ? `
    <div style="margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
      <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px;">Shipping Address</h3>
      <p style="margin: 0; color: #666; line-height: 1.5;">
        ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
        ${data.shippingAddress.address}<br>
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
        ${data.shippingAddress.country}
      </p>
    </div>
  `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Order Confirmation - ${siteName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #E7654D;">
        <h1 style="margin: 0; color: #E7654D; font-size: 28px; font-weight: 700;">${siteName}</h1>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 16px;">Order Confirmation</p>
      </div>

      <!-- Greeting -->
      <h2 style="color: #333; margin-bottom: 16px;">Thank you for your order, ${data.customerName}!</h2>
      
      <p style="color: #666; margin-bottom: 24px;">
        We've received your order and are processing it now. You'll receive a shipping confirmation email when your items are on their way.
      </p>

      <!-- Order Details -->
      <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 24px; overflow: hidden;">
        <div style="background: #f8f9fa; padding: 16px; border-bottom: 1px solid #ddd;">
          <h3 style="margin: 0; font-size: 18px; color: #333;">Order #${data.orderNumber}</h3>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 16px; font-weight: 600; text-align: right; border-top: 2px solid #E7654D;">
              Total: ₹${data.totalAmount.toFixed(2)}
            </td>
            <td></td>
          </tr>
        </table>
      </div>

      ${shippingHtml}

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Questions about your order? Contact us at <a href="mailto:${supportEmail}" style="color: #E7654D;">${supportEmail}</a></p>
        <p style="margin-top: 16px;">
          © 2025 ${siteName}. All rights reserved.
        </p>
      </div>
      
    </body>
    </html>
  `;

  return sendDirectEmail({
    to: data.to,
    subject: `Order Confirmation - ${data.orderNumber}`,
    html,
    text: `Thank you for your order! Order #${data.orderNumber} - Total: ₹${data.totalAmount.toFixed(2)}`,
  });
}

// Payment failed email template
export async function sendPaymentFailedEmail(data: PaymentFailedData) {
  const settings = await getSettings();
  const siteName = settings.general.siteName || "NUMA";
  const supportEmail = settings.general.supportEmail || "support@numa.com";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Payment Failed - ${siteName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #E7654D;">
        <h1 style="margin: 0; color: #E7654D; font-size: 28px; font-weight: 700;">${siteName}</h1>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 16px;">Payment Update</p>
      </div>

      <!-- Content -->
      <h2 style="color: #dc3545; margin-bottom: 16px;">Payment Failed</h2>
      
      <p style="color: #666; margin-bottom: 16px;">
        Hello ${data.customerName},
      </p>
      
      <p style="color: #666; margin-bottom: 24px;">
        We were unable to process the payment for your order #${data.orderNumber} (₹${data.amount.toFixed(2)}). 
        Your order has been cancelled, but you can try placing it again.
      </p>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #856404;">
          <strong>What can you do?</strong><br>
          • Check your payment method and try again<br>
          • Contact your bank if the issue persists<br>
          • Reach out to our support team for assistance
        </p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/cart" style="background: #E7654D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Try Again
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #E7654D;">${supportEmail}</a></p>
        <p style="margin-top: 16px;">
          © 2025 ${siteName}. All rights reserved.
        </p>
      </div>
      
    </body>
    </html>
  `;

  return sendDirectEmail({
    to: data.to,
    subject: `Payment Failed - Order ${data.orderNumber}`,
    html,
    text: `Payment failed for order #${data.orderNumber}. Please try again or contact support.`,
  });
}

// Shipping confirmation email
export async function sendShippingConfirmationEmail(data: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}) {
  const settings = await getSettings();
  const siteName = settings.general.siteName || "NUMA";
  const supportEmail = settings.general.supportEmail || "support@numa.com";

  const trackingHtml = data.trackingNumber
    ? `
    <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 8px 0; color: #2e7d32; font-weight: 600;">Tracking Number</p>
      <p style="margin: 0; font-family: monospace; font-size: 18px; color: #1b5e20; font-weight: 700;">
        ${data.trackingNumber}
      </p>
    </div>
  `
    : "";

  const deliveryHtml = data.estimatedDelivery
    ? `
    <p style="color: #666; margin-bottom: 16px;">
      <strong>Estimated Delivery:</strong> ${data.estimatedDelivery}
    </p>
  `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Order Shipped - ${siteName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #E7654D;">
        <h1 style="margin: 0; color: #E7654D; font-size: 28px; font-weight: 700;">${siteName}</h1>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 16px;">Shipping Update</p>
      </div>

      <!-- Content -->
      <h2 style="color: #4caf50; margin-bottom: 16px;">Your order is on its way!</h2>
      
      <p style="color: #666; margin-bottom: 16px;">
        Hello ${data.customerName},
      </p>
      
      <p style="color: #666; margin-bottom: 16px;">
        Great news! Your order #${data.orderNumber} has been shipped and is on its way to you.
      </p>

      ${deliveryHtml}
      ${trackingHtml}

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Track your order or contact us at <a href="mailto:${supportEmail}" style="color: #E7654D;">${supportEmail}</a></p>
        <p style="margin-top: 16px;">
          © 2025 ${siteName}. All rights reserved.
        </p>
      </div>
      
    </body>
    </html>
  `;

  return sendDirectEmail({
    to: data.to,
    subject: `Order Shipped - ${data.orderNumber}`,
    html,
    text: `Your order #${data.orderNumber} has been shipped! ${data.trackingNumber ? `Tracking: ${data.trackingNumber}` : ""}`,
  });
}

// Additional order status email templates
export interface OrderStatusUpdateData {
  to: string;
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
  items?: OrderItem[];
  totalAmount?: number;
  shippingAddress?: ShippingAddress;
}

export async function sendOrderProcessingEmail(data: OrderStatusUpdateData) {
  const settings = await getSettings();
  const siteName = settings.general.siteName || "NUMA";
  const supportEmail = settings.general.supportEmail || "support@numa.com";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Processing - ${data.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #E7654D; margin: 0;">${siteName}</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="color: #333; margin: 0 0 16px 0;">Your order is being processed</h2>
        <p style="margin: 0; color: #666;">Hi ${data.customerName}, we're now preparing your order for shipment.</p>
      </div>
      
      <div style="background: white; border: 1px solid #eee; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333;">Order Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: #8B5CF6;">Processing</span></p>
        ${data.notes ? `<p style="margin: 8px 0 0 0; color: #666;"><em>${data.notes}</em></p>` : ""}
      </div>
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Questions? Contact us at <a href="mailto:${supportEmail}" style="color: #E7654D;">${supportEmail}</a></p>
        <p style="margin-top: 16px;">
          © 2025 ${siteName}. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendDirectEmail({
    to: data.to,
    subject: `Order Processing - ${data.orderNumber}`,
    html,
    text: `Your order #${data.orderNumber} is now being processed. We'll send you tracking information once it ships.`,
  });
}

export async function sendOrderDeliveredEmail(data: OrderStatusUpdateData) {
  const settings = await getSettings();
  const siteName = settings.general.siteName || "NUMA";
  const supportEmail = settings.general.supportEmail || "support@numa.com";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Delivered - ${data.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #E7654D; margin: 0;">${siteName}</h1>
      </div>
      
      <div style="background: #f0f9ff; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10B981;">
        <h2 style="color: #333; margin: 0 0 16px 0;">🎉 Your order has been delivered!</h2>
        <p style="margin: 0; color: #666;">Hi ${data.customerName}, your order has been successfully delivered. We hope you love your new items!</p>
      </div>
      
      <div style="background: white; border: 1px solid #eee; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333;">Order Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: #10B981;">Delivered</span></p>
        ${data.trackingNumber ? `<p style="margin: 0 0 8px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ""}
      </div>
      
      <div style="background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #EA580C;">Love your purchase?</h4>
        <p style="margin: 0 0 12px 0; color: #666;">Share your experience and help other customers by leaving a review.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="display: inline-block; background: #E7654D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Write a Review</a>
      </div>
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #E7654D;">${supportEmail}</a></p>
        <p style="margin-top: 16px;">
          © 2025 ${siteName}. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendDirectEmail({
    to: data.to,
    subject: `Order Delivered - ${data.orderNumber}`,
    html,
    text: `Great news! Your order #${data.orderNumber} has been delivered. Thanks for choosing NUMA!`,
  });
}

export async function sendOrderCancelledEmail(data: OrderStatusUpdateData) {
  const settings = await getSettings();
  const siteName = settings.general.siteName || "NUMA";
  const supportEmail = settings.general.supportEmail || "support@numa.com";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Cancelled - ${data.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #E7654D; margin: 0;">${siteName}</h1>
      </div>
      
      <div style="background: #FEF2F2; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #EF4444;">
        <h2 style="color: #333; margin: 0 0 16px 0;">Order Cancelled</h2>
        <p style="margin: 0; color: #666;">Hi ${data.customerName}, your order has been cancelled as requested.</p>
      </div>
      
      <div style="background: white; border: 1px solid #eee; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #333;">Order Details</h3>
        <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: #EF4444;">Cancelled</span></p>
        ${data.totalAmount ? `<p style="margin: 0 0 8px 0;"><strong>Refund Amount:</strong> ₹${data.totalAmount.toFixed(2)}</p>` : ""}
        ${data.notes ? `<p style="margin: 8px 0 0 0; color: #666;"><em>${data.notes}</em></p>` : ""}
      </div>
      
      <div style="background: #F0F9FF; border: 1px solid #3B82F6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #1D4ED8;">Refund Information</h4>
        <p style="margin: 0; color: #666;">If payment was processed, your refund will be processed within 5-7 business days and will appear on your original payment method.</p>
      </div>
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Questions about your cancellation? Contact us at <a href="mailto:${supportEmail}" style="color: #E7654D;">${supportEmail}</a></p>
        <p style="margin-top: 16px;">
          © 2025 ${siteName}. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendDirectEmail({
    to: data.to,
    subject: `Order Cancelled - ${data.orderNumber}`,
    html,
    text: `Your order #${data.orderNumber} has been cancelled. If payment was processed, you'll receive a refund within 5-7 business days.`,
  });
}
