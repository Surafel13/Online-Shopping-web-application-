import { Link } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Heart, Trash2, ArrowLeft, ShieldCheck, RotateCcw, Truck, ArrowRight } from 'lucide-react';

const CART_ITEMS = [
  {
    id: '1',
    name: 'Aether Performance Tee',
    variant: 'Midnight Blue / Large',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop',
    quantity: 1
  },
  {
    id: '2',
    name: 'Precision Chronograph Watch',
    variant: 'Brushed Steel',
    price: 249.00,
    originalPrice: 299.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop',
    quantity: 1,
    isSale: true
  },
  {
    id: '3',
    name: 'Vanguard Leather Weekender',
    variant: 'Cognac',
    price: 185.00,
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=200&auto=format&fit=crop',
    quantity: 1
  }
];

export function Cart() {
  return (
    <PageTransition>
      <div className="container px-4 py-8 max-w-screen-xl mx-auto">
        <Link to="/collections" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex justify-between items-end mb-6 border-b pb-4">
              <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
              <span className="text-muted-foreground">(3 items)</span>
            </div>

            <div className="flex flex-col gap-6">
              {CART_ITEMS.map((item) => (
                <div key={item.id} className="flex gap-6 py-2">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
                    {item.isSale && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">Sale</span>}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-base sm:text-lg">${item.price.toFixed(2)}</div>
                        {item.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border rounded-md h-9 w-28 shrink-0">
                        <button className="px-3 py-1 hover:bg-muted text-muted-foreground">-</button>
                        <span className="flex-1 text-center font-medium text-sm">{item.quantity}</span>
                        <button className="px-3 py-1 hover:bg-muted text-muted-foreground">+</button>
                      </div>
                      
                      <div className="flex gap-4">
                        <button className="text-sm text-muted-foreground flex items-center hover:text-foreground">
                          <Heart className="mr-1.5 h-4 w-4" /> <span className="hidden sm:inline">Save</span>
                        </button>
                        <button className="text-sm text-muted-foreground flex items-center hover:text-red-500">
                          <Trash2 className="mr-1.5 h-4 w-4" /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-10" />

            {/* Saved for Later */}
            <div>
              <h2 className="text-xl font-bold mb-6">Saved for later</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 border rounded-lg p-3 min-w-[280px]">
                    <img src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=100&auto=format&fit=crop" className="w-16 h-16 rounded-md object-cover bg-muted" alt="" />
                    <div className="flex flex-col justify-center">
                      <h4 className="text-sm font-medium line-clamp-1">Minimalist Wool Overcoat</h4>
                      <span className="text-sm text-muted-foreground mb-2">$320.00</span>
                      <button className="text-xs text-primary hover:underline self-start">Move to Cart</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="border rounded-xl p-6 bg-card sticky top-24 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">$499.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Shipping</span>
                  <span className="font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span className="font-medium">$39.92</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-end mb-6">
                <span className="font-semibold">Estimated Total</span>
                <span className="text-2xl font-bold text-blue-600">$538.92</span>
              </div>
              
              <div className="mb-6">
                <button className="flex justify-between items-center w-full text-sm font-medium py-2 text-left hover:text-primary">
                  <span>Apply Promo Code</span>
                  <span>+</span>
                </button>
              </div>
              
              <Link to="/checkout" className="w-full block">
                <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700">
                  Checkout Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure 256-bit SSL encrypted payment</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 p-4 border rounded-xl bg-muted/20">
              <div className="flex gap-3">
                <Truck className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium">Free Shipping</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">On all orders over $150.00</p>
                </div>
              </div>
              <div className="flex gap-3">
                <RotateCcw className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium">Easy Returns</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">30-day no-hassle return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
