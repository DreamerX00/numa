"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/SearchBar';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchFilters } from '@/components/search/SearchFilters';
import { Filter, Grid3X3, List, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product } from '@prisma/client';
import HeartLoader from "@/components/ui/HeartLoader";

interface SearchResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
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
  searchMeta: {
    query?: string;
    resultsCount: number;
    processingTime: string;
  };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
    page: parseInt(searchParams.get('page') || '1'),
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true'
  });

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false && value !== 0) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/search?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSearchResults();
  }, [filters, fetchSearchResults]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = async (page: number) => {
    setPaginationLoading(true);
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Pagination loading will be reset when fetchSearchResults completes
    setTimeout(() => setPaginationLoading(false), 1000);
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
    { value: 'rating', label: 'Rating' },
    { value: 'newest', label: 'Newest' }
  ];

  // const activeSortLabel = sortOptions.find(opt => opt.value === filters.sortBy)?.label;

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        {/* Search Header */}
        <div className="mb-8">
          <SearchBar
            placeholder="Search jewelry, categories..."
            className="max-w-2xl mx-auto"
            onSearch={(query) => handleFilterChange({ q: query })}
          />
          
          {searchResults?.searchMeta && (
            <div className="mt-4 text-center text-muted-foreground">
              {searchResults.searchMeta.query && (
                <p>
                  Showing {searchResults.searchMeta.resultsCount} results for{' '}
                  <span className="font-medium text-foreground">
                    &quot;{searchResults.searchMeta.query}&quot;
                  </span>
                  {' '}in {searchResults.searchMeta.processingTime}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={cn(
            "lg:block",
            showFilters ? "block" : "hidden"
          )}>
            <div className="sticky top-8">
              <SearchFilters
                filters={filters}
                availableFilters={searchResults?.filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                {searchResults?.pagination && (
                  <span className="text-sm text-muted-foreground">
                    {searchResults.pagination.total} products
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                    className="text-sm border rounded px-2 py-1 bg-background"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex border rounded">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="space-y-6">
                <div className="flex justify-center py-8">
                  <div className="text-center space-y-4">
                    <HeartLoader size="lg" />
                    <p className="text-muted-foreground">Searching products...</p>
                  </div>
                </div>
                
                {/* Skeleton Grid */}
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <HeartLoader size="sm" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-6 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchResults?.products.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => handleFilterChange({ 
                    q: '', 
                    category: '', 
                    brand: '', 
                    minPrice: '', 
                    maxPrice: '' 
                  })}
                >
                  Clear filters
                </Button>
              </Card>
            ) : (
              <>
                {/* Products Grid */}
                <div className={cn(
                  "grid gap-6 mb-8",
                  viewMode === 'grid' 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {searchResults?.products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ProductCard 
                        product={product} 
                        variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults?.pagination && searchResults.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {paginationLoading ? (
                      <div className="flex items-center space-x-2 py-2">
                        <HeartLoader size="sm" />
                        <span className="text-sm text-muted-foreground">Loading page...</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          disabled={!searchResults.pagination.hasPrev}
                          onClick={() => handlePageChange(searchResults.pagination.page - 1)}
                        >
                          Previous
                        </Button>
                        
                        {Array.from({ length: searchResults.pagination.totalPages }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={searchResults.pagination.page === i + 1 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          disabled={!searchResults.pagination.hasNext}
                          onClick={() => handlePageChange(searchResults.pagination.page + 1)}
                        >
                          Next
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <HeartLoader size="lg" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}