"use client";

import { useAuth } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading...</h3>
            <p className="text-muted-foreground text-center">
              Please wait while we verify your authentication status.
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-8 w-8 bg-destructive rounded-full flex items-center justify-center mb-4">
              <span className="text-destructive-foreground text-sm font-bold">!</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground text-center">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return <>{children}</>;
}