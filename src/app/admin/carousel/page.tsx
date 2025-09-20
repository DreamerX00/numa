"use client";

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import Image from 'next/image';

interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  overlay?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SlideFormData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  overlay: string;
  order: number;
  isActive: boolean;
}

const initialFormData: SlideFormData = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  ctaText: '',
  ctaLink: '',
  overlay: 'bg-gradient-to-r from-black/70 to-black/20',
  order: 0,
  isActive: true
};

const overlayOptions = [
  { value: 'bg-gradient-to-r from-black/70 to-black/20', label: 'Dark Gradient' },
  { value: 'bg-gradient-to-r from-white/70 to-white/20', label: 'Light Gradient' },
  { value: 'bg-gradient-to-r from-brand/80 to-brand/20', label: 'Brand Gradient' },
  { value: 'bg-gradient-to-r from-gray-900/80 to-gray-900/20', label: 'Gray Gradient' },
  { value: 'bg-gradient-to-r from-purple-900/80 to-purple-900/20', label: 'Purple Gradient' },
  { value: 'bg-gradient-to-r from-rose-900/80 to-rose-900/20', label: 'Rose Gradient' },
];

async function fetchCarouselSlides(): Promise<CarouselSlide[]> {
  const response = await fetch('/api/admin/carousel');
  if (!response.ok) {
    throw new Error('Failed to fetch carousel slides');
  }
  return response.json();
}

async function createSlide(data: SlideFormData): Promise<CarouselSlide> {
  const response = await fetch('/api/admin/carousel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to create slide');
  }
  return response.json();
}

async function updateSlide(id: string, data: SlideFormData): Promise<CarouselSlide> {
  const response = await fetch(`/api/admin/carousel/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to update slide');
  }
  return response.json();
}

async function deleteSlide(id: string): Promise<void> {
  const response = await fetch(`/api/admin/carousel/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete slide');
  }
}

export default function AdminCarouselPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>(initialFormData);
  const [uploadError, setUploadError] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: slides = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'carousel'],
    queryFn: fetchCarouselSlides
  });

  const createMutation = useMutation({
    mutationFn: createSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'carousel'] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SlideFormData }) => 
      updateSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'carousel'] });
      setIsDialogOpen(false);
      setEditingSlide(null);
      setFormData(initialFormData);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'carousel'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      image: slide.image,
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      overlay: slide.overlay || overlayOptions[0].value,
      order: slide.order,
      isActive: slide.isActive
    });
    setUploadError('');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this carousel slide?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewSlide = () => {
    setEditingSlide(null);
    setFormData(initialFormData);
    setUploadError('');
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center text-red-600">
            Failed to load carousel slides
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Carousel Management</h1>
            <p className="text-muted-foreground">
              Manage homepage carousel slides
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewSlide}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Carousel Image *</Label>
                  <ImageUpload
                    currentImage={formData.image}
                    onUpload={(imageUrl) => {
                      setFormData(prev => ({ ...prev, image: imageUrl }));
                      setUploadError('');
                    }}
                    onError={(error) => setUploadError(error)}
                    folder="carousel"
                    maxSize={10}
                  />
                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Button Text</Label>
                    <Input
                      id="ctaText"
                      value={formData.ctaText}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Shop Now"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">Button Link</Label>
                    <Input
                      id="ctaLink"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                      placeholder="/collections/featured"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overlay">Overlay Style</Label>
                    <select
                      id="overlay"
                      value={formData.overlay}
                      onChange={(e) => setFormData(prev => ({ ...prev, overlay: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {overlayOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingSlide ? 'Update' : 'Create'} Slide
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Slides Grid */}
        <div className="grid gap-6">
          {slides.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No carousel slides</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by adding your first carousel slide
                </p>
                <Button onClick={handleNewSlide}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Slide
                </Button>
              </CardContent>
            </Card>
          ) : (
            slides.map((slide) => (
              <Card key={slide.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {slide.title}
                        <Badge variant={slide.isActive ? "default" : "secondary"}>
                          {slide.isActive ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline">Order: {slide.order}</Badge>
                      </CardTitle>
                      {slide.subtitle && (
                        <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(slide)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(slide.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="aspect-[2.8/1] relative rounded-lg overflow-hidden">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                        />
                        <div className={`absolute inset-0 ${slide.overlay}`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {slide.description && (
                        <p className="text-sm text-muted-foreground">{slide.description}</p>
                      )}
                      {slide.ctaText && slide.ctaLink && (
                        <div className="text-sm">
                          <strong>Button:</strong> {slide.ctaText} → {slide.ctaLink}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(slide.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}