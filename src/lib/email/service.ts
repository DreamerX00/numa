import nodemailer from 'nodemailer';
import { 
  sendOrderConfirmationEmail, 
  sendPaymentFailedEmail, 
  sendShippingConfirmationEmail,
  sendOrderProcessingEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  type OrderConfirmationData,
  type PaymentFailedData,
  type OrderStatusUpdateData
} from './templates';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: unknown;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    // If template is specified, use template functions
    if (options.template && options.data) {
      switch (options.template) {
        case 'orderConfirmed':
          return await sendOrderConfirmationEmail({ 
            to: options.to, 
            ...options.data 
          } as OrderConfirmationData);
        case 'paymentFailed':
          return await sendPaymentFailedEmail({ 
            to: options.to, 
            ...options.data 
          } as PaymentFailedData);
        case 'orderShipped':
          return await sendShippingConfirmationEmail({ 
            to: options.to, 
            ...options.data 
          } as Parameters<typeof sendShippingConfirmationEmail>[0]);
        case 'orderProcessing':
          return await sendOrderProcessingEmail({ 
            to: options.to, 
            ...options.data 
          } as OrderStatusUpdateData);
        case 'orderDelivered':
          return await sendOrderDeliveredEmail({ 
            to: options.to, 
            ...options.data 
          } as OrderStatusUpdateData);
        case 'orderCancelled':
          return await sendOrderCancelledEmail({ 
            to: options.to, 
            ...options.data 
          } as OrderStatusUpdateData);
        default:
          console.warn(`Unknown email template: ${options.template}`);
          break;
      }
    }

    // Fallback to direct email sending
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'NUMA Store'}" <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email server is ready to take our messages');
    return true;
  } catch (error) {
    console.error('Email server configuration error:', error);
    return false;
  }
}