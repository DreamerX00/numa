"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { VideoUpload } from "@/components/admin/VideoUpload";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api as adminApi } from "@/lib/api/admin";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

// Types
interface Category {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  sku: string;
  barcode: string;
  trackQuantity: boolean;
  quantity: number;
  minQuantity: number;
  weight: number;
  images: string[];
  videos: string[]; // Add videos field
  metaTitle: string;
  metaDescription: string;
  categoryId: string;
  sponsors: string; // Comma-separated sponsor names
  tags: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isActive: boolean;
  isFeatured: boolean;
  // Shipping configuration
  shippingWeight: number;
  shippingLength: number;
  shippingWidth: number;
  shippingHeight: number;
  shippingClass: string;
  requiresSpecialHandling: boolean;
  domesticOnly: boolean;
  individualShippingRate: number | null;
  fragile: boolean;
  requiresSignature: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: 0,
    comparePrice: 0,
    costPrice: 0,
    sku: "",
    barcode: "",
    trackQuantity: true,
    quantity: 0,
    minQuantity: 0,
    weight: 0,
    images: [],
    videos: [], // Add videos array
    metaTitle: "",
    metaDescription: "",
    categoryId: "",
    sponsors: "", // Comma-separated sponsor names
    tags: "",
    status: "ACTIVE", // Default to ACTIVE for new products
    isActive: true,
    isFeatured: false,
    // Shipping configuration defaults
    shippingWeight: 0,
    shippingLength: 0,
    shippingWidth: 0,
    shippingHeight: 0,
    shippingClass: "standard",
    requiresSpecialHandling: false,
    domesticOnly: false,
    individualShippingRate: null,
    fragile: false,
    requiresSignature: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string>("");

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: adminApi.getCategories,
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created successfully!");
      router.push("/admin/products");
    },
    onError: (error: unknown) => {
      console.error("Create failed:", error);

      // Handle validation errors from API
      const apiError = error as {
        response?: {
          data?: {
            details?: Array<{ path: string[]; message: string }>;
            error?: string;
          };
        };
      };

      if (apiError?.response?.data?.details) {
        const validationErrors = apiError.response.data.details;
        const errorMessages = validationErrors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        toast.error(`Validation failed: ${errorMessages}`);

        // Set field-specific errors
        const fieldErrors: Record<string, string> = {};
        validationErrors.forEach((err) => {
          const field = err.path[0];
          if (field) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (apiError?.response?.data?.error) {
        toast.error(apiError.response.data.error);
        setErrors({ submit: apiError.response.data.error });
      } else {
        toast.error("Failed to create product. Please try again.");
        setErrors({ submit: "Failed to create product. Please try again." });
      }
    },
  });

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | boolean | string[] | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    handleInputChange("name", name);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleInputChange("slug", generateSlug(name));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only validate truly required fields
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
      toast.error("Product name is required");
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Product slug is required";
      toast.error("Product slug is required");
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
      toast.error("Price must be greater than 0");
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
      toast.error("Please select a category");
    }

    // Show a summary toast if multiple errors
    if (Object.keys(newErrors).length > 1) {
      toast.error(
        `Please fix ${Object.keys(newErrors).length} validation errors`
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const createData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean), // Keep as array
      brandId: formData.sponsors || undefined, // Map sponsors to brandId
      comparePrice: formData.comparePrice || undefined,
      costPrice: formData.costPrice || undefined,
      minQuantity: formData.minQuantity || undefined,
      weight: formData.weight || undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      // Remove sponsors field as it's not expected by API
      sponsors: undefined,
    };

    createProductMutation.mutate(createData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-600">
                Create a new product. Only name, slug, price, and category are
                required.
              </p>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter product name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">Product Slug*</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        handleInputChange("slug", e.target.value)
                      }
                      placeholder="product-slug"
                      className={errors.slug ? "border-red-500" : ""}
                    />
                    {errors.slug && (
                      <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        handleInputChange("shortDescription", e.target.value)
                      }
                      placeholder="Brief product description"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Detailed product description"
                      rows={6}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price*</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange(
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="comparePrice">Compare at Price</Label>
                      <Input
                        id="comparePrice"
                        type="number"
                        value={formData.comparePrice}
                        onChange={(e) =>
                          handleInputChange(
                            "comparePrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <Label htmlFor="costPrice">Cost per Item</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        value={formData.costPrice}
                        onChange={(e) =>
                          handleInputChange(
                            "costPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU (Optional)</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          handleInputChange("sku", e.target.value)
                        }
                        placeholder="SKU123"
                        className={errors.sku ? "border-red-500" : ""}
                      />
                      {errors.sku && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.sku}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) =>
                          handleInputChange("barcode", e.target.value)
                        }
                        placeholder="123456789"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.trackQuantity}
                      onCheckedChange={(checked) =>
                        handleInputChange("trackQuantity", checked)
                      }
                    />
                    <Label>Track quantity</Label>
                  </div>

                  {formData.trackQuantity && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) =>
                            handleInputChange(
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="minQuantity">Minimum Quantity</Label>
                        <Input
                          id="minQuantity"
                          type="number"
                          value={formData.minQuantity}
                          onChange={(e) =>
                            handleInputChange(
                              "minQuantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        handleInputChange("metaTitle", e.target.value)
                      }
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) =>
                        handleInputChange("metaDescription", e.target.value)
                      }
                      placeholder="SEO description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <Label>Product Images</Label>
                    <ImageUpload
                      onUpload={(imageUrl) => {
                        setFormData((prev) => ({
                          ...prev,
                          images: [...prev.images, imageUrl],
                        }));
                        setUploadError("");
                        setErrors((prev) => ({ ...prev, image: "" }));
                        toast.success("Image uploaded successfully!");
                      }}
                      onError={(error) => {
                        setUploadError(error);
                        setErrors((prev) => ({ ...prev, image: error }));
                        toast.error(`Image upload failed: ${error}`);
                      }}
                      folder="products"
                      maxSize={10}
                    />
                    {uploadError && (
                      <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                    )}
                  </div>

                  {/* Image Gallery */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Videos */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Upload */}
                  <div>
                    <Label>Product Videos (Optional)</Label>
                    <VideoUpload
                      onUpload={(videoUrl) => {
                        setFormData((prev) => ({
                          ...prev,
                          videos: [...prev.videos, videoUrl],
                        }));
                        toast.success("Video uploaded successfully!");
                      }}
                      onError={(error) => {
                        toast.error(`Video upload failed: ${error}`);
                      }}
                      folder="products/videos"
                      maxSize={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload product demonstration or showcase videos (max 50MB)
                    </p>
                  </div>

                  {/* Video Gallery */}
                  {formData.videos.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Videos ({formData.videos.length})</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {formData.videos.map((video, index) => (
                          <div key={index} className="relative group">
                            <video
                              src={video}
                              controls
                              className="rounded-md w-full h-32 object-cover bg-black"
                              preload="metadata"
                            >
                              <track kind="captions" />
                            </video>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  videos: prev.videos.filter(
                                    (_, i) => i !== index
                                  ),
                                }));
                                toast.success("Video removed");
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {index === 0 && (
                              <Badge className="absolute bottom-1 left-1 text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organization */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="categoryId">Category*</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        handleInputChange("categoryId", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.categoryId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.categoryId}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="sponsors">Sponsors & Partners</Label>
                    <Input
                      id="sponsors"
                      value={formData.sponsors}
                      onChange={(e) =>
                        handleInputChange("sponsors", e.target.value)
                      }
                      placeholder="De Beers, Gemological Institute, Swiss Gold Refiners"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter sponsor names separated by commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        handleInputChange("tags", e.target.value)
                      }
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (grams)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        handleInputChange(
                          "weight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Shipping Weight */}
                  <div>
                    <Label htmlFor="shippingWeight">
                      Shipping Weight (grams)
                    </Label>
                    <Input
                      id="shippingWeight"
                      type="number"
                      value={formData.shippingWeight}
                      onChange={(e) =>
                        handleInputChange(
                          "shippingWeight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Weight used for shipping calculations (may differ from
                      product weight due to packaging)
                    </p>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <Label>Package Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <Input
                          type="number"
                          value={formData.shippingLength}
                          onChange={(e) =>
                            handleInputChange(
                              "shippingLength",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Length"
                          min="0"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={formData.shippingWidth}
                          onChange={(e) =>
                            handleInputChange(
                              "shippingWidth",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Width"
                          min="0"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={formData.shippingHeight}
                          onChange={(e) =>
                            handleInputChange(
                              "shippingHeight",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Height"
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Package dimensions for accurate shipping calculations
                    </p>
                  </div>

                  {/* Shipping Class */}
                  <div>
                    <Label htmlFor="shippingClass">Shipping Class</Label>
                    <Select
                      value={formData.shippingClass}
                      onValueChange={(value) =>
                        handleInputChange("shippingClass", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="expedited">Expedited</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                        <SelectItem value="heavy">Heavy Items</SelectItem>
                        <SelectItem value="fragile">Fragile Items</SelectItem>
                        <SelectItem value="jewelry">
                          Jewelry (Secure)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Shipping class affects available shipping methods and
                      rates
                    </p>
                  </div>

                  {/* Individual Shipping Rate Override */}
                  <div>
                    <Label htmlFor="individualShippingRate">
                      Individual Shipping Rate (₹)
                    </Label>
                    <Input
                      id="individualShippingRate"
                      type="number"
                      value={formData.individualShippingRate || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "individualShippingRate",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="Leave empty to use standard rates"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Override default shipping calculation with fixed rate for
                      this product
                    </p>
                  </div>

                  {/* Special Handling Options */}
                  <div className="space-y-3">
                    <Label>Special Handling</Label>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="fragile" className="font-normal">
                          Fragile Item
                        </Label>
                        <p className="text-xs text-gray-500">
                          Requires careful handling and special packaging
                        </p>
                      </div>
                      <Switch
                        id="fragile"
                        checked={formData.fragile}
                        onCheckedChange={(checked) =>
                          handleInputChange("fragile", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="requiresSignature"
                          className="font-normal"
                        >
                          Requires Signature
                        </Label>
                        <p className="text-xs text-gray-500">
                          Delivery requires recipient signature
                        </p>
                      </div>
                      <Switch
                        id="requiresSignature"
                        checked={formData.requiresSignature}
                        onCheckedChange={(checked) =>
                          handleInputChange("requiresSignature", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="requiresSpecialHandling"
                          className="font-normal"
                        >
                          Special Handling Required
                        </Label>
                        <p className="text-xs text-gray-500">
                          Requires additional handling fees and processing time
                        </p>
                      </div>
                      <Switch
                        id="requiresSpecialHandling"
                        checked={formData.requiresSpecialHandling}
                        onCheckedChange={(checked) =>
                          handleInputChange("requiresSpecialHandling", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="domesticOnly" className="font-normal">
                          Domestic Shipping Only
                        </Label>
                        <p className="text-xs text-gray-500">
                          Restrict shipping to domestic addresses only
                        </p>
                      </div>
                      <Switch
                        id="domesticOnly"
                        checked={formData.domesticOnly}
                        onCheckedChange={(checked) =>
                          handleInputChange("domesticOnly", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Publication Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange(
                          "status",
                          value as "DRAFT" | "ACTIVE" | "ARCHIVED"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Products must be Active to appear in the store
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        handleInputChange("isActive", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFeatured">Featured</Label>
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) =>
                        handleInputChange("isFeatured", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Product
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link href="/admin/products">Cancel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
