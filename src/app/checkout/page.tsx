"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/client";
import { useHybridCartStore } from "@/lib/store/hybridCart";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  ArrowLeft, 
  User,
  MapPin,
  CreditCard
} from "lucide-react";

export const dynamic = 'force-dynamic';

// Step Components
import { AuthStep } from "@/components/checkout/AuthStep";
import { AddressStep } from "@/components/checkout/AddressStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { OrderSummary } from "@/components/checkout/OrderSummary";

// Types
interface CheckoutData {
  user?: {
    email: string;
    displayName?: string;
  };
  address?: {
    id?: string;
    type: 'SHIPPING' | 'BILLING';
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    alternateEmail?: string;
    alternatePhone?: string;
  };
  shipping?: {
    method: string;
    cost: number;
    estimatedDays: string;
  };
}

const STEPS = [
  {
    id: 1,
    title: "Authentication",
    description: "Login or continue as guest",
    icon: User,
  },
  {
    id: 2,
    title: "Shipping Address",
    description: "Enter delivery details",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Payment",
    description: "Complete your order",
    icon: CreditCard,
  },
];

// Types
interface CheckoutStepData {
  address?: {
    id?: string;
    type: 'SHIPPING' | 'BILLING';
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    alternateEmail?: string;
    alternatePhone?: string;
  };
  email?: string;
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { items, getTotalPrice, getTotalItems, clearCart } = useHybridCartStore();
  
  // Check if this is a "Buy Now" flow
  const isBuyNow = searchParams.get('buyNow') === 'true';
  
  // Filter items for Buy Now mode (only show the most recently added item)
  const checkoutItems = useMemo(() => {
    return isBuyNow && items.length > 0 
      ? [items[items.length - 1]] // Get the last (most recently added) item
      : items;
  }, [isBuyNow, items]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingCalculation, setShippingCalculation] = useState<{
    cost: number;
    method: string;
    estimatedDays: string;
    qualifiesForFree: boolean;
    loading: boolean;
  }>({
    cost: 0,
    method: 'STANDARD',
    estimatedDays: '3-5',
    qualifiesForFree: false,
    loading: false,
  });

  // Calculate totals based on filtered items for Buy Now mode
  const totalItems = useMemo(() => {
    return isBuyNow 
      ? checkoutItems.reduce((total: number, item) => total + item.quantity, 0)
      : getTotalItems();
  }, [isBuyNow, checkoutItems, getTotalItems]);
  
  const subtotal = useMemo(() => {
    return isBuyNow
      ? checkoutItems.reduce((total: number, item) => total + (item.price * item.quantity), 0)
      : getTotalPrice();
  }, [isBuyNow, checkoutItems, getTotalPrice]);

  // Calculate shipping cost based on individual product shipping rates
  const calculateShipping = useCallback(() => {
    if (checkoutItems.length === 0) {
      setShippingCalculation({
        cost: 0,
        method: 'STANDARD',
        estimatedDays: '3-5',
        qualifiesForFree: false,
        loading: false,
      });
      return;
    }

    // Calculate total shipping cost from individual product shipping rates
    const totalShippingCost = checkoutItems.reduce((total: number, item) => {
      const shippingRate = item.product?.individualShippingRate || 0;
      return total + (shippingRate * item.quantity);
    }, 0);

    // Check if qualifies for free shipping (subtotal >= 500)
    const qualifiesForFree = subtotal >= 500;
    const finalShippingCost = qualifiesForFree ? 0 : totalShippingCost;

    setShippingCalculation({
      cost: finalShippingCost,
      method: 'STANDARD',
      estimatedDays: '3-5',
      qualifiesForFree,
      loading: false,
    });
  }, [checkoutItems, subtotal]);

  // Calculate shipping when cart items change
  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

  // Redirect if cart is empty
  useEffect(() => {
    if (totalItems === 0) {
      router.push('/cart');
    }
  }, [totalItems, router]);

  // Skip auth step if user is already logged in
  useEffect(() => {
    if (user && currentStep === 1) {
      setCurrentStep(2);
      setCheckoutData(prev => ({
        ...prev,
        user: {
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Customer'
        }
      }));
    }
  }, [user, currentStep]);

  const handlePaymentComplete = (orderId: string) => {
    // Clear cart items for guest users (logged-in users' carts are cleared server-side)
    if (!user) {
      // Clear the hybrid cart store
      clearCart();
      
      // Also clear localStorage for guest users
      try {
        localStorage.removeItem('numa-cart');
      } catch (error) {
        console.error('Failed to clear localStorage cart:', error);
      }
    }
    
    // Redirect to order success page
    router.push(`/order-success?order_id=${orderId}&payment_id=success`);
  };

  const handlePaymentError = (error: string) => {
    // Redirect to payment failed page
    router.push(`/payment-failed?error=${encodeURIComponent(error)}`);
  };

  // Recalculate shipping when address step is completed
  const handleStepComplete = (stepData: CheckoutStepData) => {
    setCheckoutData(prev => ({ ...prev, ...stepData }));
    
    // If address was just updated, recalculate shipping
    if (stepData.address) {
      calculateShipping();
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      // Don't go back to auth step if user is logged in
      const targetStep = user && currentStep === 2 ? 1 : currentStep - 1;
      setCurrentStep(targetStep);
    } else {
      router.push('/cart');
    }
  };

  const getProgressPercentage = () => {
    const effectiveStep = user ? Math.max(currentStep - 1, 1) : currentStep;
    const totalEffectiveSteps = user ? STEPS.length - 1 : STEPS.length;
    return (effectiveStep / totalEffectiveSteps) * 100;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AuthStep
            onNext={() => setCurrentStep(2)}
            onSkip={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <AddressStep
            onComplete={(data) => handleStepComplete({ address: data.address })}
            onError={(error: string) => setErrors({ address: error })}
          />
        );
      case 3:
        return (
          <PaymentStep
            checkoutData={checkoutData}
            cartItems={items}
            subtotal={subtotal}
            shippingCost={shippingCalculation.cost}
            shippingMethod={shippingCalculation.method}
            onComplete={handlePaymentComplete}
            onError={handlePaymentError}
            loading={loading}
            setLoading={setLoading}
          />
        );
      default:
        return null;
    }
  };

  if (totalItems === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <Container className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleStepBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif tracking-tight">Checkout</h1>
              {isBuyNow && (
                <Badge variant="secondary" className="text-xs">
                  Buy Now
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your order
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isSkipped = user && step.id === 1; // Skip auth step if logged in
              
              if (isSkipped) return null;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : isActive 
                        ? 'border-primary text-primary' 
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && !isSkipped && (
                    <div className="hidden sm:block w-12 h-px bg-muted-foreground/30 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6">
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderCurrentStep()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary 
              items={checkoutItems}
              subtotal={subtotal}
              shipping={{
                method: shippingCalculation.method,
                cost: shippingCalculation.cost,
                estimatedDays: shippingCalculation.estimatedDays,
              }}
              loading={shippingCalculation.loading}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <Container>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-pulse">Loading checkout...</div>
          </div>
        </div>
      </Container>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}