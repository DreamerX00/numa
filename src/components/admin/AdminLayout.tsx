"use client";

import { useAuth } from '@/lib/auth/client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

async function checkAdminAccess() {
  const response = await fetch('/api/admin/dashboard');
  if (!response.ok) {
    throw new Error('Not authorized');
  }
  return response.json();
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const { data: adminData, isLoading: adminLoading, error } = useQuery({
    queryKey: ['admin', 'access'],
    queryFn: checkAdminAccess,
    enabled: !!user && !loading,
    retry: false
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || adminLoading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Verifying Access...</h3>
            <p className="text-muted-foreground text-center">
              Checking admin permissions
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error || !adminData) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to access the admin panel.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Homepage
            </button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.displayName || user?.email}
              </span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  {(user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            <NavLink href="/admin" label="Dashboard" />
            <NavLink href="/admin/products" label="Products" />
            <NavLink href="/admin/orders" label="Orders" />
            <NavLink href="/admin/users" label="Users" />
            <NavLink href="/admin/carousel" label="Carousel" />
            <NavLink href="/admin/support" label="Support" />
            <NavLink href="/admin/analytics" label="Analytics" />
            <NavLink href="/admin/settings" label="Settings" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
}

function NavLink({ href, label }: NavLinkProps) {
  const router = useRouter();
  const isActive = typeof window !== 'undefined' && window.location.pathname === href;

  return (
    <button
      onClick={() => router.push(href)}
      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}