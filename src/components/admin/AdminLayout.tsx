"use client";

import { useAuth } from "@/lib/auth/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Loader2, Shield } from "lucide-react";
import HeartLoader from "@/components/ui/HeartLoader";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

async function checkAdminAccess() {
  const response = await fetch("/api/admin/dashboard");
  if (!response.ok) {
    throw new Error("Not authorized");
  }
  return response.json();
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    data: _adminData,
    isLoading: adminLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "access"],
    queryFn: checkAdminAccess,
    enabled: !!user && !loading,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount
  });

  // Check if user has admin role
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[AdminLayout] Auth check:", {
        user: user?.email,
        role: user?.role,
        isActive: user?.isActive,
        loading,
        isAdmin,
        hasUser: !!user,
        hasCheckedAuth,
        timestamp: new Date().toISOString(),
      });
    }

    // Only perform auth check once loading is complete
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);

      if (!user) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[AdminLayout] ❌ No user detected, redirecting to login",
            {
              loading,
              user,
              timestamp: new Date().toISOString(),
            }
          );
        }
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[AdminLayout] ❌ User is not admin, redirecting to home",
            {
              role: user.role,
              isAdmin,
              timestamp: new Date().toISOString(),
            }
          );
        }
        router.push("/");
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log("[AdminLayout] ✅ User is admin, access granted");
        }
      }
    } else if (!loading && hasCheckedAuth) {
      // If user changes after initial check, update accordingly
      if (!user) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[AdminLayout] ❌ User lost after initial check, redirecting"
          );
        }
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        if (process.env.NODE_ENV === "development") {
          console.error("[AdminLayout] ❌ User role changed, no longer admin");
        }
        router.push("/");
      }
    } else if (!loading && process.env.NODE_ENV === "development") {
      console.log("[AdminLayout] ⏳ Already checked auth, skipping redirect");
    } else if (process.env.NODE_ENV === "development") {
      console.log("[AdminLayout] ⏳ Still loading...");
    }
  }, [user, loading, isAdmin, hasCheckedAuth, router]);

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

  // Show error only if the API check failed (not if user doesn't have role)
  if (error) {
    console.error("[AdminLayout] API Error:", error);
  }

  // If user loaded but is not admin, the useEffect will redirect
  // Show loading state while redirect is happening
  if (!user || !isAdmin) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Redirecting...</h3>
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
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.displayName || user?.email}
              </span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  {(user?.displayName || user?.email || "A")
                    .charAt(0)
                    .toUpperCase()}
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
      <main className="p-6">{children}</main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
}

function NavLink({ href, label }: NavLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isActive =
    typeof window !== "undefined" && window.location.pathname === href;

  const handleClick = async () => {
    if (isActive || isNavigating) return;

    setIsNavigating(true);
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsNavigating(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isNavigating}
      className={cn(
        "py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        isNavigating && "opacity-50 cursor-not-allowed"
      )}
    >
      {isNavigating && <HeartLoader size="sm" />}
      {label}
    </button>
  );
}
