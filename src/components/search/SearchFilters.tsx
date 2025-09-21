"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  filters: {
    q: string;
    category: string;
    brand: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    page: number;
    inStock: boolean;
    featured: boolean;
  };
  availableFilters?: {
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
    }>;
    brands: Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
    }>;
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
  };
  onFilterChange: (filters: Partial<SearchFiltersProps['filters']>) => void;
}

export function SearchFilters({ filters, availableFilters, onFilterChange }: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    parseInt(filters.minPrice) || availableFilters?.priceRange.min || 0,
    parseInt(filters.maxPrice) || availableFilters?.priceRange.max || 10000
  ]);

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.inStock || filters.featured;

  const clearAllFilters = () => {
    onFilterChange({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      featured: false
    });
    setPriceRange([availableFilters?.priceRange.min || 0, availableFilters?.priceRange.max || 10000]);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFilterChange({
      minPrice: values[0].toString(),
      maxPrice: values[1].toString()
    });
  };

  if (!availableFilters) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs h-auto p-1"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Quick Filters */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Quick Filters</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.inStock}
                onCheckedChange={(checked) => onFilterChange({ inStock: !!checked })}
              />
              <span className="text-sm">In Stock Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.featured}
                onCheckedChange={(checked) => onFilterChange({ featured: !!checked })}
              />
              <span className="text-sm">Featured Products</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        {availableFilters.categories.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-sm">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFilters.categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.category === category.slug}
                      onCheckedChange={(checked) => 
                        onFilterChange({ category: checked ? category.slug : '' })
                      }
                    />
                    <span className="text-sm group-hover:text-foreground">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
        )}

        {availableFilters.categories.length > 0 && availableFilters.brands.length > 0 && <Separator />}

        {/* Brands */}
        {availableFilters.brands.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-sm">Brands</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFilters.brands.map((brand) => (
                <label key={brand.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.brand === brand.slug}
                      onCheckedChange={(checked) => 
                        onFilterChange({ brand: checked ? brand.slug : '' })
                      }
                    />
                    <span className="text-sm group-hover:text-foreground">{brand.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {brand.count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3 text-sm">Price Range</h4>
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={availableFilters.priceRange.max || 50000}
                min={availableFilters.priceRange.min || 0}
                step={100}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const newRange = [value, priceRange[1]];
                  setPriceRange(newRange);
                  handlePriceRangeChange(newRange);
                }}
                className="h-8"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || availableFilters.priceRange.max;
                  const newRange = [priceRange[0], value];
                  setPriceRange(newRange);
                  handlePriceRangeChange(newRange);
                }}
                className="h-8"
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-3 text-sm">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {availableFilters.categories.find(c => c.slug === filters.category)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange({ category: '' })}
                    />
                  </Badge>
                )}
                {filters.brand && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Brand: {availableFilters.brands.find(b => b.slug === filters.brand)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange({ brand: '' })}
                    />
                  </Badge>
                )}
                {filters.inStock && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    In Stock
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange({ inStock: false })}
                    />
                  </Badge>
                )}
                {filters.featured && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Featured
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => onFilterChange({ featured: false })}
                    />
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ₹{filters.minPrice || 0} - ₹{filters.maxPrice || 'Max'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        onFilterChange({ minPrice: '', maxPrice: '' });
                        setPriceRange([availableFilters.priceRange.min || 0, availableFilters.priceRange.max || 10000]);
                      }}
                    />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}