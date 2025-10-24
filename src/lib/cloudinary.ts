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
 * ✅ Now with automatic modern format detection and DPR support
 */
export function generateOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    dpr?: 'auto' | number;
    gravity?: 'auto' | 'face' | 'center';
  } = {}
): string {
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl; // Return original if not a Cloudinary URL
  }

  const { 
    width, 
    height, 
    quality = 'auto', 
    format = 'auto', // ✅ Auto-detect WebP/AVIF support
    crop = 'fill',
    dpr = 'auto', // ✅ Auto device pixel ratio
    gravity = 'auto'
  } = options;
  
  // Insert transformation parameters before the version number
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (dpr) transformations.push(`dpr_${dpr}`);
  
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
 * Default image URLs for fallback purposes using reliable Unsplash images
 */
export const DEFAULT_IMAGES = {
  PRODUCT: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center',
  CATEGORY: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=600&h=300&fit=crop&crop=center', 
  BRAND: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop&crop=center',
  USER: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=center',
  CAROUSEL: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=600&fit=crop&crop=center'
} as const;