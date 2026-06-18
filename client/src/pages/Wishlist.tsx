import { PageTransition } from '../components/layout/PageTransition';
import { ProductCard } from '../components/shared/ProductCard';
import type { ProductType } from '../components/shared/ProductCard';
import { Button } from '../components/ui/button';
import { Heart, ShoppingBag } from 'lucide-react';

const WISHLIST_ITEMS: ProductType[] = [
  {
    id: '1',
    name: 'Aura Performance Hybrid Jacket',
    price: 249,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
    category: 'Outerwear',
    rating: 4.8,
    reviews: 124,
    colors: ['#202a36', '#4b5320', '#708090'],
  },
  {
    id: '2',
    name: 'Architectural Leather Tote Bag',
    price: 450,
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
    category: 'Accessories',
    rating: 4.9,
    reviews: 86,
    colors: ['#000000', '#8b4513'],
  },
  {
    id: '3',
    name: 'Carbon Fiber Hybrid Watch',
    price: 890,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
    category: 'Accessories',
    rating: 4.9,
    reviews: 12,
    colors: ['#171717'],
  },
  {
    id: '4',
    name: 'Minimalist Wool Overcoat',
    price: 320,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=600&auto=format&fit=crop',
    category: 'Apparel',
    rating: 4.7,
    reviews: 33,
    colors: ['#8e8e93', '#202a36'],
  },
];

export function Wishlist() {
  return (
    <PageTransition>
      <div className="container px-4 py-10 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-7 w-7 text-pink-500 fill-pink-100" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">{WISHLIST_ITEMS.length} items saved for later</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Share Wishlist</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShoppingBag className="mr-2 h-4 w-4" /> Add All to Cart
            </Button>
          </div>
        </div>

        {WISHLIST_ITEMS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {WISHLIST_ITEMS.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                {/* Move to Cart overlay button */}
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Move to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-24 w-24 rounded-full bg-pink-50 flex items-center justify-center mb-6 shadow-inner">
              <Heart className="h-10 w-10 text-pink-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
            <p className="text-muted-foreground max-w-sm mb-8">
              Start adding items you love by clicking the heart icon on any product. We'll save them here for you.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/collections">Start Exploring</a>
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
