"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import HeartLoader from "@/components/ui/HeartLoader";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Get all the query parameters from PhonePe redirect
    const orderId = searchParams.get('order_id') || searchParams.get('merchantTransactionId');
    const paymentId = searchParams.get('payment_id') || searchParams.get('transactionId');
    const paymentStatus = searchParams.get('status') || searchParams.get('code') || 'success';
    
    setStatus(paymentStatus.toLowerCase());
    
    // Construct the redirect URL with all relevant parameters
    const redirectParams = new URLSearchParams();
    
    if (orderId) redirectParams.set('order_id', orderId);
    if (paymentId) redirectParams.set('payment_id', paymentId);
    if (paymentStatus) redirectParams.set('status', paymentStatus);
    
    // Add any other parameters that might be useful
    searchParams.forEach((value, key) => {
      if (!redirectParams.has(key) && value) {
        redirectParams.set(key, value);
      }
    });

    // Determine redirect URL based on payment status
    let redirectUrl = '';
    
    switch (paymentStatus.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'captured':
        redirectUrl = `/order-success${redirectParams.toString() ? '?' + redirectParams.toString() : ''}`;
        break;
      
      case 'failed':
      case 'failure':
      case 'declined':
      case 'error':
        redirectParams.set('error', 'payment_failed');
        redirectUrl = `/payment-failed${redirectParams.toString() ? '?' + redirectParams.toString() : ''}`;
        break;
      
      case 'cancelled':
      case 'canceled':
      case 'cancelled_by_user':
        redirectParams.set('error', 'payment_cancelled');
        redirectUrl = `/payment-failed${redirectParams.toString() ? '?' + redirectParams.toString() : ''}`;
        break;
      
      case 'pending':
      case 'processing':
      case 'initiated':
        redirectUrl = `/payment-pending${redirectParams.toString() ? '?' + redirectParams.toString() : ''}`;
        break;
      
      default:
        // Unknown status, redirect to order success but preserve status
        redirectUrl = `/order-success${redirectParams.toString() ? '?' + redirectParams.toString() : ''}`;
    }
    
    // Small delay to show status before redirect
    setTimeout(() => {
      setRedirecting(true);
      setTimeout(() => {
        router.replace(redirectUrl);
      }, 500);
    }, 1500);
    
  }, [router, searchParams]);

  const getStatusIcon = () => {
    if (redirecting) return <HeartLoader size="md" className="mb-4" />;
    
    switch (status) {
      case 'success':
      case 'completed':
      case 'captured':
        return <CheckCircle className="h-8 w-8 text-green-500 mb-4" />;
      
      case 'failed':
      case 'failure':
      case 'declined':
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500 mb-4" />;
      
      case 'cancelled':
      case 'canceled':
      case 'cancelled_by_user':
        return <AlertCircle className="h-8 w-8 text-orange-500 mb-4" />;
      
      case 'pending':
      case 'processing':
      case 'initiated':
        return <Clock className="h-8 w-8 text-blue-500 mb-4" />;
      
      default:
        return <HeartLoader size="md" className="mb-4" />;
    }
  };

  const getStatusMessage = () => {
    if (redirecting) {
      return {
        title: "Redirecting...",
        description: "Please wait while we redirect you..."
      };
    }
    
    switch (status) {
      case 'success':
      case 'completed':
      case 'captured':
        return {
          title: "Payment Successful!",
          description: "Your payment has been processed successfully. Redirecting to order confirmation..."
        };
      
      case 'failed':
      case 'failure':
      case 'declined':
      case 'error':
        return {
          title: "Payment Failed",
          description: "Your payment could not be processed. Redirecting to retry payment..."
        };
      
      case 'cancelled':
      case 'canceled':
      case 'cancelled_by_user':
        return {
          title: "Payment Cancelled",
          description: "You have cancelled the payment. Redirecting to try again..."
        };
      
      case 'pending':
      case 'processing':
      case 'initiated':
        return {
          title: "Payment Pending",
          description: "Your payment is being processed. Redirecting to status page..."
        };
      
      default:
        return {
          title: "Processing Payment",
          description: "Please wait while we process your payment status..."
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <Container className="py-8">
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          {getStatusIcon()}
          <h2 className="text-lg font-semibold text-center mb-2">
            {statusMessage.title}
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {statusMessage.description}
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<HeartLoader />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}