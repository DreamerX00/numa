'use client';

import { useEffect } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useLoading } from '@/components/providers/LoadingProvider';

interface UseQueryLoadingOptions {
  /**
   * Whether to show global loading for queries
   */
  showForQueries?: boolean;
  
  /**
   * Whether to show global loading for mutations
   */
  showForMutations?: boolean;
  
  /**
   * Custom loading message for queries
   */
  queryMessage?: string;
  
  /**
   * Custom loading message for mutations
   */
  mutationMessage?: string;
  
  /**
   * Minimum loading time to prevent flash
   */
  minLoadingTime?: number;
  
  /**
   * Query keys to exclude from global loading
   */
  excludeQueries?: string[];
  
  /**
   * Mutation keys to exclude from global loading
   */
  excludeMutations?: string[];
}

/**
 * Automatically manages global loading state for React Query operations
 * Based on UX research: users need feedback for any operation > 1 second
 */
export const useQueryLoading = (options: UseQueryLoadingOptions = {}) => {
  const {
    showForQueries = true,
    showForMutations = true,
    queryMessage = 'Loading data...',
    mutationMessage = 'Processing...',
    minLoadingTime = 500,
  } = options;

  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { showLoading, hideLoading, isLoading } = useLoading();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let startTime: number | undefined;

    const shouldShowLoading = (showForQueries && isFetching > 0) || 
                              (showForMutations && isMutating > 0);

    if (shouldShowLoading && !isLoading) {
      startTime = Date.now();
      const message = isMutating > 0 ? mutationMessage : queryMessage;
      
      // Small delay to prevent flash for very quick operations
      timeoutId = setTimeout(() => {
        showLoading(message);
      }, 100);
    } else if (!shouldShowLoading && isLoading) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Ensure minimum loading time
      const elapsedTime = startTime ? Date.now() - startTime : 0;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        hideLoading();
      }, remainingTime);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    isFetching, 
    isMutating, 
    isLoading, 
    showLoading, 
    hideLoading, 
    showForQueries, 
    showForMutations,
    queryMessage,
    mutationMessage,
    minLoadingTime
  ]);

  return {
    isFetching,
    isMutating,
    isLoading: isLoading || isFetching > 0 || isMutating > 0,
  };
};

/**
 * Hook specifically for data fetching scenarios
 */
export const useDataQueryLoading = () => {
  return useQueryLoading({
    showForQueries: true,
    showForMutations: false,
    queryMessage: 'Loading data...',
    minLoadingTime: 300,
  });
};

/**
 * Hook specifically for form mutation scenarios
 */
export const useFormMutationLoading = () => {
  return useQueryLoading({
    showForQueries: false,
    showForMutations: true,
    mutationMessage: 'Saving changes...',
    minLoadingTime: 800,
  });
};

/**
 * Hook for cart operations
 */
export const useCartQueryLoading = () => {
  return useQueryLoading({
    showForQueries: true,
    showForMutations: true,
    queryMessage: 'Loading cart...',
    mutationMessage: 'Updating cart...',
    minLoadingTime: 400,
  });
};

/**
 * Hook for search operations
 */
export const useSearchQueryLoading = () => {
  return useQueryLoading({
    showForQueries: true,
    showForMutations: false,
    queryMessage: 'Searching...',
    minLoadingTime: 250,
  });
};