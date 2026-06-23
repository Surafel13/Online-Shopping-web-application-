import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageTransition } from '../components/layout/PageTransition';
import { ProductCard } from '../components/shared/ProductCard';
import { Button } from '../components/ui/button';
import { Heart, ShoppingBag } from 'lucide-react';
import type { AppDispatch, RootState } from '../redux/store';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { fetchWishlist, removeFromWishlistAsync } from '../redux/slices/wishlistSlice';
import { showSuccess } from '../redux/slices/uiSlice';
import { mapApiProductToProductType } from '../lib/mappers';

export function Wishlist() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleMoveToCart = async (productId: string) => {
    const result = await dispatch(addToCartAsync({ productId, quantity: 1 }));
    if (addToCartAsync.fulfilled.match(result)) {
      await dispatch(removeFromWishlistAsync(productId));
      dispatch(showSuccess('Moved to cart.'));
    }
  };

  const handleAddAllToCart = async () => {
    for (const item of items) {
      await dispatch(addToCartAsync({ productId: item.id, quantity: 1 }));
    }
    dispatch(showSuccess('All wishlist items added to cart.'));
  };

  return (
    <PageTransition>
      <div className="container px-4 py-10 max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-7 w-7 text-pink-500 fill-pink-100" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">{items.length} items saved for later</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Share Wishlist</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddAllToCart} disabled={items.length === 0}>
              <ShoppingBag className="mr-2 h-4 w-4" /> Add All to Cart
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-muted-foreground">Loading wishlist...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={mapApiProductToProductType({
                  _id: product.id,
                  name: product.name,
                  description: '',
                  price: product.price,
                  category: product.category,
                  stock: 1,
                  images: [product.image],
                })} />
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                    onClick={() => handleMoveToCart(product.id)}
                  >
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
