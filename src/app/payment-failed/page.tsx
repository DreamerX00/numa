"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ShoppingCart, Home, RefreshCw } from "lucide-react";

function PaymentFailedPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "verification_failed":
        return "Payment verification failed. If money was deducted, it will be refunded within 5-7 business days.";
      case "order_creation_failed":
        return "Unable to create order. Please try again.";
      case "payment_cancelled":
        return "Payment was cancelled. You can try again when ready.";
      default:
        return "Payment could not be processed. Please try again or contact support.";
    }
  };

  return (
    <Container className="py-12 md:py-16">
      <motion.div 
        className="max-w-md mx-auto text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight">Payment Failed</h1>
            <p className="text-muted-foreground mt-2">
              {getErrorMessage(error)}
            </p>
          </div>
        </div>

        <Card className="border-red-100">
          <CardContent className="p-6 space-y-2">
            <h2 className="font-medium text-sm tracking-tight text-red-700">What happened?</h2>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>• Payment processing was interrupted</p>
              <p>• Network connectivity issues</p>
              <p>• Insufficient balance or card issues</p>
              <p>• Payment gateway error</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/cart">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/collections">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-2">
          <p>If the issue persists, please contact our support team:</p>
          <div className="bg-muted p-2 rounded text-xs">
            <p><strong>Email:</strong> support@numa.com</p>
            <p><strong>Phone:</strong> +91 12345 67890</p>
          </div>
          <p className="text-xs text-green-600 mt-2">
            💡 <strong>Tip:</strong> Check your internet connection and card details before retrying.
          </p>
        </div>
      </motion.div>
    </Container>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    }>
      <PaymentFailedPageContent />
    </Suspense>
  );
}