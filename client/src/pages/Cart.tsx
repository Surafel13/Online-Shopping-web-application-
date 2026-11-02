import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { ArrowLeft, Trash2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import type { AppDispatch, RootState } from '../redux/store';
import { fetchCart, removeFromCartAsync, updateCartQuantityAsync } from '../redux/slices/cartSlice';
import { productService } from '../services';
import { buildCategoryMap, mapApiProductToProductType } from '../lib/mappers';
import { categoryService } from '../services';
import type { ProductType } from '../components/shared/ProductCard';

export function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.cart);
  const [promoCode, setPromoCode] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    async function loadRecommended() {
      const [products, categories] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      const categoryMap = buildCategoryMap(categories);
      setRecommendedProducts(products.slice(0, 4).map((product) => mapApiProductToProductType(product, categoryMap)));
    }

    loadRecommended();
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    dispatch(updateCartQuantityAsync({ productId: id, quantity: Math.max(1, item.quantity + delta) }));
  };

  const removeItem = (id: string) => {
    dispatch(removeFromCartAsync(id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal > 0 ? subtotal * 0.08 : 0;
  const total = subtotal + tax;

  return (
    <PageTransition>
      <div className="container px-4 py-12 max-w-screen-xl mx-auto">

        {/* Top Navigation */}
        <Link to="/collections" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-10 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
        </Link>

        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">

          {/* ── LEFT COLUMN: CART ITEMS ── */}
          <div className="flex-1 min-w-0">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
                <p className="text-muted-foreground text-sm">Review your items before checkout</p>
              </div>
              <div className="bg-muted px-4 py-1.5 rounded-full text-sm font-medium shrink-0 self-start sm:self-auto">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </div>
            </div>

            {/* Cart Items Container */}
            <div className="border rounded-2xl bg-card p-6 shadow-sm mb-6">
              {isLoading && items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Loading cart...</div>
              ) : (
              <AnimatePresence initial={false}>
                {items.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`flex flex-col sm:flex-row gap-6 ${index !== items.length - 1 ? 'border-b pb-6' : ''}`}
                      >
                        {/* Image */}
                        <div className="w-full sm:w-32 h-32 rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden shrink-0 relative border border-slate-100 dark:border-slate-700">
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                              Sale
                            </span>
                          )}
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply p-1 hover:scale-105 transition-transform duration-500" />
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col sm:flex-row justify-between gap-4">
                          <div className="flex flex-col justify-center">
                            <h3 className="font-bold text-base sm:text-lg mb-1 text-foreground leading-tight">{item.name}</h3>
                          </div>

                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-lg">${item.price.toFixed(2)}</div>
                              {item.originalPrice && (
                                <div className="text-xs text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</div>
                              )}
                            </div>

                            <div className="flex items-center gap-6">
                              {/* Quantity Control */}
                              <div className="flex items-center border rounded-lg h-9 overflow-hidden bg-background">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-9 h-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">-</button>
                                <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-9 h-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">+</button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-2"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                    <Link to="/collections">
                      <Button className="bg-blue-600 hover:bg-blue-700">Continue Shopping</Button>
                    </Link>
                  </div>
                )}
              </AnimatePresence>
              )}
            </div>

            {/* Free Shipping Notice */}
            {items.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pl-2">
                <Truck className="h-4 w-4" /> You've earned free shipping!
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: ORDER SUMMARY ── */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-4 sticky top-24">

            {/* Summary Card */}
            <div className="border rounded-2xl p-6 sm:p-8 bg-card shadow-sm">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Estimated Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Estimated Tax</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <Button variant="secondary" className="h-11 px-6 font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Apply</Button>
              </div>

              <div className="border-t pt-6 mb-8">
                <div className="text-sm text-muted-foreground font-medium mb-1">Total Amount</div>
                <div className="text-3xl font-bold text-foreground">${total.toFixed(2)}</div>
              </div>

              <Link to="/checkout" className="w-full block mb-6">
                <Button className="w-full h-12 sm:h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all rounded-xl">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-4 w-4" /> SECURE PAYMENT
                </div>
                <span className="text-[10px]">Protected by 256-bit SSL encryption</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-card shadow-sm hover:shadow-md transition-shadow cursor-default">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">Fast Delivery</span>
              </div>
              <div className="border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-card shadow-sm hover:shadow-md transition-shadow cursor-default">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">Easy Returns</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── RECOMMENDED SECTION ── */}
        <div className="mt-24 pt-12 border-t">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
            <Link to="/collections" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group block">
                <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 mb-4 h-48 sm:h-64 relative border border-slate-100 dark:border-slate-700">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover p-2 hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold text-sm sm:text-base leading-snug mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                <p className="font-bold text-sm">${product.price}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
