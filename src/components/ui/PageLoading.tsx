'use client';

import React from 'react';
import HeartLoader from './HeartLoader';

interface PageLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = "Loading...", 
  size = 'md',
  className = '' 
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <HeartLoader size={size} className="mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
};

export default PageLoading;