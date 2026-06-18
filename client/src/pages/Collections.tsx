import { useState } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { ProductCard } from '../components/shared/ProductCard';
import type { ProductType } from '../components/shared/ProductCard';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { AnimatedSection } from '../components/shared/AnimatedSection';

// Mock data based on PDF page 2
const MOCK_PRODUCTS: ProductType[] = [
  {
    id: '1',
    name: 'Premium Essential Cashmere',
    price: 189,
    originalPrice: 245,
    image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1000&auto=format&fit=crop',
    category: 'Apparel',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    colors: ['#202a36', '#8e8e93', '#e5e5ea']
  },
  {
    id: '2',
    name: 'Architectural Leather Tote Bag',
    price: 450,
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop',
    category: 'Accessories',
    rating: 4.9,
    reviews: 86,
    colors: ['#000000', '#8b4513']
  },
  {
    id: '3',
    name: 'Minimalist Ceramic Desk Lamp',
    price: 120,
    originalPrice: 150,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
    category: 'Home',
    rating: 4.7,
    reviews: 42,
    colors: ['#ffffff', '#000000']
  },
  {
    id: '4',
    name: 'Performance Merino Tee',
    price: 75,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
    category: 'Apparel',
    rating: 4.6,
    reviews: 215,
    isNew: true,
    colors: ['#1e3a8a', '#dc2626', '#171717']
  },
  {
    id: '5',
    name: 'Carbon Fiber Hybrid Watch',
    price: 890,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    category: 'Accessories',
    rating: 4.9,
    reviews: 12,
    colors: ['#171717']
  },
  {
    id: '6',
    name: 'Organic Cotton Relaxed Chinos',
    price: 95,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop',
    category: 'Apparel',
    rating: 4.5,
    reviews: 98,
    colors: ['#d4d4d8', '#78716c', '#171717']
  }
];

export function Collections() {
  const [products] = useState<ProductType[]>(MOCK_PRODUCTS);

  return (
    <PageTransition>
      <div className="container px-4 py-8 max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Collections</h1>
          <p className="text-muted-foreground">
            Curated selection of premium essentials designed for longevity and performance.
            Showing {products.length} exquisite results.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button className="text-sm text-primary hover:underline">Clear All</button>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Category</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <input type="checkbox" id="cat-all" className="rounded border-gray-300" />
                  <label htmlFor="cat-all">All Products</label>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" id="cat-apparel" className="rounded border-gray-300" />
                  <label htmlFor="cat-apparel">Apparel</label>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" id="cat-accessories" className="rounded border-gray-300" />
                  <label htmlFor="cat-accessories">Accessories</label>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" id="cat-home" className="rounded border-gray-300" />
                  <label htmlFor="cat-home">Home</label>
                </li>
                <li className="flex items-center gap-2">
                  <input type="checkbox" id="cat-electronics" className="rounded border-gray-300" />
                  <label htmlFor="cat-electronics">Electronics</label>
                </li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Min" className="w-full border rounded-md px-2 py-1 text-sm" />
                <span>-</span>
                <input type="text" placeholder="Max" className="w-full border rounded-md px-2 py-1 text-sm" />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Color</h4>
              <div className="flex flex-wrap gap-2">
                {['#000000', '#ffffff', '#1e3a8a', '#dc2626', '#f59e0b', '#10b981', '#a855f7'].map((c) => (
                  <button 
                    key={c} 
                    className="h-6 w-6 rounded-full border border-gray-300 ring-offset-2 hover:ring-2 ring-primary transition-all"
                    style={{ backgroundColor: c }}
                    aria-label={`Filter by color ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Sustainable Choice Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-8">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">Sustainable Choice</h4>
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-4">Discover our eco-friendly collection made from 100% recycled materials.</p>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Learn More</Button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-end mb-6">
              <select className="border rounded-md px-3 py-1.5 text-sm bg-background">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>

            <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-10">
              {products.map((product) => (
                <div key={product.id} className="anim-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </AnimatedSection>

            <div className="mt-16 flex flex-col items-center justify-center space-y-4">
              <div className="flex space-x-1">
                <Button variant="outline" size="icon" className="h-8 w-8">&lt;</Button>
                <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600">1</Button>
                <Button variant="outline" size="icon" className="h-8 w-8">2</Button>
                <Button variant="outline" size="icon" className="h-8 w-8">3</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 border-none shadow-none text-muted-foreground bg-transparent hover:bg-transparent cursor-default">...</Button>
                <Button variant="outline" size="icon" className="h-8 w-8">12</Button>
                <Button variant="outline" size="icon" className="h-8 w-8">&gt;</Button>
              </div>
              <p className="text-xs text-muted-foreground">Showing 1-6 of 144 products</p>
              <Button variant="outline" className="mt-4">Load More Products</Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
