"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, RefreshCw, Home, CreditCard } from "lucide-react";

function PaymentPendingPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

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
            <Clock className="h-16 w-16 mx-auto text-blue-500" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight">Payment Pending</h1>
            <p className="text-muted-foreground mt-2">
              Your payment is being processed. This may take a few minutes.
            </p>
          </div>
        </div>

        {(orderId || paymentId) && (
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-medium text-sm text-center text-muted-foreground">
                Transaction Details
              </h3>
              {orderId && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">{orderId}</span>
                </div>
              )}
              {paymentId && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Status: <span className="font-medium text-blue-600">Processing</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />
              <div className="text-left">
                <h3 className="font-medium text-sm text-blue-900">
                  What happens next?
                </h3>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• We&apos;re verifying your payment with the bank</li>
                  <li>• You&apos;ll receive an SMS/email confirmation shortly</li>
                  <li>• If payment fails, amount will be refunded in 5-7 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            asChild 
            variant="outline" 
            className="flex-1"
          >
            <Link href="/track-order" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Track Payment
            </Link>
          </Button>
          <Button 
            asChild 
            variant="default" 
            className="flex-1"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            Need help? Contact our support team at{" "}
            <Link 
              href="/contact" 
              className="text-primary hover:underline"
            >
              support@numa.com
            </Link>
          </p>
        </div>
      </motion.div>
    </Container>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <Container className="py-12 md:py-16">
        <div className="max-w-md mx-auto text-center">
          <Clock className="h-16 w-16 mx-auto text-blue-500 animate-pulse" />
          <h1 className="text-2xl font-serif tracking-tight mt-4">Loading...</h1>
        </div>
      </Container>
    }>
      <PaymentPendingPageContent />
    </Suspense>
  );
}