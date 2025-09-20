"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface ApiError {
  status?: number;
  message?: string;
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors except 408 (timeout)
              const apiError = error as ApiError;
              const status = apiError?.status;
              if (status && status >= 400 && status < 500 && status !== 408) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry mutations on 4xx errors
              const apiError = error as ApiError;
              const status = apiError?.status;
              if (status && status >= 400 && status < 500) {
                return false;
              }
              // Retry up to 2 times for server errors
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}