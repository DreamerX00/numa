'use client';

import React, { forwardRef, ReactNode } from 'react';
import HeartLoader from './HeartLoader';
import { cn } from '@/lib/utils';

interface LoadingWrapperProps {
  /**
  export const withLoadingWrapper = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  loadingOptions?: Partial<LoadingWrapperProps>
) => {
  const WrappedComponent = forwardRef<unknown, P & { isLoading?: boolean }>((props, ref) => {
    const { isLoading = false, ...componentProps } = props;
    
    return (
      <LoadingWrapper isLoading={isLoading} {...loadingOptions}>
        <Component {...(componentProps as P)} ref={ref} />
      </LoadingWrapper>
    );
  });

  WrappedComponent.displayName = `withLoadingWrapper(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};show loading state
   */
  isLoading: boolean;
  
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
   * Whether to show as overlay (absolute positioned)
   */
  overlay?: boolean;
  
  /**
   * Whether to blur the background content when loading
   */
  blur?: boolean;
  
  /**
   * Minimum height when loading (prevents layout shift)
   */
  minHeight?: string | number;
  
  /**
   * Custom loading component
   */
  customLoader?: ReactNode;
  
  /**
   * Children to render when not loading
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Loading state type for different UX patterns
   */
  variant?: 'default' | 'skeleton' | 'spinner' | 'pulse';
  

  
  /**
   * Fallback content to show while loading
   */
  fallback?: ReactNode;
}

/**
 * Comprehensive loading wrapper component that follows UX best practices
 * - Prevents layout shift
 * - Provides visual feedback for operations > 1 second
 * - Multiple variants for different use cases
 * - Consistent loading experience across app
 */
export const LoadingWrapper = forwardRef<HTMLDivElement, LoadingWrapperProps>(({
  isLoading,
  message = 'Loading...',
  size = 'md',
  color = 'primary',
  overlay = false,
  blur = false,
  minHeight,
  customLoader,
  children,
  className,
  variant = 'default',
  fallback,
  ...props
}, ref) => {
  const renderLoader = () => {
    if (customLoader) {
      return customLoader;
    }

    switch (variant) {
      case 'skeleton':
        return <SkeletonLoader />;
      case 'spinner':
        return <SpinnerLoader size={size} color={color} />;
      case 'pulse':
        return <PulseLoader />;
      default:
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <HeartLoader size={size} color={color} />
            {message && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {message}
              </p>
            )}
          </div>
        );
    }
  };

  const loadingContent = (
    <div
      className={cn(
        'flex items-center justify-center',
        overlay && 'absolute inset-0 z-10',
        blur && 'backdrop-blur-sm',
        overlay && 'bg-background/80',
        className
      )}
      style={{ minHeight }}
    >
      {fallback || renderLoader()}
    </div>
  );

  if (overlay) {
    return (
      <div ref={ref} className="relative" {...props}>
        {children}
        {isLoading && loadingContent}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {isLoading ? loadingContent : children}
    </div>
  );
});

LoadingWrapper.displayName = 'LoadingWrapper';

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="space-y-3 w-full">
    <div className="h-4 bg-muted rounded animate-pulse" />
    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
  </div>
);

// Spinner loader component
const SpinnerLoader = ({ size, color }: { size: string; color: string }) => (
  <div
    className={cn(
      'animate-spin rounded-full border-2 border-muted border-t-current',
      size === 'sm' && 'h-4 w-4',
      size === 'md' && 'h-6 w-6',
      size === 'lg' && 'h-8 w-8',
      color === 'primary' && 'text-primary',
      color === 'secondary' && 'text-secondary',
      color === 'accent' && 'text-accent',
    )}
  />
);

// Pulse loader component
const PulseLoader = () => (
  <div className="flex space-x-2">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="w-2 h-2 bg-primary rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// Higher-order component for easy loading state management
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingOptions?: Partial<LoadingWrapperProps>
) => {
  const WrappedComponent = forwardRef<unknown, P & { isLoading?: boolean }>((props, ref) => {
    const { isLoading = false, ...componentProps } = props;
    
    return (
      <LoadingWrapper isLoading={isLoading} {...loadingOptions}>
        <Component {...(componentProps as P)} ref={ref} />
      </LoadingWrapper>
    );
  });

  WrappedComponent.displayName = `withLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default LoadingWrapper;