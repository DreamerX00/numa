"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/client";
import { useHybridCartStore } from "@/lib/store/hybridCart";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Loader2
} from "lucide-react";

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
    phone?: string;
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
    phone?: string;
    alternateEmail?: string;
    alternatePhone?: string;
  };
  email?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotalPrice, getTotalItems } = useHybridCartStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();

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

  const handleStepComplete = (stepData: CheckoutStepData) => {
    setCheckoutData(prev => ({ ...prev, ...stepData }));
    
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
            onComplete={handleStepComplete}
            onError={(error: string) => setErrors({ auth: error })}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 2:
        return (
          <AddressStep
            onComplete={handleStepComplete}
            onError={(error: string) => setErrors({ address: error })}
          />
        );
      case 3:
        return (
          <PaymentStep
            checkoutData={checkoutData}
            cartItems={items}
            subtotal={subtotal}
            onComplete={() => {
              // Payment completion handled in PaymentStep
            }}
            onError={(error: string) => setErrors({ payment: error })}
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
            <h1 className="text-3xl font-serif tracking-tight">Checkout</h1>
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
              items={items}
              subtotal={subtotal}
              shipping={checkoutData.shipping}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}