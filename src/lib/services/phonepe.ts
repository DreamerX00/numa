import crypto from 'crypto';
import { PhonePeConfig, PhonePePaymentRequest } from '@/lib/types/phonepe';

// PhonePe configuration from environment variables
export const getPhonePeConfig = (): PhonePeConfig => {
  return {
    merchantId: process.env.PHONEPE_MERCHANT_ID!,
    saltKey: process.env.PHONEPE_SALT_KEY!,
    saltIndex: parseInt(process.env.PHONEPE_SALT_INDEX || '1'),
    hostUrl: process.env.PHONEPE_HOST_URL!,
    redirectUrl: process.env.PHONEPE_REDIRECT_URL!,
    callbackUrl: process.env.PHONEPE_CALLBACK_URL!,
  };
};

// Generate X-VERIFY header for PhonePe API authentication
export const generateXVerifyHeader = (payload: string, saltKey: string, saltIndex: number): string => {
  const payloadHash = crypto.createHash('sha256').update(payload + '/pg/v1/pay' + saltKey).digest('hex');
  return `${payloadHash}###${saltIndex}`;
};

// Generate X-VERIFY header for status check
export const generateStatusXVerifyHeader = (merchantId: string, merchantTransactionId: string, saltKey: string, saltIndex: number): string => {
  const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const payloadHash = crypto.createHash('sha256').update(endpoint + saltKey).digest('hex');
  return `${payloadHash}###${saltIndex}`;
};

// Verify callback signature
export const verifyCallbackSignature = (response: string, xVerifyHeader: string, saltKey: string): boolean => {
  try {
    const [receivedHash, saltIndex] = xVerifyHeader.split('###');
    const expectedHash = crypto.createHash('sha256').update(response + saltKey).digest('hex');
    return receivedHash === expectedHash;
  } catch (error) {
    console.error('Error verifying callback signature:', error);
    return false;
  }
};

// Generate unique merchant transaction ID (max 38 chars for PhonePe)
export const generateMerchantTransactionId = (prefix: string = 'NUMA'): string => {
  const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
  const random = crypto.randomBytes(3).toString('hex'); // 6 chars
  const txnId = `${prefix}_${timestamp}_${random}`.toUpperCase();
  
  // Ensure it's within 38 character limit
  if (txnId.length > 38) {
    // Fallback: use shorter format
    const shortRandom = crypto.randomBytes(2).toString('hex'); // 4 chars
    return `${prefix.slice(0, 2)}_${timestamp}_${shortRandom}`.toUpperCase();
  }
  
  return txnId;
};

// Create payment payload for PhonePe
export const createPaymentPayload = (
  merchantId: string,
  merchantTransactionId: string,
  merchantUserId: string,
  amount: number,
  redirectUrl: string,
  callbackUrl: string,
  mobileNumber?: string
): PhonePePaymentRequest => {
  return {
    merchantId,
    merchantTransactionId,
    merchantUserId,
    amount: amount * 100, // Convert to paise
    redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl,
    mobileNumber,
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };
};

// Decode base64 callback response
export const decodeCallbackResponse = (encodedResponse: string): any => {
  try {
    const decodedBytes = Buffer.from(encodedResponse, 'base64');
    const decodedString = decodedBytes.toString('utf-8');
    return JSON.parse(decodedString);
  } catch (error) {
    console.error('Error decoding callback response:', error);
    throw new Error('Invalid callback response format');
  }
};

// Format amount for display (from paise to rupees)
export const formatAmountFromPaise = (amountInPaise: number): number => {
  return amountInPaise / 100;
};

// Format amount for PhonePe API (from rupees to paise)
export const formatAmountToPaise = (amountInRupees: number): number => {
  return Math.round(amountInRupees * 100);
};

// Validate PhonePe environment configuration
export const validatePhonePeConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = process.env;

  if (!config.PHONEPE_MERCHANT_ID) errors.push('PHONEPE_MERCHANT_ID is required');
  if (!config.PHONEPE_SALT_KEY) errors.push('PHONEPE_SALT_KEY is required');
  if (!config.PHONEPE_SALT_INDEX) errors.push('PHONEPE_SALT_INDEX is required');
  if (!config.PHONEPE_HOST_URL) errors.push('PHONEPE_HOST_URL is required');
  if (!config.PHONEPE_REDIRECT_URL) errors.push('PHONEPE_REDIRECT_URL is required');
  if (!config.PHONEPE_CALLBACK_URL) errors.push('PHONEPE_CALLBACK_URL is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

// PhonePe API endpoints
export const PHONEPE_ENDPOINTS = {
  PAY: '/pg/v1/pay',
  STATUS: '/pg/v1/status',
  REFUND: '/pg/v1/refund'
} as const;