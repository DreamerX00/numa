"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Home } from "lucide-react";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
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
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight">Order Confirmed!</h1>
            <p className="text-muted-foreground mt-2">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>
        </div>

        {paymentId && (
          <Card>
            <CardContent className="p-6 space-y-2">
              <h2 className="font-medium text-sm tracking-tight">Payment Details</h2>
              <p className="text-xs text-muted-foreground">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                You will receive an email confirmation shortly.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full bg-brand hover:bg-brand-dark">
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
          <p>Need help? Contact our support team at support@numa.com</p>
        </div>
      </motion.div>
    </Container>
  );
}