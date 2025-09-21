"use client";

import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  sponsors: string; // Comma-separated string instead of array
  tags: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
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
    sponsors: '', // Comma-separated sponsor names
    tags: '',
    status: 'DRAFT',
    isActive: true,
    isFeatured: false,
    // Shipping configuration defaults
    shippingWeight: 0,
    shippingLength: 0,
    shippingWidth: 0,
    shippingHeight: 0,
    shippingClass: 'standard',
    requiresSpecialHandling: false,
    domesticOnly: false,
    individualShippingRate: null,
    fragile: false,
    requiresSignature: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Fetch product data
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: () => adminApi.getProduct(productId),
    enabled: !!productId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: Partial<FormData>) => {
      const transformedData = {
        ...data,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()) : data.tags
      };
      return adminApi.updateProduct(productId, transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] });
      router.push('/admin/products');
    },
    onError: (error: Error) => {
      console.error('Update failed:', error);
      setErrors({ submit: 'Failed to update product. Please try again.' });
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

  // Initialize form data when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price,
        comparePrice: product.comparePrice || 0,
        costPrice: product.costPrice || 0,
        sku: product.sku,
        barcode: product.barcode || '',
        trackQuantity: product.trackQuantity,
        quantity: product.quantity,
        minQuantity: product.minQuantity || 0,
        weight: product.weight || 0,
        images: product.images,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        categoryId: product.categoryId,
        sponsors: '', // Initialize as empty, no automatic conversion
        tags: product.tags.join(', '),
        status: product.status || 'DRAFT',
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        // Shipping configuration - use defaults if not available in product data
        shippingWeight: product.shippingWeight || product.weight || 0,
        shippingLength: product.shippingLength || 0,
        shippingWidth: product.shippingWidth || 0,
        shippingHeight: product.shippingHeight || 0,
        shippingClass: product.shippingClass || 'standard',
        requiresSpecialHandling: product.requiresSpecialHandling || false,
        domesticOnly: product.domesticOnly || false,
        individualShippingRate: product.individualShippingRate || null,
        fragile: product.fragile || false,
        requiresSignature: product.requiresSignature || false,
      });
    }
  }, [product]);

  const handleInputChange = (field: keyof FormData, value: string | number | boolean | string[] | null) => {
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

    const updateData = {
      ...formData,
      tags: formData.tags, // Keep as string, mutation will handle conversion
      comparePrice: formData.comparePrice || undefined,
      costPrice: formData.costPrice || undefined,
      minQuantity: formData.minQuantity || undefined,
      weight: formData.weight || undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      description: formData.description || undefined,
      shortDescription: formData.shortDescription || undefined,
      barcode: formData.barcode || undefined,
      // Include shipping configuration fields
      shippingWeight: formData.shippingWeight || undefined,
      shippingLength: formData.shippingLength || undefined,
      shippingWidth: formData.shippingWidth || undefined,
      shippingHeight: formData.shippingHeight || undefined,
      shippingClass: formData.shippingClass || undefined,
      requiresSpecialHandling: formData.requiresSpecialHandling,
      domesticOnly: formData.domesticOnly,
      individualShippingRate: formData.individualShippingRate,
      fragile: formData.fragile,
      requiresSignature: formData.requiresSignature,
    };

    // Remove empty string values and convert to null/undefined
    Object.keys(updateData).forEach(key => {
      const value = updateData[key as keyof typeof updateData];
      if (value === '') {
        delete updateData[key as keyof typeof updateData];
      }
    });

    updateProductMutation.mutate(updateData);
  };

  if (productLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (productError) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  Failed to load product. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Update product information</p>
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
                        {categories.map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <Label htmlFor="sponsors">Sponsors & Partners</Label>
                    <Input
                      id="sponsors"
                      value={formData.sponsors}
                      onChange={(e) => handleInputChange('sponsors', e.target.value)}
                      placeholder="De Beers, Gemological Institute, Swiss Gold Refiners"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter sponsor names separated by commas</p>
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

              {/* Shipping Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Shipping Weight */}
                  <div>
                    <Label htmlFor="shippingWeight">Shipping Weight (grams)</Label>
                    <Input
                      id="shippingWeight"
                      type="number"
                      value={formData.shippingWeight}
                      onChange={(e) => handleInputChange('shippingWeight', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Weight used for shipping calculations (may differ from product weight due to packaging)</p>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <Label>Package Dimensions (cm)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <Input
                          type="number"
                          value={formData.shippingLength}
                          onChange={(e) => handleInputChange('shippingLength', parseFloat(e.target.value) || 0)}
                          placeholder="Length"
                          min="0"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={formData.shippingWidth}
                          onChange={(e) => handleInputChange('shippingWidth', parseFloat(e.target.value) || 0)}
                          placeholder="Width"
                          min="0"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={formData.shippingHeight}
                          onChange={(e) => handleInputChange('shippingHeight', parseFloat(e.target.value) || 0)}
                          placeholder="Height"
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Package dimensions for accurate shipping calculations</p>
                  </div>

                  {/* Shipping Class */}
                  <div>
                    <Label htmlFor="shippingClass">Shipping Class</Label>
                    <Select value={formData.shippingClass} onValueChange={(value) => handleInputChange('shippingClass', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="expedited">Expedited</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                        <SelectItem value="heavy">Heavy Items</SelectItem>
                        <SelectItem value="fragile">Fragile Items</SelectItem>
                        <SelectItem value="jewelry">Jewelry (Secure)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Shipping class affects available shipping methods and rates</p>
                  </div>

                  {/* Individual Shipping Rate Override */}
                  <div>
                    <Label htmlFor="individualShippingRate">Individual Shipping Rate (₹)</Label>
                    <Input
                      id="individualShippingRate"
                      type="number"
                      value={formData.individualShippingRate || ''}
                      onChange={(e) => handleInputChange('individualShippingRate', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Leave empty to use standard rates"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Override default shipping calculation with fixed rate for this product</p>
                  </div>

                  {/* Special Handling Options */}
                  <div className="space-y-3">
                    <Label>Special Handling</Label>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="fragile" className="font-normal">Fragile Item</Label>
                        <p className="text-xs text-gray-500">Requires careful handling and special packaging</p>
                      </div>
                      <Switch
                        id="fragile"
                        checked={formData.fragile}
                        onCheckedChange={(checked) => handleInputChange('fragile', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requiresSignature" className="font-normal">Requires Signature</Label>
                        <p className="text-xs text-gray-500">Delivery requires recipient signature</p>
                      </div>
                      <Switch
                        id="requiresSignature"
                        checked={formData.requiresSignature}
                        onCheckedChange={(checked) => handleInputChange('requiresSignature', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requiresSpecialHandling" className="font-normal">Special Handling Required</Label>
                        <p className="text-xs text-gray-500">Requires additional handling fees and processing time</p>
                      </div>
                      <Switch
                        id="requiresSpecialHandling"
                        checked={formData.requiresSpecialHandling}
                        onCheckedChange={(checked) => handleInputChange('requiresSpecialHandling', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="domesticOnly" className="font-normal">Domestic Shipping Only</Label>
                        <p className="text-xs text-gray-500">Restrict shipping to domestic addresses only</p>
                      </div>
                      <Switch
                        id="domesticOnly"
                        checked={formData.domesticOnly}
                        onCheckedChange={(checked) => handleInputChange('domesticOnly', checked)}
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
                      onValueChange={(value) => handleInputChange('status', value as 'DRAFT' | 'ACTIVE' | 'ARCHIVED')}
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
                    <p className="text-xs text-gray-500 mt-1">Products must be Active to appear in the store</p>
                  </div>

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
                      disabled={updateProductMutation.isPending}
                    >
                      {updateProductMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Product
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