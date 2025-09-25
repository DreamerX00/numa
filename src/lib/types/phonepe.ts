// PhonePe Payment Gateway API Types
export interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: number;
  hostUrl: string;
  redirectUrl: string;
  callbackUrl: string;
}

export interface PhonePeErrorResponse {
  success: false;
  code: string;
  message: string;
  data?: unknown;
}

export interface PhonePePaymentRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: 'POST' | 'REDIRECT';
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: 'PAY_PAGE';
  };
}

export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: 'PENDING' | 'COMPLETED' | 'FAILED';
    responseCode: string;
    paymentInstrument: {
      type: string;
      utr?: string;
      cardType?: string;
      pgTransactionId?: string;
    };
  };
}

export interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: 'PENDING' | 'COMPLETED' | 'FAILED';
    responseCode: string;
    paymentInstrument: {
      type: string;
      utr?: string;
      cardType?: string;
      pgTransactionId?: string;
    };
  };
}

export interface PhonePeCallbackPayload {
  response: string; // Base64 encoded response
}

export interface PhonePeDecodedCallback {
  merchantId: string;
  merchantTransactionId: string;
  transactionId: string;
  amount: number;
  state: 'PENDING' | 'COMPLETED' | 'FAILED';
  responseCode: string;
  paymentInstrument: { 
    type: string;
    utr?: string;
    cardType?: string;
    pgTransactionId?: string;
  };
}

export interface PhonePeError {
  success: false;
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

// Payment states
export type PhonePePaymentState = 'PENDING' | 'COMPLETED' | 'FAILED';

// Response codes
export const PHONEPE_RESPONSE_CODES = {
  SUCCESS: 'PAYMENT_SUCCESS',
  PENDING: 'PAYMENT_PENDING',
  FAILED: 'PAYMENT_ERROR',
  DECLINED: 'PAYMENT_DECLINED',
  TIMED_OUT: 'TIMED_OUT',
  USER_CANCELLED: 'USER_CANCELLED'
} as const;

// Utility type for order creation
export interface CreatePhonePeOrderRequest {
  amount: number;
  currency: string;
  merchantTransactionId: string;
  merchantUserId: string;
  mobileNumber?: string;
  callbackUrl?: string;
  redirectUrl?: string;
}

export interface CreatePhonePeOrderResponse {
  success: boolean;
  paymentUrl?: string;
  merchantTransactionId: string;
  transactionId?: string;
  error?: string;
}