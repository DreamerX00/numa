"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { api as adminApi } from '@/lib/api/admin';

// Types
interface Category {
  id: string;
  name: string;
}

interface Brand {
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
  metaTitle: string;
  metaDescription: string;
  categoryId: string;
  sponsors: string[]; // Array of sponsor IDs instead of single brandId
  tags: string;
  isActive: boolean;
  isFeatured: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    comparePrice: 0,
    costPrice: 0,
    sku: '',
    barcode: '',
    trackQuantity: true,
    quantity: 0,
    minQuantity: 0,
    weight: 0,
    images: [],
    metaTitle: '',
    metaDescription: '',
    categoryId: '',
    sponsors: [], // Array of sponsor IDs
    tags: '',
    isActive: true,
    isFeatured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
  });

  // Fetch sponsors
  const { data: sponsors = [] } = useQuery({
    queryKey: ['admin', 'sponsors'],
    queryFn: adminApi.getSponsors,
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push('/admin/products');
    },
    onError: (error: Error) => {
      console.error('Create failed:', error);
      setErrors({ submit: 'Failed to create product. Please try again.' });
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: adminApi.uploadImage,
    onSuccess: (url: string) => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      setIsUploading(false);
    },
    onError: () => {
      setErrors({ image: 'Failed to upload image. Please try again.' });
      setIsUploading(false);
    },
  });

  const handleInputChange = (field: keyof FormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    handleInputChange('name', name);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleInputChange('slug', generateSlug(name));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ image: 'Please select a valid image file.' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: 'Image size must be less than 5MB.' });
      return;
    }

    setIsUploading(true);
    setErrors({ image: '' });
    uploadImageMutation.mutate(file);
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Product slug is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const createData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean).join(','),
      comparePrice: formData.comparePrice || undefined,
      costPrice: formData.costPrice || undefined,
      minQuantity: formData.minQuantity || undefined,
      weight: formData.weight || undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
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
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new product</p>
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
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="slug">Product Slug*</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="product-slug"
                      className={errors.slug ? 'border-red-500' : ''}
                    />
                    {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                      placeholder="Brief product description"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description*</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Detailed product description"
                      rows={6}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
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
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={errors.price ? 'border-red-500' : ''}
                      />
                      {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    <div>
                      <Label htmlFor="comparePrice">Compare at Price</Label>
                      <Input
                        id="comparePrice"
                        type="number"
                        value={formData.comparePrice}
                        onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
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
                        onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
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
                      <Label htmlFor="sku">SKU*</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="SKU123"
                        className={errors.sku ? 'border-red-500' : ''}
                      />
                      {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
                    </div>

                    <div>
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.trackQuantity}
                      onCheckedChange={(checked) => handleInputChange('trackQuantity', checked)}
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
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
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
                          onChange={(e) => handleInputChange('minQuantity', parseInt(e.target.value) || 0)}
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
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
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
                    <Label htmlFor="imageUpload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {isUploading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload image</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                          </>
                        )}
                      </div>
                    </Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
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

              {/* Organization */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="categoryId">Category*</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
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
                    {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <Label>Sponsors & Partners</Label>
                    <p className="text-sm text-gray-600 mb-3">Select material suppliers and certification partners for this product</p>
                    <div className="grid grid-cols-1 gap-3">
                      {sponsors.map((sponsor: any) => (
                        <Card key={sponsor.id} className={`cursor-pointer transition-colors ${
                          formData.sponsors.includes(sponsor.id) 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={`sponsor-${sponsor.id}`}
                                checked={formData.sponsors.includes(sponsor.id)}
                                onChange={(e) => {
                                  const newSponsors = e.target.checked
                                    ? [...formData.sponsors, sponsor.id]
                                    : formData.sponsors.filter(id => id !== sponsor.id);
                                  handleInputChange('sponsors', newSponsors);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <Label htmlFor={`sponsor-${sponsor.id}`} className="font-medium cursor-pointer">
                                  {sponsor.name}
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">{sponsor.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (grams)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFeatured">Featured</Label>
                    <Switch
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
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
                      <Link href="/admin/products">
                        Cancel
                      </Link>
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