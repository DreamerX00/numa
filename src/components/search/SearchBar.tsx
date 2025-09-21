"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Clock, TrendingUp, Package, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  suggestions: string[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
    productCount: number;
  }>;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
    price: number;
  }>;
  tags: string[];
  trending: string[];
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

function SearchBarContent({ 
  placeholder = "Search products, categories...", 
  className,
  autoFocus = false,
  onSearch 
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches and trending searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('numa-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }

    // Load trending searches when component mounts
    const loadTrendingSearches = async () => {
      try {
        const response = await fetch('/api/search/suggestions?q=&limit=8');
        if (response.ok) {
          const data = await response.json();
          setTrendingSearches(data.trending || []);
        }
      } catch (error) {
        console.error('Failed to load trending searches:', error);
      }
    };

    loadTrendingSearches();
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions(null);
      setLoading(false);
    }
  }, [debouncedQuery, fetchSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('numa-recent-searches', JSON.stringify(newRecentSearches));

    // Close dropdown
    setIsOpen(false);
    inputRef.current?.blur();

    // Navigate to search results or call callback
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [recentSearches, onSearch, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= 2) {
      setIsOpen(true);
      setLoading(true);
    } else {
      setIsOpen(false);
      setSuggestions(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('numa-recent-searches');
  };

  return (
    <div className={cn("relative w-full max-w-lg", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full h-11 pl-10 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200"
        />
        {query && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 h-6 w-6 p-0 -translate-y-1/2 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {/* Search Button for Mobile */}
        {!query && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => inputRef.current?.focus()}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-1"
          >
            <Card className="border border-border shadow-lg bg-card">
              <div className="max-h-96 overflow-y-auto">
                
                {/* Loading State */}
                {loading && (
                  <div className="p-4 text-center text-muted-foreground">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                      <span>Searching...</span>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions && !loading && (
                  <div className="py-2">
                    
                    {/* Text Suggestions */}
                    {suggestions.suggestions.length > 0 && (
                      <div className="px-4 py-2">
                        <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Suggestions
                        </h3>
                        {suggestions.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(suggestion)}
                            className="block w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category Suggestions */}
                    {suggestions.categories.length > 0 && (
                      <>
                        <Separator />
                        <div className="px-4 py-2">
                          <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            Categories
                          </h3>
                          {suggestions.categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => router.push(`/collection/${category.slug}`)}
                              className="flex items-center space-x-2 w-full text-left px-2 py-2 text-sm hover:bg-muted rounded transition-colors"
                            >
                              <span className="flex-1">{category.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {category.productCount}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Product Suggestions */}
                    {suggestions.products.length > 0 && (
                      <>
                        <Separator />
                        <div className="px-4 py-2">
                          <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            Products
                          </h3>
                          {suggestions.products.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => router.push(`/product/${product.slug}`)}
                              className="flex items-center space-x-3 w-full text-left px-2 py-2 hover:bg-muted rounded transition-colors"
                            >
                              {product.image && (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">₹{product.price.toFixed(2)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Recent Searches */}
                {!suggestions && !loading && recentSearches.length > 0 && (
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-medium text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Recent Searches
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearRecentSearches}
                        className="text-xs h-auto p-1"
                      >
                        Clear
                      </Button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="block w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                {/* Trending Searches */}
                {!suggestions && !loading && (!recentSearches.length || trendingSearches.length > 0) && (
                  <div className="px-4 py-2">
                    {recentSearches.length > 0 && <Separator className="mb-2" />}
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending Searches
                    </h3>
                    <div className="grid grid-cols-2 gap-1">
                      {trendingSearches.slice(0, 8).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors truncate"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {suggestions && !loading && 
                 suggestions.suggestions.length === 0 && 
                 suggestions.categories.length === 0 && 
                 suggestions.products.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No suggestions found for &ldquo;{query}&rdquo;</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSearch(query)}
                      className="mt-2"
                    >
                      Search anyway
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className={cn(
        "relative w-full max-w-md bg-background border rounded-lg px-4 py-3",
        props.className
      )}>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Search className="h-5 w-5" />
          <span className="text-sm">Search...</span>
        </div>
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  );
}