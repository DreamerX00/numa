"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  amount: number; // INR major units (e.g., 499.00) – will convert to paise
  label?: string;
  className?: string;
}

export function CheckoutButton({ amount, label = "Live Checkout Demo", className = "" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const initiatePayment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/phonepe/quick-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: amount * 100, // Convert to paise
          mobileNumber: "9999999999" // Default for quick buy
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('PhonePe payment initiation failed:', errorData);
        throw new Error(errorData.error || "Failed to initiate payment");
      }
      
      const data = await res.json();
      
      if (data.success && data.redirectUrl) {
        // Redirect to PhonePe payment page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL received from PhonePe");
      }
    } catch (error) {
      console.error('PhonePe payment initiation error:', error);
      alert(`Payment initiation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [amount]);



  return (
    <Button
      onClick={initiatePayment}
      disabled={loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initiating payment...
        </>
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
