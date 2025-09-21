"use client";

import { useEffect } from "react";
import ErrorPage from "@/components/ui/ErrorPage";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    // Log admin error to monitoring service
    console.error("Admin error:", error);
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
    
    // Default to 500 for unknown errors
    return 500;
  };

  const statusCode = getStatusCode(error);

  // Custom messages for admin errors
  const getAdminErrorMessage = (statusCode: number): string => {
    switch (statusCode) {
      case 401:
        return "Please sign in with an admin account to access this area.";
      case 403:
        return "You don't have sufficient permissions to access this admin feature.";
      case 404:
        return "The admin resource you're looking for doesn't exist.";
      default:
        return "An error occurred in the admin panel. Please try again or contact support.";
    }
  };

  return (
    <ErrorPage
      statusCode={statusCode}
      title={statusCode === 401 ? "Admin Access Required" : statusCode === 403 ? "Access Denied" : undefined}
      message={getAdminErrorMessage(statusCode)}
      showRetry={statusCode !== 401 && statusCode !== 403}
      showGoBack={true}
      showGoHome={true}
      onRetry={reset}
    />
  );
}