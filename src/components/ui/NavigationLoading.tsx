'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeartLoader from './HeartLoader';
import { cn } from '@/lib/utils';

interface NavigationLoadingProps {
  /**
   * Loading message to display
   */
  message?: string;
  
  /**
   * Size of the loading indicator
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Color theme for the loader
   */
  color?: 'primary' | 'secondary' | 'accent';
  
  /**
   * Whether to show as full page overlay
   */
  fullPage?: boolean;
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Whether to show immediately or with delay
   */
  immediate?: boolean;
  
  /**
   * Duration to show loading (0 = until navigation completes)
   */
  duration?: number;
}

/**
 * Navigation loading component that shows during route transitions
 * Provides visual feedback during navigation as per UX best practices
 */
export const NavigationLoading: React.FC<NavigationLoadingProps> = ({
  message = 'Loading page...',
  size = 'lg',
  color = 'primary',
  fullPage = true,
  className,
  immediate = false,
  duration = 0,
}) => {
  const [show, setShow] = useState(immediate);

  useEffect(() => {
    if (!immediate) {
      // Small delay to prevent flash for quick navigations
      const timer = setTimeout(() => setShow(true), 200);
      return () => clearTimeout(timer);
    }
  }, [immediate]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!show) return null;

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <HeartLoader size={size} color={color} />
      {message && (
        <p className="text-lg text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        'flex items-center justify-center',
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center justify-center p-8',
      className
    )}>
      {content}
    </div>
  );
};

/**
 * Hook to manage navigation loading states
 */
export const useNavigationLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigateWithLoading = (href: string, options?: {
    message?: string;
    delay?: number;
  }) => {
    setIsLoading(true);
    
    // Small delay to ensure loading state is visible
    setTimeout(() => {
      router.push(href);
      // Navigation loading will be hidden by the new page
      setTimeout(() => setIsLoading(false), 500);
    }, options?.delay || 100);
  };

  return {
    isLoading,
    navigateWithLoading,
    setIsLoading,
  };
};

/**
 * Loading component specifically for search results
 */
export const SearchLoading: React.FC<{ message?: string }> = ({
  message = 'Searching...'
}) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <HeartLoader size="md" color="primary" />
    <p className="text-muted-foreground animate-pulse">{message}</p>
  </div>
);

/**
 * Loading component specifically for data tables/lists
 */
export const TableLoading: React.FC<{ 
  rows?: number; 
  columns?: number;
  message?: string;
}> = ({
  rows = 5,
  columns = 4,
  message = 'Loading data...'
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-center py-4">
      <HeartLoader size="sm" color="primary" />
      <span className="ml-2 text-sm text-muted-foreground">{message}</span>
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Loading component for forms
 */
export const FormLoading: React.FC<{ message?: string }> = ({
  message = 'Processing...'
}) => (
  <div className="flex items-center justify-center py-8 space-x-3">
    <HeartLoader size="sm" color="primary" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

/**
 * Loading component for cards/products
 */
export const CardLoading: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="border rounded-lg p-4 space-y-4 animate-pulse">
        <div className="h-48 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-6 bg-muted rounded w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export default NavigationLoading;