"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Edit,
  Ban,
  Shield,
  User,
  Users,
  Crown,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export const dynamic = "force-dynamic";

// Types
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
    phone?: string;
  };
  _count?: {
    orders: number;
    reviews: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    newUsersThisMonth: number;
  };
}

// API functions
const api = {
  getUsers: async (
    page = 1,
    limit = 20,
    search = "",
    role = "all",
    status = "all"
  ): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role !== "all" && { role }),
      ...(status !== "all" && { status }),
    });
    const response = await fetch(`/api/admin/users?${params}`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error("Failed to update user role");
    return response.json();
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await fetch(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error("Failed to update user status");
    return response.json();
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
  },
};

const roleConfig = {
  CUSTOMER: {
    color: "bg-blue-100 text-blue-800",
    icon: User,
    label: "Customer",
  },
  ADMIN: {
    color: "bg-purple-100 text-purple-800",
    icon: Shield,
    label: "Admin",
  },
  SUPER_ADMIN: {
    color: "bg-red-100 text-red-800",
    icon: Crown,
    label: "Super Admin",
  },
};

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [limit] = useState(20);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's role from database to verify permissions
  const { data: currentUserData } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const response = await fetch("/api/admin/current-user");
      if (!response.ok) throw new Error("Failed to get current user");
      return response.json();
    },
    enabled: !!user,
  });

  const currentUserRole = currentUserData?.role;
  const isSuperAdmin = currentUserRole === "SUPER_ADMIN";

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "admin",
      "users",
      currentPage,
      searchTerm,
      roleFilter,
      statusFilter,
      limit,
    ],
    queryFn: () =>
      api.getUsers(currentPage, limit, searchTerm, roleFilter, statusFilter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update user role:", error);
      alert(error.message || "Failed to update user role. Please try again.");
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update user status:", error);
      alert(error.message || "Failed to update user status. Please try again.");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete user:", error);
      alert(error.message || "Failed to delete user. Please try again.");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleUpdate = (userId: string, newRole: string) => {
    // Prevent modifying own role
    if (userId === user?.uid) {
      alert("You cannot change your own role.");
      return;
    }
    if (
      confirm(`Are you sure you want to change this user's role to ${newRole}?`)
    ) {
      updateRoleMutation.mutate({ id: userId, role: newRole });
    }
  };

  const handleStatusUpdate = (userId: string, newStatus: boolean) => {
    // Prevent deactivating own account
    if (userId === user?.uid) {
      alert("You cannot deactivate your own account.");
      return;
    }
    const action = newStatus ? "activate" : "deactivate";
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      updateStatusMutation.mutate({ id: userId, isActive: newStatus });
    }
  };

  const handleDeleteUser = (userId: string) => {
    // Prevent deleting own account
    if (userId === user?.uid) {
      alert("You cannot delete your own account.");
      return;
    }
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      deleteUserMutation.mutate(userId);
    }
  };

  const users = data?.users || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const getUserName = (user: User) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    if (user.profile?.displayName) {
      return user.profile.displayName;
    }
    return user.email;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers.toString()}
              icon={Users}
              trend="up"
              change="+12%"
            />
            <StatsCard
              title="Active Users"
              value={stats.activeUsers.toString()}
              icon={User}
              trend="up"
              change="+8%"
            />
            <StatsCard
              title="Admin Users"
              value={stats.adminUsers.toString()}
              icon={Shield}
              trend="neutral"
              change="0%"
            />
            <StatsCard
              title="New This Month"
              value={stats.newUsersThisMonth.toString()}
              icon={Users}
              trend="up"
              change="+25%"
            />
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User List</CardTitle>
              <div className="flex items-center space-x-2">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center space-x-2"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                </form>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Failed to load users. Please try again.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const RoleIcon = roleConfig[user.role].icon;
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                {user.profile?.avatar ? (
                                  <Image
                                    src={user.profile.avatar}
                                    alt={getUserName(user)}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {getUserName(user)}
                                </div>
                                {user.profile?.phone && (
                                  <div className="text-sm text-gray-500">
                                    {user.profile.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{user.email}</span>
                              {user.emailVerified && (
                                <Mail className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleConfig[user.role].color}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {roleConfig[user.role].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user._count?.orders || 0} orders
                            </div>
                            <div className="text-xs text-gray-500">
                              {user._count?.reviews || 0} reviews
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.lastLoginAt
                                ? new Date(
                                    user.lastLoginAt
                                  ).toLocaleDateString()
                                : "Never"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Profile
                                </DropdownMenuItem>

                                {/* Only Super Admins can promote users to Admin role */}
                                {user.role === "CUSTOMER" && isSuperAdmin && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRoleUpdate(user.id, "ADMIN")
                                    }
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}

                                {/* Only Super Admins can modify Admin users */}
                                {user.role === "ADMIN" && isSuperAdmin && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRoleUpdate(user.id, "CUSTOMER")
                                      }
                                    >
                                      Remove Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRoleUpdate(user.id, "SUPER_ADMIN")
                                      }
                                    >
                                      <Crown className="h-4 w-4 mr-2" />
                                      Make Super Admin
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {/* Show restricted message for regular admins */}
                                {(user.role === "CUSTOMER" ||
                                  user.role === "ADMIN") &&
                                  !isSuperAdmin && (
                                    <DropdownMenuItem disabled>
                                      <Shield className="h-4 w-4 mr-2 opacity-50" />
                                      Manage Role (Super Admin Only)
                                    </DropdownMenuItem>
                                  )}

                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(user.id, !user.isActive)
                                  }
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  {user.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>

                                {/* Only Super Admins can delete admin users */}
                                {(user.role === "CUSTOMER" || isSuperAdmin) && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                )}

                                {/* Show restricted message for deleting admin users */}
                                {(user.role === "ADMIN" ||
                                  user.role === "SUPER_ADMIN") &&
                                  !isSuperAdmin && (
                                    <DropdownMenuItem
                                      disabled
                                      className="text-gray-400"
                                    >
                                      Delete User (Super Admin Only)
                                    </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.totalCount
                      )}{" "}
                      of {pagination.totalCount} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setCurrentPage(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setCurrentPage(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
  change: string;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  change,
}: StatsCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="mt-4">
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {change}
          </span>
          <span className="text-sm text-gray-600 ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
