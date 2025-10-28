"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Home } from "lucide-react";

function OrderSuccessPageContent() {
  const searchParams = useSearchParams();
  const { general } = useSettings();
  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const status = searchParams.get("status");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const getSuccessMessage = () => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          title: "Payment Completed!",
          description:
            "Your payment has been completed successfully and your order is confirmed.",
        };
      case "captured":
        return {
          title: "Payment Captured!",
          description:
            "Your payment has been captured and your order will be processed shortly.",
        };
      default:
        return {
          title: "Order Confirmed!",
          description:
            "Thank you for your purchase. Your order has been successfully placed.",
        };
    }
  };

  const successMessage = getSuccessMessage();

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
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight">
              {successMessage.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {successMessage.description}
            </p>
          </div>
        </div>

        {(paymentId || orderId) && (
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="font-medium text-sm tracking-tight">
                Transaction Details
              </h2>
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
              {status && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Status:{" "}
                    <span className="font-medium text-green-600 capitalize">
                      {status}
                    </span>
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center pt-2">
                You will receive an email confirmation shortly.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/collections">
              <Package className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Need help? Contact our support team at {general.supportEmail}</p>
        </div>
      </motion.div>
    </Container>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      }
    >
      <OrderSuccessPageContent />
    </Suspense>
  );
}
