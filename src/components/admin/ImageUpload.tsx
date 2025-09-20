"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (imageUrl: string, publicId?: string) => void;
  onError?: (error: string) => void;
  currentImage?: string;
  folder?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

interface UploadResponse {
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

export function ImageUpload({ 
  onUpload, 
  onError, 
  currentImage, 
  folder = 'carousel',
  maxSize = 10,
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResponse = await response.json();
      
      setPreview(result.url);
      setUploadStatus('success');
      onUpload(result.url, result.publicId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  }, [folder, onUpload, onError, validateFile]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleBrowseClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setUploadStatus('idle');
    onUpload('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card 
        className={`
          border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragOver && !disabled ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          ${uploadStatus === 'success' ? 'border-green-500' : ''}
          ${uploadStatus === 'error' ? 'border-red-500' : ''}
        `}
        onClick={handleBrowseClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {preview ? (
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={200}
                  className="rounded-lg object-cover w-full h-48"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {uploadStatus === 'success' && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Image uploaded successfully
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {uploadStatus === 'error' ? 'Upload Failed' : 'Upload Image'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {disabled 
                      ? 'Image upload disabled' 
                      : 'Drag and drop an image here, or click to browse'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPEG, PNG, WebP, GIF • Max {maxSize}MB
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!preview && !disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={handleBrowseClick}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose Image
        </Button>
      )}
    </div>
  );
}