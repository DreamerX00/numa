// Admin API utilities for React Query
const API_BASE = '/api/admin';

interface ProductData {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  trackQuantity?: boolean;
  quantity?: number;
  minQuantity?: number;
  weight?: number;
  images?: string[];
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  brandId?: string;
  tags?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export const api = {
  // Products
  async getProduct(id: string) {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async updateProduct(id: string, data: ProductData) {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  async createProduct(data: ProductData) {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  // Categories
  async getCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Sponsors (instead of brands)
  async getSponsors() {
    const response = await fetch(`${API_BASE}/brands`); // Still using brands endpoint
    if (!response.ok) throw new Error('Failed to fetch sponsors');
    return response.json();
  },

  // Image upload
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload image');
    const result = await response.json();
    return result.url;
  },
};