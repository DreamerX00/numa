import { useState, useCallback } from 'react';

export interface UploadResult {
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

export interface UseImageUploadProps {
  folder?: string;
  maxSize?: number; // in MB
  uploadEndpoint?: string; // Custom upload endpoint (default: /api/admin/upload)
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useImageUpload({
  folder = 'uploads',
  maxSize = 10,
  uploadEndpoint = '/api/admin/upload',
  onSuccess,
  onError
}: UseImageUploadProps = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.';
    }
    
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size too large. Maximum ${maxSize}MB allowed.`;
    }
    
    return null;
  }, [maxSize]);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult | null> => {
    // Skip validation for video files (handled by API)
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        onError?.(validationError);
        return null;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('resource_type', isVideo ? 'video' : 'image');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResult = await response.json();
      
      onSuccess?.(result);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  }, [folder, uploadEndpoint, onSuccess, onError, validateFile]);

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    uploadError,
    resetUpload,
    validateFile
  };
}

// Utility function for quick single image uploads
export async function uploadSingleImage(
  file: File, 
  folder: string = 'uploads'
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  return response.json();
}

// Utility function for deleting images from Cloudinary
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/upload?publicId=${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Failed to delete image from Cloudinary');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Utility function to extract public ID from Cloudinary URL
export function extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.ext
    const regex = /\/([^\/]+)\/([^\/]+)\/v\d+\/(.+)\.[^.]+$/;
    const match = cloudinaryUrl.match(regex);
    return match ? match[3] : null;
  } catch {
    return null;
  }
}