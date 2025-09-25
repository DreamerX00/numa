'use client';

import { useEffect, useState, useRef } from 'react';
import { useApiLoading } from './useApiLoading';

interface UseAutoLoadingOptions {
  /**
   * Minimum time in ms to show loading state
   * Prevents loading flash for very quick operations
   */
  minLoadingTime?: number;
  
  /**
   * Loading message to display
   */
  message?: string;
  
  /**
   * Whether to show global loading overlay
   */
  showGlobalLoading?: boolean;
  
  /**
   * Whether to automatically detect async operations
   */
  autoDetect?: boolean;
  
  /**
   * Delay before showing loading state (prevents flash)
   */
  delay?: number;
}

/**
 * Automatically detects and manages loading states for components
 * Based on UX research: loading indicators should appear for any operation > 1 second
 */
export const useAutoLoading = (options: UseAutoLoadingOptions = {}) => {
  const {
    minLoadingTime = 500,
    message = 'Loading...',
    showGlobalLoading = true,
    delay = 200,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(message);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { showLoading, hideLoading } = useApiLoading({ showGlobalLoading: false });

  const startLoading = (customMessage?: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    startTimeRef.current = Date.now();
    const msg = customMessage || message;
    setLoadingMessage(msg);

    // Delay showing loading to prevent flash for quick operations
    timeoutRef.current = setTimeout(() => {
      setIsLoading(true);
      if (showGlobalLoading) {
        showLoading(msg);
      }
    }, delay);
  };

  const stopLoading = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Ensure minimum loading time for better UX
    if (startTimeRef.current) {
      const elapsedTime = Date.now() - startTimeRef.current;
      if (elapsedTime < minLoadingTime && isLoading) {
        await new Promise(resolve => 
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }
    }

    setIsLoading(false);
    if (showGlobalLoading) {
      hideLoading();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (showGlobalLoading && isLoading) {
        hideLoading();
      }
    };
  }, [isLoading, showGlobalLoading, hideLoading]);

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
  };
};

/**
 * Hook for managing loading states in data fetching scenarios
 */
export const useDataFetchLoading = () => {
  return useAutoLoading({
    message: 'Loading data...',
    minLoadingTime: 300,
    delay: 100,
  });
};

/**
 * Hook for managing loading states in form submission scenarios
 */
export const useFormSubmissionLoading = () => {
  return useAutoLoading({
    message: 'Processing...',
    minLoadingTime: 800,
    delay: 0, // Show immediately for form submissions
  });
};

/**
 * Hook for managing loading states in navigation scenarios
 */
export const useNavigationStateLoading = () => {
  return useAutoLoading({
    message: 'Loading page...',
    minLoadingTime: 200,
    delay: 300,
  });
};

/**
 * Hook for managing loading states in image/media loading scenarios
 */
export const useMediaLoading = () => {
  return useAutoLoading({
    message: 'Loading media...',
    minLoadingTime: 400,
    delay: 150,
    showGlobalLoading: false, // Usually component-level for media
  });
};

/**
 * Hook for managing loading states in search scenarios
 */
export const useSearchLoading = () => {
  return useAutoLoading({
    message: 'Searching...',
    minLoadingTime: 250,
    delay: 300, // Longer delay for search to allow for debouncing
  });
};