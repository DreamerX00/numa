"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import type { RazorpayOptions } from "@/lib/types/razorpay";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src: string) {
  return new Promise<boolean>((resolve) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(false);
      return;
    }
    
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CheckoutButtonProps {
  amount: number; // INR major units (e.g., 499.00) – will convert to paise
  label?: string;
  className?: string;
}

export function CheckoutButton({ amount, label = "Live Checkout Demo", className = "" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadScript(RAZORPAY_SCRIPT).then((ok) => {
      if (mounted.current && ok) setReady(true);
    });
    return () => {
      mounted.current = false;
    };
  }, []);

  const createOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/quick-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount, // Send amount in INR
          currency: "INR",
          receipt: `demo_${Date.now()}`
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || "Failed to create order");
      }
      
      return await res.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [amount]);

  const openCheckout = useCallback(async () => {
    if (!window.Razorpay) return;
    const order = await createOrder();
    
    // Create descriptive text for the quick buy checkout
    const productDescription = `Quick Purchase | Amount: ₹${amount.toFixed(2)}`;
    
    const opts: RazorpayOptions = {
      key: order.key_id,
      amount: order.amount, // already in paise from backend
      currency: order.currency,
      name: "NUMA",
      description: productDescription,
      order_id: order.id,
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        // For now just log; future phase: optimistic UI, poll status
        console.log("Payment success", response);
        // Show success message
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      notes: {
        type: 'quick_buy',
        amount: `₹${amount.toFixed(2)}`,
        currency: order.currency,
        source: 'product_page'
      },
      theme: { 
        color: "#E7654D",
        backdrop_color: "#000000"
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled by user');
        },
        escape: true,
        backdropclose: false
      },
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Pay using Bank Account',
              instruments: [
                {
                  method: 'netbanking'
                },
                {
                  method: 'upi'
                }
              ]
            },
            other: {
              name: 'Other Payment Modes', 
              instruments: [
                {
                  method: 'card'
                },
                {
                  method: 'wallet'
                }
              ]
            }
          },
          hide: [
            // Don't hide any payment methods
          ],
          preferences: {
            show_default_blocks: true
          }
        }
      },
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: true,
        paylater: true
      }
    };
    const rz = new window.Razorpay!(opts);
    rz.open();
  }, [createOrder, amount]);

  return (
    <Button
      onClick={openCheckout}
      disabled={!ready || loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating order...
        </>
      ) : !ready ? (
        "Loading SDK..."
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

export default CheckoutButton;
