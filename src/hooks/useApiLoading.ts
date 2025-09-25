'use client';

import { useCallback } from 'react';
import { useLoading } from '@/components/providers/LoadingProvider';

interface UseApiLoadingOptions {
  showGlobalLoading?: boolean;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  minLoadingTime?: number; // Minimum loading time in ms for better UX
}

interface WithLoadingOptions extends UseApiLoadingOptions {
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}

export const useApiLoading = (options: UseApiLoadingOptions = {}) => {
  const { showLoading, hideLoading } = useLoading();
  const {
    showGlobalLoading = true,
    loadingMessage = 'Loading...',
    minLoadingTime = 500, // Minimum 500ms to prevent flash
  } = options;

  const withLoading = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      callOptions: WithLoadingOptions | string = {}
    ): Promise<T> => {
      // Support both old string format and new options format
      const options = typeof callOptions === 'string' 
        ? { loadingMessage: callOptions } 
        : callOptions;

      const {
        showGlobalLoading: showGlobal = showGlobalLoading,
        loadingMessage: message = loadingMessage,
        onSuccess,
        onError,
        minLoadingTime: minTime = minLoadingTime,
      } = options;

      const startTime = Date.now();

      try {
        if (showGlobal) {
          showLoading(message);
        }

        const result = await apiCall();
        
        // Ensure minimum loading time for better UX (prevents loading flash)
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minTime) {
          await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        // Ensure minimum loading time even for errors
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minTime) {
          await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
        }

        if (onError) {
          onError(error);
        }
        throw error;
      } finally {
        if (showGlobal) {
          hideLoading();
        }
      }
    },
    [showLoading, hideLoading, showGlobalLoading, loadingMessage, minLoadingTime]
  );

  return {
    withLoading,
    showLoading,
    hideLoading,
  };
};

// Hook for component-level loading states (not global)
export const useComponentLoading = () => {
  const { withLoading } = useApiLoading({ showGlobalLoading: false });
  return { withLoading };
};

// Hook for form submissions with loading states
export const useFormLoading = () => {
  return useApiLoading({
    showGlobalLoading: true,
    loadingMessage: 'Processing...',
    minLoadingTime: 800, // Slightly longer for form submissions
  });
};

// Hook for data fetching with loading states  
export const useDataLoading = () => {
  return useApiLoading({
    showGlobalLoading: true,
    loadingMessage: 'Loading data...',
    minLoadingTime: 300, // Shorter for data fetching
  });
};

// Hook for navigation with loading states
export const useNavigationLoading = () => {
  return useApiLoading({
    showGlobalLoading: true,
    loadingMessage: 'Navigating...',
    minLoadingTime: 200, // Quick for navigation
  });
};