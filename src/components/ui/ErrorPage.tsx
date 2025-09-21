"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  statusCode: number;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
  onRetry?: () => void;
}

interface ErrorConfig {
  title: string;
  message: string;
  fallbackImage: string;
  color: string;
}

const ERROR_CONFIGS: Record<number, ErrorConfig> = {
  400: {
    title: "Bad Request",
    message: "The request could not be understood by the server.",
    fallbackImage: "/fallback/400.png",
    color: "text-orange-600"
  },
  401: {
    title: "Unauthorized",
    message: "You need to sign in to access this resource.",
    fallbackImage: "/fallback/401.png",
    color: "text-red-600"
  },
  403: {
    title: "Access Forbidden",
    message: "You don't have permission to access this resource.",
    fallbackImage: "/fallback/403.png",
    color: "text-red-600"
  },
  404: {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist or has been moved.",
    fallbackImage: "/fallback/400.png", // Using 400.png as fallback since 404.png doesn't exist
    color: "text-blue-600"
  },
  408: {
    title: "Request Timeout",
    message: "The request took too long to process. Please try again.",
    fallbackImage: "/fallback/408.png",
    color: "text-yellow-600"
  },
  500: {
    title: "Internal Server Error",
    message: "Something went wrong on our end. We're working to fix it.",
    fallbackImage: "/fallback/500.png",
    color: "text-red-600"
  },
  502: {
    title: "Bad Gateway",
    message: "We're experiencing connectivity issues. Please try again later.",
    fallbackImage: "/fallback/502.png",
    color: "text-purple-600"
  },
  503: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
    fallbackImage: "/fallback/503.png",
    color: "text-orange-600"
  },
  504: {
    title: "Gateway Timeout",
    message: "The server took too long to respond. Please try again.",
    fallbackImage: "/fallback/504.png",
    color: "text-gray-600"
  }
};

const DEFAULT_ERROR_CONFIG: ErrorConfig = {
  title: "Something Went Wrong",
  message: "An unexpected error occurred. Please try again later.",
  fallbackImage: "/fallback/500.png",
  color: "text-gray-600"
};

export default function ErrorPage({
  statusCode,
  title,
  message,
  showRetry = true,
  showGoBack = true,
  showGoHome = true,
  onRetry,
}: ErrorPageProps) {
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  const errorConfig = ERROR_CONFIGS[statusCode] || DEFAULT_ERROR_CONFIG;
  const displayTitle = title || errorConfig.title;
  const displayMessage = message || errorConfig.message;
  const fallbackImage = errorConfig.fallbackImage;
  const colorClass = errorConfig.color;

  // Auto-redirect countdown for certain errors
  useEffect(() => {
    if (statusCode === 503 || statusCode === 502) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [statusCode]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Container className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            {/* Error Image */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative w-48 h-48 mx-auto"
            >
              {!imageError ? (
                <Image
                  src={fallbackImage}
                  alt={`Error ${statusCode}`}
                  fill
                  className="object-contain rounded-lg"
                  onError={() => setImageError(true)}
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <AlertTriangle className={`w-24 h-24 ${colorClass}`} />
                </div>
              )}
            </motion.div>

            {/* Error Content */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className={`text-4xl font-bold ${colorClass} mb-2`}>
                  {statusCode}
                </h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  {displayTitle}
                </h2>
                <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
                  {displayMessage}
                </p>
              </motion.div>

              {/* Auto-refresh countdown */}
              {(statusCode === 503 || statusCode === 502) && countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <p className="text-blue-700 text-sm">
                    Auto-refreshing in {countdown} seconds...
                  </p>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
            >
              {showGoHome && (
                <Button asChild className="min-w-[140px]">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
              )}
              
              {showRetry && (
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  className="min-w-[140px] flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}

              {showGoBack && (
                <Button 
                  variant="ghost" 
                  onClick={handleGoBack}
                  className="min-w-[140px] flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              )}
            </motion.div>

            {/* Additional Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-gray-500 pt-4 border-t border-gray-100"
            >
              <p>
                If this problem persists, please{" "}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  contact our support team
                </Link>
                {" "}for assistance.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}