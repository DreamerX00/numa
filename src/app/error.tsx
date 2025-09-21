"use client";

import { useEffect } from "react";
import ErrorPage from "@/components/ui/ErrorPage";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Route error:", error);
  }, [error]);

  // Determine status code from error
  const getStatusCode = (error: Error): number => {
    // Check if error has a status property
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    
    // Check error message for common patterns
    const message = error.message.toLowerCase();
    if (message.includes('unauthorized') || message.includes('401')) return 401;
    if (message.includes('forbidden') || message.includes('403')) return 403;
    if (message.includes('not found') || message.includes('404')) return 404;
    if (message.includes('timeout') || message.includes('408')) return 408;
    if (message.includes('bad gateway') || message.includes('502')) return 502;
    if (message.includes('service unavailable') || message.includes('503')) return 503;
    if (message.includes('gateway timeout') || message.includes('504')) return 504;
    
    // Default to 500 for unknown errors
    return 500;
  };

  const statusCode = getStatusCode(error);

  return (
    <ErrorPage
      statusCode={statusCode}
      title={statusCode === 500 ? "Something Went Wrong" : undefined}
      message={statusCode === 500 ? "Don't worry, we're working on fixing this issue." : undefined}
      showRetry={true}
      showGoBack={true}
      showGoHome={true}
      onRetry={reset}
    />
  );
}