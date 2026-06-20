import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export interface ProductType {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  colors?: string[];
  isOutOfStock?: boolean;
}

interface ProductCardProps {
  product: ProductType;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div 
      className={cn("group relative flex flex-col gap-3", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <Link to={`/product/${product.id}`} className="absolute inset-0 z-10">
          <span className="sr-only">View {product.name}</span>
        </Link>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-blue-600 hover:bg-blue-600/90 text-white border-none rounded-sm px-2 py-0.5 text-[10px]">NEW</Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive" className="border-none rounded-sm px-2 py-0.5 text-[10px]">-{discount}%</Badge>
          )}
        </div>

        {/* Quick Actions (Hover) */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex p-4 transition-transform duration-300 ease-in-out",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}>
          {!product.isOutOfStock ? (
            <Button className="w-full bg-white text-black hover:bg-gray-100 shadow-md dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
              <ShoppingCart className="mr-2 h-4 w-4" /> Quick Add
            </Button>
          ) : (
            <Button disabled variant="secondary" className="w-full bg-white/80 text-black backdrop-blur-sm dark:bg-slate-800/80 dark:text-white">
              Out of Stock
            </Button>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 backdrop-blur-sm transition-all hover:bg-white hover:text-red-500 hover:scale-110 shadow-sm dark:bg-slate-800/80 dark:text-gray-300 dark:hover:bg-slate-800"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star}
                className={cn("h-3 w-3", star <= Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600")}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <span>({product.reviews})</span>
        </div>
        
        <Link to={`/product/${product.id}`} className="font-medium hover:underline line-clamp-1">
          {product.name}
        </Link>
        
        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-0.5">
            {product.colors.map((color, idx) => (
              <div 
                key={idx} 
                className="h-3 w-3 rounded-full border border-gray-200 dark:border-gray-700" 
                style={{ backgroundColor: color }} 
                title={color}
              />
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-base">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
