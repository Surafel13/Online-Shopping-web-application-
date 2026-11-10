import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { AlertTriangle, ArrowLeft, Trash2, ShieldCheck, Truck, RotateCcw, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  getMaxQuantity,
  itemQuantitySet,
  itemRemoved,
  selectCartItems,
  selectCartTotals,
  syncCartWithCatalog,
  syncNoticesCleared,
} from '../redux/slices/cartSlice';
import { productService } from '../services';
import { getCategoryMap } from '../lib/catalogCache';
import { mapApiProductToProductType } from '../lib/mappers';
import type { ProductType } from '../components/shared/ProductCard';

export function Cart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const { subtotal, tax, total } = useAppSelector(selectCartTotals);
  const notices = useAppSelector((state) => state.cart.syncNotices);
  const hydrated = useAppSelector((state) => state.cart.hydrated);
  const [promoCode, setPromoCode] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState<ProductType[]>([]);

  // Re-validate prices/stock against the catalog whenever the cart page is opened.
  useEffect(() => {
    if (hydrated) void dispatch(syncCartWithCatalog());
  }, [dispatch, hydrated]);

  useEffect(() => {
    let cancelled = false;
    async function loadRecommended() {
      try {
        const [products, categoryMap] = await Promise.all([productService.getAll(), getCategoryMap()]);
        if (!cancelled) {
          setRecommendedProducts(
            products.slice(0, 4).map((product) => mapApiProductToProductType(product, categoryMap)),
          );
        }
      } catch {
        // Recommendations are optional; the cart still works without them.
      }
    }
    void loadRecommended();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageTransition>
      <div className="container px-4 py-12 max-w-screen-xl mx-auto">
        <Link to="/collections" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-10 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
        </Link>

        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
          {/* LEFT: CART ITEMS */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
                <p className="text-muted-foreground text-sm">Review your items before checkout</p>
              </div>
              <div className="bg-muted px-4 py-1.5 rounded-full text-sm font-medium shrink-0 self-start sm:self-auto">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </div>
            </div>

            {notices.length > 0 && (
              <div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <ul className="flex-1 space-y-1">
                    {notices.map((notice) => (
                      <li key={notice}>{notice}</li>
                    ))}
                  </ul>
                  <button onClick={() => dispatch(syncNoticesCleared())} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="border rounded-2xl bg-card p-6 shadow-sm mb-6">
              <AnimatePresence initial={false}>
                {items.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {items.map((item, index) => {
                      const max = getMaxQuantity(item);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          className={`flex flex-col sm:flex-row gap-6 ${index !== items.length - 1 ? 'border-b pb-6' : ''}`}
                        >
                          <div className="w-full sm:w-32 h-32 rounded-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden shrink-0 relative border border-slate-100 dark:border-slate-700">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply p-1 hover:scale-105 transition-transform duration-500" />
                          </div>

                          <div className="flex flex-1 flex-col sm:flex-row justify-between gap-4">
                            <div className="flex flex-col justify-center">
                              <Link to={`/product/${item.id}`} className="font-bold text-base sm:text-lg mb-1 text-foreground leading-tight hover:text-blue-600 transition-colors">
                                {item.name}
                              </Link>
                              {item.quantity >= max && (
                                <span className="text-xs text-amber-600">Maximum available quantity</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-4">
                              <div className="text-right">
                                <div className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                                {item.quantity > 1 && (
                                  <div className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</div>
                                )}
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="flex items-center border rounded-lg h-9 overflow-hidden bg-background">
                                  <button
                                    onClick={() => dispatch(itemQuantitySet({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}
                                    disabled={item.quantity <= 1}
                                    aria-label="Decrease quantity"
                                    className="w-9 h-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                  >
                                    -
                                  </button>
                                  <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                                  <button
                                    onClick={() => dispatch(itemQuantitySet({ id: item.id, quantity: item.quantity + 1 }))}
                                    disabled={item.quantity >= max}
                                    aria-label="Increase quantity"
                                    className="w-9 h-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => dispatch(itemRemoved(item.id))}
                                  className="text-muted-foreground hover:text-red-500 transition-colors p-2"
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
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
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pl-2">
                <Truck className="h-4 w-4" /> You've earned free shipping!
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-4 sticky top-24">
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

              <Link to={items.length > 0 ? '/checkout' : '#'} aria-disabled={items.length === 0} className="w-full block mb-6">
                <Button disabled={items.length === 0} className="w-full h-12 sm:h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all rounded-xl">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-card shadow-sm">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">Fast Delivery</span>
              </div>
              <div className="border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-card shadow-sm">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {recommendedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
              <Link to="/collections" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group block">
                  <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 mb-4 h-48 sm:h-64 relative border border-slate-100 dark:border-slate-700">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover p-2 hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base leading-snug mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <p className="font-bold text-sm">${product.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
