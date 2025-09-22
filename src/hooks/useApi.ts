import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/client';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
  averageRating?: number;
  reviewCount: number;
  tags: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  attributes: Record<string, string | number | boolean>;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  language: string;
  currency: string;
  timezone: string;
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushNotifications: boolean;
}

export interface Address {
  id: string;
  type: 'SHIPPING' | 'BILLING' | 'BOTH';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  currency: string;
}

// API Functions
const api = {
  // Products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const { data } = await axios.get('/api/products', { params });
    return data;
  },

  // User Profile
  getUserProfile: async () => {
    const { data } = await axios.get('/api/user/profile');
    return data;
  },

  updateUserProfile: async (profile: Partial<UserProfile>) => {
    const { data } = await axios.put('/api/user/profile', profile);
    return data;
  },

  // Addresses
  getAddresses: async () => {
    const { data } = await axios.get('/api/user/addresses');
    return data;
  },

  createAddress: async (address: Omit<Address, 'id'>) => {
    const { data } = await axios.post('/api/user/addresses', address);
    return data;
  },

  updateAddress: async (id: string, address: Partial<Address>) => {
    const { data } = await axios.put(`/api/user/addresses/${id}`, address);
    return data;
  },

  deleteAddress: async (id: string) => {
    const { data } = await axios.delete(`/api/user/addresses/${id}`);
    return data;
  },

  // Cart
  getCart: async () => {
    try {
      const { data } = await axios.get('/api/cart');
      return data;
    } catch (error) {
      // Handle 401 authentication errors gracefully
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('Cart API requires authentication');
        return { items: [] };
      }
      throw error;
    }
  },

  addToCart: async (item: { productId: string; variantId?: string; quantity: number }) => {
    const { data } = await axios.post('/api/cart', item);
    return data;
  },
};

// React Query Hooks
export const useProducts = (params?: Parameters<typeof api.getProducts>[0]) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: api.getUserProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user, // Only run query if user is authenticated
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

export const useAddresses = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: api.getAddresses,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user, // Only run query if user is authenticated
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<Address> }) =>
      api.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    },
  });
};

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: api.getCart,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};