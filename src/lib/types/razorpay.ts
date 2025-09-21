// Shared Razorpay type definitions
export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  handler: (response: { 
    razorpay_payment_id: string; 
    razorpay_order_id: string; 
    razorpay_signature: string 
  }) => void;
  prefill?: { 
    name?: string; 
    email?: string; 
    contact?: string 
  };
  notes?: Record<string, string>;
  theme?: { 
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  };
  config?: {
    display?: {
      blocks?: {
        banks?: {
          name: string;
          instruments: Array<{
            method: string;
          }>;
        };
        other?: {
          name: string;
          instruments: Array<{
            method: string;
          }>;
        };
      };
      hide?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  method?: {
    netbanking?: boolean;
    card?: boolean;
    upi?: boolean;
    wallet?: boolean;
    emi?: boolean;
    paylater?: boolean;
  };
  customer_id?: string;
  timeout?: number;
  remember_customer?: boolean;
  readonly?: {
    contact?: boolean;
    email?: boolean;
    name?: boolean;
  };
  hidden?: {
    contact?: boolean;
    email?: boolean;
  };
  send_sms_hash?: boolean;
  allow_rotation?: boolean;
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}