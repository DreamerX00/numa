"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Reorder } from "framer-motion";
import {
  Upload,
  Trash2,
  ExternalLink,
  Settings,
  GripVertical,
  Play,
  Image as ImageIcon,
  Loader2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InstagramPost {
  id: string;
  mediaUrl: string;
  mediaType: "POST" | "REEL";
  postUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface InstagramSettings {
  id: string;
  displayLimit: number;
  autoScrollSpeed: number;
  isActive: boolean;
}

interface CloudinaryUploadWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  sources: string[];
  multiple: boolean;
  maxFiles: number;
  resourceType: string;
  clientAllowedFormats: string[];
  maxFileSize: number;
  cropping?: boolean;
  showSkipCropButton?: boolean;
  styles?: {
    palette: {
      window: string;
      windowBorder: string;
      tabIcon: string;
      menuIcons: string;
      textDark: string;
      textLight: string;
      link: string;
      action: string;
      inactiveTabIcon: string;
      error: string;
      inProgress: string;
      complete: string;
      sourceBg: string;
    };
  };
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: CloudinaryUploadWidgetOptions,
        callback: (error: unknown, result: { event: string; info: { secure_url: string } }) => void
      ) => {
        open: () => void;
      };
    };
  }
}

export default function InstagramManagementPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [settings, setSettings] = useState<InstagramSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);

  // Form state for new post
  const [newPostUrl, setNewPostUrl] = useState("");
  const [newMediaType, setNewMediaType] = useState<"POST" | "REEL">("POST");
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState("");

  // Fetch posts and settings
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/instagram"),
        fetch("/api/admin/instagram/settings"),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load Instagram data");
    } finally {
      setLoading(false);
    }
  };

  // Cloudinary Upload Widget
  const openUploadWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration missing. Check your .env file for NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
      return;
    }

    if (!window.cloudinary) {
      toast.error("Cloudinary widget is still loading. Please wait a moment and try again.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
        resourceType: "auto",
        clientAllowedFormats: ["gif", "jpg", "jpeg", "png", "mp4", "webm", "mov"],
        maxFileSize: 100000000,
        cropping: false,
        showSkipCropButton: true,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#000000",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
          }
        }
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setUploadedMediaUrl(result.info.secure_url);
          toast.success("Media uploaded successfully!");
        }
      }
    );

    widget.open();
  };

  // Create new post
  const handleCreatePost = async () => {
    if (!uploadedMediaUrl || !newPostUrl) {
      toast.error("Please upload media and provide Instagram post URL");
      return;
    }

    setUploading(true);
    try {
      const response = await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: uploadedMediaUrl,
          mediaType: newMediaType,
          postUrl: newPostUrl,
        }),
      });

      if (response.ok) {
        toast.success("Post added successfully!");
        setUploadedMediaUrl("");
        setNewPostUrl("");
        setNewMediaType("POST");
        fetchData();
      } else {
        toast.error("Failed to add post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to add post");
    } finally {
      setUploading(false);
    }
  };

  // Toggle post active status
  const handleToggleActive = async (postId: string) => {
    try {
      const response = await fetch("/api/admin/instagram", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          id: postId,
        }),
      });

      if (response.ok) {
        toast.success("Post status updated");
        fetchData();
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      console.error("Error toggling post:", error);
      toast.error("Failed to update post");
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/admin/instagram?id=${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  // Reorder posts
  const handleReorder = async (newOrder: InstagramPost[]) => {
    setPosts(newOrder);

    const reorderedPosts = newOrder.map((post, index) => ({
      id: post.id,
      sortOrder: index,
    }));

    try {
      const response = await fetch("/api/admin/instagram", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          posts: reorderedPosts,
        }),
      });

      if (response.ok) {
        toast.success("Posts reordered successfully");
      } else {
        toast.error("Failed to reorder posts");
        fetchData(); // Revert on error
      }
    } catch (error) {
      console.error("Error reordering posts:", error);
      toast.error("Failed to reorder posts");
      fetchData();
    }
  };

  // Update settings
  const handleUpdateSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/instagram/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings updated successfully");
        setShowSettings(false);
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  // Load Cloudinary widget script
  useEffect(() => {
    const loadCloudinaryWidget = () => {
      // Check if already loaded
      if (window.cloudinary) {
        setCloudinaryLoaded(true);
        return;
      }

      if (document.getElementById("cloudinary-upload-widget")) {
        // Script tag exists, wait for it to load
        const checkInterval = setInterval(() => {
          if (window.cloudinary) {
            setCloudinaryLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000); // Stop after 10s
        return;
      }

      const script = document.createElement("script");
      script.id = "cloudinary-upload-widget";
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      
      script.onload = () => {
        console.log("Cloudinary widget loaded successfully");
        setCloudinaryLoaded(true);
      };
      
      script.onerror = () => {
        console.error("Failed to load Cloudinary widget");
        toast.error("Failed to load upload widget. Please refresh the page.");
      };
      
      document.body.appendChild(script);
    };

    loadCloudinaryWidget();

    return () => {
      // Don't remove script on unmount as it may be used by other components
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Instagram Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your Instagram posts carousel on the home page
          </p>
        </div>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Instagram Carousel Settings</DialogTitle>
              <DialogDescription>
                Configure how the Instagram section appears on your website
              </DialogDescription>
            </DialogHeader>
            {settings && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Display Limit</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.displayLimit}
                    onChange={(e) =>
                      setSettings({ ...settings, displayLimit: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Number of posts to show (1-20)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Auto-Scroll Speed (ms)</Label>
                  <Input
                    type="number"
                    min="1000"
                    max="10000"
                    step="500"
                    value={settings.autoScrollSpeed}
                    onChange={(e) =>
                      setSettings({ ...settings, autoScrollSpeed: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Time between auto-scrolls (1000-10000ms)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Instagram Section</Label>
                    <p className="text-sm text-gray-500">
                      Show/hide the Instagram carousel on home page
                    </p>
                  </div>
                  <Switch
                    checked={settings.isActive}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, isActive: checked })
                    }
                  />
                </div>

                <Button
                  onClick={handleUpdateSettings}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Environment Check Alert */}
      {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cloudinary Configuration Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              Please check your Cloudinary environment variables in your <code className="px-1 py-0.5 bg-white rounded">.env</code> file:
              <div className="mt-3 p-3 bg-white rounded border border-orange-200 font-mono text-sm">
                <div>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dkdu1rzki</div>
                <div>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=numa</div>
              </div>
              <div className="mt-2 text-sm">
                If these are set correctly, restart your dev server. The upload widget will allow you to manually select and upload GIF files from your computer.
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Upload Instructions */}
      {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">📤 Manual GIF Upload Instructions</CardTitle>
            <CardDescription className="text-blue-700">
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>Click the upload button below</li>
                <li>Select <strong>&quot;My Files&quot;</strong> to browse your computer</li>
                <li>Choose your GIF file (max 100MB)</li>
                <li>Wait for upload to complete</li>
                <li>Add the Instagram post URL</li>
                <li>Select POST or REEL type</li>
                <li>Click &quot;Add Instagram Post&quot;</li>
              </ol>
              <div className="mt-3 text-sm">
                <strong>Tip:</strong> For best results, use GIFs that are 500-800px wide. You can create GIFs from Instagram videos using tools like Giphy or Ezgif.
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Add New Post Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Instagram Post</CardTitle>
          <CardDescription>
            Upload a GIF preview and provide the Instagram post link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div>
                <Label>Media Preview (GIF/Image)</Label>
                {uploadedMediaUrl ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-500 mt-2">
                    <Image
                      src={uploadedMediaUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-cover"
                      unoptimized={uploadedMediaUrl.endsWith('.gif')}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setUploadedMediaUrl("")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={openUploadWidget}
                    disabled={!cloudinaryLoaded}
                    variant="outline"
                    className="w-full h-32 border-dashed mt-2"
                  >
                    <div className="text-center">
                      {!cloudinaryLoaded ? (
                        <>
                          <Loader2 className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
                          <p className="text-sm text-gray-600">
                            Loading upload widget...
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Click to upload GIF or Image
                          </p>
                        </>
                      )}
                    </div>
                  </Button>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <div>
                <Label>Instagram Post URL</Label>
                <Input
                  type="url"
                  placeholder="https://instagram.com/p/xxxxx"
                  value={newPostUrl}
                  onChange={(e) => setNewPostUrl(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Media Type</Label>
                <Select
                  value={newMediaType}
                  onValueChange={(value: "POST" | "REEL") => setNewMediaType(value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Post
                      </div>
                    </SelectItem>
                    <SelectItem value="REEL">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Reel
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={uploading || !uploadedMediaUrl || !newPostUrl}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Post...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Instagram Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Instagram Posts ({posts.length})</CardTitle>
          <CardDescription>
            Drag and drop to reorder. Click to toggle visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Instagram posts yet</p>
              <p className="text-sm">Add your first post above to get started</p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={posts}
              onReorder={handleReorder}
              className="space-y-4"
            >
              {posts.map((post) => (
                <Reorder.Item
                  key={post.id}
                  value={post}
                  className="bg-white border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

                    {/* Preview */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.mediaUrl}
                        alt="Instagram post"
                        fill
                        className="object-cover"
                        unoptimized={post.mediaUrl.endsWith('.gif')}
                      />
                      {post.mediaType === "REEL" && (
                        <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1">
                          <Play className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {post.mediaType}
                        </span>
                        <span className="text-xs text-gray-500">
                          #{post.sortOrder}
                        </span>
                      </div>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        {post.postUrl}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={post.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleActive(post.id)}
                      >
                        {post.isActive ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Hidden
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}
