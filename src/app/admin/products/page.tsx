"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeartLoader from '@/components/ui/HeartLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  category: {
    name: string;
  };
  brand?: {
    name: string;
  };
  images: string[];
  isActive: boolean;
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  filters: {
    categories: Array<{ id: string; name: string }>;
    brands: Array<{ id: string; name: string }>;
  };
}

// API functions
const api = {
  getProducts: async (page = 1, limit = 20, search = ''): Promise<ProductsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    const response = await fetch(`/api/admin/products?${params}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  deleteProduct: async (id: string) => {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  toggleProductStatus: async (id: string, isActive: boolean) => {
    const response = await fetch(`/api/admin/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error('Failed to update product status');
    return response.json();
  }
};

export default function AdminProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit] = useState(20);
  
  const queryClient = useQueryClient();

  // Fetch products
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', currentPage, searchTerm, limit],
    queryFn: () => api.getProducts(currentPage, limit, searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  // Toggle product status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.toggleProductStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const products = data?.products || [];
  const total = data?.pagination.totalCount || 0;
  const totalPages = data?.pagination.totalPages || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Products" 
            value={total.toString()} 
            icon={Package}
            trend="up"
            change="+12%"
          />
          <StatsCard 
            title="Active Products" 
            value={products.filter(p => p.isActive).length.toString()} 
            icon={Package}
            trend="up"
            change="+8%"
          />
          <StatsCard 
            title="Low Stock" 
            value={products.filter(p => p.quantity <= 10).length.toString()} 
            icon={AlertTriangle}
            trend="down"
            change="-5%"
          />
          <StatsCard 
            title="Out of Stock" 
            value={products.filter(p => p.quantity === 0).length.toString()} 
            icon={AlertTriangle}
            trend="neutral"
            change="0%"
          />
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product List</CardTitle>
              <div className="flex items-center space-x-2">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                </form>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <HeartLoader size="lg" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Failed to load products. Please try again.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                              {product.images[0] && (
                                <Image 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.brand && (
                                <div className="text-sm text-gray-500">{product.brand.name}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">₹{product.price.toLocaleString()}</span>
                            {product.comparePrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₹{product.comparePrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.quantity === 0 ? "destructive" : product.quantity <= 10 ? "secondary" : "default"}>
                            {product.quantity} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/products/${product.slug}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/products/${product.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(product.id, product.isActive)}
                              >
                                {product.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} products
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
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
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

function StatsCard({ title, value, icon: Icon, trend, change }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
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