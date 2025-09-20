/**
 * Cloudinary Image Upload API Utilities
 * Centralized functions for consistent image handling across the application
 */

export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalName: string;
  folder: string;
}

/**
 * Upload a single image to Cloudinary via our API endpoint
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'uploads'
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload image');
  }

  return response.json();
}

/**
 * Delete an image from Cloudinary using its public ID
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch(`/api/admin/upload?publicId=${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete image');
  }
}

/**
 * Extract public ID from a Cloudinary URL
 * Format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/subfolder/public-id.ext
 */
export function getPublicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.[^.]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Generate a Cloudinary transformation URL for optimized image delivery
 */
export function generateOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string {
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl; // Return original if not a Cloudinary URL
  }

  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;
  
  // Insert transformation parameters before the version number
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  
  if (transformations.length === 0) return originalUrl;
  
  const transformString = transformations.join(',');
  return originalUrl.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Validate file before upload
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size too large. Maximum ${maxSizeMB}MB allowed.`
    };
  }
  
  return { valid: true };
}

/**
 * Common folder names for organizing uploads
 */
export const UPLOAD_FOLDERS = {
  CAROUSEL: 'carousel',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  USERS: 'users',
  SPONSORS: 'sponsors',
  GENERAL: 'uploads'
} as const;

/**
 * Default image URLs for fallback purposes using Cloudinary
 */
export const DEFAULT_IMAGES = {
  PRODUCT: 'https://res.cloudinary.com/dkdu1rzki/image/upload/c_fill,h_400,w_400,g_center/v1/defaults/default-product.jpg',
  CATEGORY: 'https://res.cloudinary.com/dkdu1rzki/image/upload/c_fill,h_300,w_600,g_center/v1/defaults/default-category.jpg', 
  BRAND: 'https://res.cloudinary.com/dkdu1rzki/image/upload/c_fill,h_200,w_200,g_center/v1/defaults/default-brand.jpg',
  USER: 'https://res.cloudinary.com/dkdu1rzki/image/upload/c_fill,h_150,w_150,g_center/v1/defaults/default-avatar.jpg',
  CAROUSEL: 'https://res.cloudinary.com/dkdu1rzki/image/upload/c_fill,h_600,w_1200,g_center/v1/defaults/default-carousel.jpg'
} as const;