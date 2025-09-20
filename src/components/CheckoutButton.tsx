"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

// Minimal type declarations (avoid installing @types for now)
interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(src: string) {
  return new Promise<boolean>((resolve) => {
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
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(amount * 100) }) // server expects amount in paise or will convert
      });
      if (!res.ok) throw new Error("Failed to create order");
      return await res.json();
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [amount]);

  const openCheckout = useCallback(async () => {
    if (!window.Razorpay) return;
    const order = await createOrder();
    const opts: RazorpayOptions = {
      key: order.key_id,
      amount: order.amount, // already in paise from backend
      currency: order.currency,
      name: "Numa Demo",
      description: "Razorpay Integration Test Payment",
      order_id: order.id,
      handler: (response) => {
        // For now just log; future phase: optimistic UI, poll status
        console.log("Payment success", response);
        // Optionally show a toast (not yet implemented)
      },
      theme: { color: "#E7654D" }
    };
    const rz = new window.Razorpay!(opts);
    rz.open();
  }, [createOrder]);

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
