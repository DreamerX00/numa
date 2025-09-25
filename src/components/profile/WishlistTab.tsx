import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Search, Grid, List, ShoppingCart, Trash2, Star } from "lucide-react";
import HeartLoader from "@/components/ui/HeartLoader";
import { DEFAULT_IMAGES } from "@/lib/cloudinary";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: string[];
    averageRating?: number;
    reviewCount: number;
    inStock: boolean;
  };
  createdAt: string;
}

interface WishlistTabProps {
  wishlistItems: WishlistItem[];
  isLoading?: boolean;
  onRemoveItem?: (itemId: string) => void;
  onAddToCart?: (productId: string) => void;
}

export function WishlistTab({ 
  wishlistItems = [], 
  isLoading = false,
  onRemoveItem,
  onAddToCart 
}: WishlistTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  const filteredItems = wishlistItems.filter(item =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.product.price - b.product.price;
      case "price-high":
        return b.product.price - a.product.price;
      case "name":
        return a.product.name.localeCompare(b.product.name);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <HeartLoader size="md" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </CardContent>
      </Card>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Heart className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6">
            Save items you love for later and never lose track of them.
          </p>
          <Button asChild>
            <Link href="/collections">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          
          <div className="flex border border-input rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.product.images[0] || DEFAULT_IMAGES.PRODUCT}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!item.product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => onRemoveItem?.(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-brand transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-1 mb-2">
                  {item.product.averageRating && (
                    <>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(item.product.averageRating!)
                                ? 'text-yellow-400 fill-current'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({item.product.reviewCount})
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">₹{item.product.price}</span>
                    {item.product.comparePrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.product.comparePrice}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  disabled={!item.product.inStock}
                  onClick={() => onAddToCart?.(item.product.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.product.images[0] || DEFAULT_IMAGES.PRODUCT}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                    {!item.product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/product/${item.product.slug}`}>
                          <h3 className="font-semibold text-base mb-1 hover:text-brand transition-colors line-clamp-2">
                            {item.product.name}
                          </h3>
                        </Link>
                        
                        {item.product.averageRating && (
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(item.product.averageRating!)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({item.product.reviewCount})
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">₹{item.product.price}</span>
                          {item.product.comparePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{item.product.comparePrice}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          disabled={!item.product.inStock}
                          onClick={() => onAddToCart?.(item.product.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveItem?.(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {filteredItems.length === 0 && searchQuery && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}