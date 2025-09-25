"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import HeartLoader from "@/components/ui/HeartLoader";
import { useAddToCart } from "@/hooks/useApi";
import { toast } from "sonner";

interface CheckoutButtonProps {
  amount: number; // INR major units (e.g., 499.00) – will convert to paise
  label?: string;
  className?: string;
  // New props for proper checkout flow
  productId?: string;
  variantId?: string;
  quantity?: number;
}

export function CheckoutButton({ 
  amount, 
  label = "Buy Now", 
  className = "",
  productId,
  variantId,
  quantity = 1
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const addToCartMutation = useAddToCart();

  const handleBuyNow = useCallback(async () => {
    setLoading(true);
    try {
      // If productId is provided, use proper checkout flow
      if (productId) {
        // Add to cart first
        await addToCartMutation.mutateAsync({
          productId,
          variantId,
          quantity
        });
        
        // Navigate to checkout page with buy-now indicator
        router.push('/checkout?buyNow=true');
      } else {
        // Fallback to direct payment for demo/quick buy scenarios
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
      }
    } catch (error) {
      console.error('Buy Now error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to proceed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [amount, productId, variantId, quantity, addToCartMutation, router]);



  return (
    <Button
      onClick={handleBuyNow}
      disabled={loading}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <HeartLoader size="sm" className="mr-2" />
          {productId ? 'Adding to cart...' : 'Initiating payment...'}
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
