"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Video as VideoIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface VideoUploadProps {
  onUpload: (videoUrl: string, publicId?: string) => void;
  onError?: (error: string) => void;
  currentVideo?: string;
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
  duration: number;
  originalName: string;
  folder: string;
}

export function VideoUpload({
  onUpload,
  onError,
  currentVideo,
  folder = "products/videos",
  maxSize = 50, // Default 50MB for videos
  className = "",
  disabled = false,
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentVideo || null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
      ];

      if (!allowedTypes.includes(file.type)) {
        return "Invalid file type. Only MP4, WebM, OGG, MOV, AVI, and MKV videos are allowed.";
      }

      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size too large. Maximum ${maxSize}MB allowed.`;
      }

      return null;
    },
    [maxSize]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        onError?.(validationError);
        setUploadStatus("error");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus("idle");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        formData.append("resource_type", "video"); // Important for Cloudinary

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 300);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result: UploadResponse = await response.json();

        setPreview(result.url);
        setUploadStatus("success");
        onUpload(result.url, result.publicId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        onError?.(errorMessage);
        setUploadStatus("error");
      } finally {
        setIsUploading(false);
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      }
    },
    [folder, onUpload, onError, validateFile]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      uploadFile(file);
    },
    [uploadFile]
  );

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

  const handleRemoveVideo = () => {
    setPreview(null);
    setUploadStatus("idle");
    onUpload("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card
        className={`
          border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragOver && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"}
          ${uploadStatus === "success" ? "border-green-500" : ""}
          ${uploadStatus === "error" ? "border-red-500" : ""}
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
                <video
                  src={preview}
                  controls
                  className="rounded-lg w-full h-48 object-cover bg-black"
                  preload="metadata"
                >
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveVideo();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <VideoIcon className="h-8 w-8 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  {isUploading ? "Uploading video..." : "Upload video"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  MP4, WebM, OGG, MOV, AVI, MKV (max {maxSize}MB)
                </p>
              </div>

              {!isUploading && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100
                  ? `Uploading... ${Math.round(uploadProgress)}%`
                  : "Processing..."}
              </p>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === "success" && !isUploading && (
            <div className="mt-4 flex items-center justify-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Video uploaded successfully
            </div>
          )}

          {uploadStatus === "error" && !isUploading && (
            <div className="mt-4 flex items-center justify-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Upload failed. Please try again.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
