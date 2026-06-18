import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Heart, Truck, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProductCard } from '../components/shared/ProductCard';

export function ProductDetail() {
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState('#202a36');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');

  // Placeholder data based on Page 3 PDF
  const product = {
    id: id || '1',
    name: 'Aura Performance Hybrid Jacket',
    price: 249.00,
    originalPrice: 299.00,
    rating: 4.8,
    reviews: 124,
    description: "The Aura Hybrid jacket is engineered for the modern explorer. Featuring sustainable recycled fabrics and high-performance weatherproofing, it seamlessly transitions from urban commutes to mountain trails.",
    colors: [
      { name: 'Midnight Black', hex: '#202a36' },
      { name: 'Forest Green', hex: '#4b5320' },
      { name: 'Slate Gray', hex: '#708090' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    features: [
      "Windproof shell", "4-way stretch fabric", "Moisture-wicking lining",
      "Hidden security pockets", "Recycled insulation", "Adjustable hood"
    ]
  };

  const completeTheLook = [
    {
      id: 'c1', name: 'Ventus Training Tee', price: 55, category: 'Apparel', rating: 4.5, reviews: 30, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500&auto=format&fit=crop'
    },
    {
      id: 'c2', name: 'Apex Tech Joggers', price: 110, category: 'Apparel', rating: 4.7, reviews: 45, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500&auto=format&fit=crop'
    },
    {
      id: 'c3', name: 'Lumina Reflective Cap', price: 35, category: 'Accessories', rating: 4.6, reviews: 15, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=500&auto=format&fit=crop'
    },
    {
      id: 'c4', name: 'Terra Grip Boots', price: 185, category: 'Footwear', rating: 4.9, reviews: 62, image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=500&auto=format&fit=crop'
    }
  ];

  return (
    <PageTransition>
      <div className="container px-4 py-8 max-w-screen-xl mx-auto">
        <div className="text-sm text-muted-foreground mb-6">
          Home &gt; Outerwear &gt; Jackets &gt; <span className="text-foreground">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Gallery */}
          <div className="w-full lg:w-3/5 flex gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:flex flex-col gap-4 w-20">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={cn("aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all", i === 1 ? "border-primary" : "border-transparent hover:border-muted-foreground")}>
                  <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop" alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 aspect-[3/4] sm:aspect-[4/5] rounded-xl overflow-hidden bg-muted">
              <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop" alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="text-green-600 font-medium">In Stock</span>
              <span className="text-muted-foreground flex items-center">
                <Heart className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through mb-1">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-muted-foreground mb-8">
              {product.description}
            </p>

            {/* Colors */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">COLOR: <span className="text-muted-foreground">{product.colors.find(c => c.hex === selectedColor)?.name}</span></span>
              </div>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color.hex)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 ring-offset-2 transition-all",
                      selectedColor === color.hex ? "border-primary ring-2 ring-primary" : "border-transparent hover:scale-110"
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">SIZE</span>
                <button className="text-sm text-primary hover:underline">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "h-10 rounded-md border transition-all text-sm font-medium",
                      selectedSize === size ? "bg-blue-600 border-blue-600 text-white" : "bg-transparent border-input hover:border-gray-400"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border rounded-md h-12 w-32 shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-muted text-muted-foreground">-</button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-muted text-muted-foreground">+</button>
              </div>
              <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold">
                Add to Cart
              </Button>
            </div>

            <div className="flex gap-4 mb-8">
              <Button variant="outline" className="flex-1 h-12">
                <Heart className="mr-2 h-4 w-4" /> Wishlist
              </Button>
              <Button variant="outline" className="flex-1 h-12">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                Compare
              </Button>
            </div>

            {/* Guarantees */}
            <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <div><span className="font-medium">Free Delivery</span> on orders over $150</div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                <div><span className="font-medium">Easy Returns</span> within 30 days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mt-20">
          <div className="flex border-b mb-8 overflow-x-auto">
            {['Description', 'Specifications', 'Reviews (124)'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-8 py-4 font-medium text-sm transition-colors whitespace-nowrap",
                  activeTab === tab ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Uncompromising Performance</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Designed for movement, the Aura Jacket utilizes our proprietary BreathTech™ weave—a double-layered fabric that blocks wind and water while allowing core heat to escape. Whether you're navigating the morning frost or an evening mist, stay dry and regulated.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
              {product.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-16" />

        {/* Complete the Look */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold">Complete the Look</h2>
            <button className="text-sm font-medium flex items-center hover:text-primary transition-colors">
              Explore More <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {completeTheLook.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
