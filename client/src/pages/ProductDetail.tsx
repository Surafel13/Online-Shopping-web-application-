import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
  Heart,
  Truck,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Scale,
} from "lucide-react";
import { cn } from "../lib/utils";
import { ProductCard } from "../components/shared/ProductCard";
import { ProductReviews } from "../components/shared/ProductReviews";
import type { ProductType } from "../components/shared/ProductCard";
import { productService, categoryService } from "../services";
import { buildCategoryMap, mapApiProductToProductType } from "../lib/mappers";
import type { ApiProduct } from "../types/api";
import type { AppDispatch, RootState } from "../redux/store";
import { addToCartAsync } from "../redux/slices/cartSlice";
import {
  addToWishlistAsync,
  selectWishlistProductIds,
  removeFromWishlistAsync,
} from "../redux/slices/wishlistSlice";
import { showError, showSuccess } from "../redux/slices/uiSlice";

export function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const productIds = useSelector(selectWishlistProductIds);
  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const updateReviewSummary = useCallback(
    ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
      setApiProduct((current) =>
        current ? { ...current, rating, reviewCount } : current,
      );
    },
    [],
  );

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const [product, products, categories] = await Promise.all([
          productService.getById(id),
          productService.getAll(),
          categoryService.getAll(),
        ]);
        const categoryMap = buildCategoryMap(categories);
        setApiProduct(product);
        setRelatedProducts(
          products
            .filter((entry) => entry._id !== id)
            .slice(0, 4)
            .map((entry) => mapApiProductToProductType(entry, categoryMap)),
        );
      } catch {
        setLoadError("Unable to load product details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [dispatch, id]);


  if (isLoading) {
    return (
      <PageTransition>
        <div className="container px-4 sm:px-6 py-20 max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 h-[600px] rounded-3xl bg-muted animate-pulse" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 w-1/3 bg-muted rounded-lg animate-pulse" />
              <div className="h-12 w-3/4 bg-muted rounded-xl animate-pulse" />
              <div className="h-10 w-1/4 bg-muted rounded-lg animate-pulse" />
              <div className="h-32 w-full bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!apiProduct) {
    return (
      <PageTransition>
        <div className="container mx-auto max-w-screen-xl px-4 py-20 text-center">
          <p
            className="mb-5 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {loadError || "Product details are unavailable."}
          </p>
          <Link to="/collections">
            <Button variant="outline">Browse products</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const rating = apiProduct.rating ?? 0;
  const reviews = apiProduct.reviewCount ?? 0;
  const product = {
    id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.finalPrice ?? apiProduct.price,
    originalPrice:
      apiProduct.finalPrice !== undefined &&
      apiProduct.finalPrice < apiProduct.price
        ? apiProduct.price
        : undefined,
    rating,
    reviews,
    description: apiProduct.description,
    images: apiProduct.images?.length > 0 ? apiProduct.images : [""],
    inStock: apiProduct.stock > 0,
  };

  const isWishlisted = productIds.includes(product.id);
  const activeImage = product.images[selectedImageIndex] || product.images[0];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      dispatch(showError("Please sign in to add items to your cart."));
      return;
    }

    const result = await dispatch(
      addToCartAsync({ productId: product.id, quantity, product: apiProduct }),
    );
    if (addToCartAsync.fulfilled.match(result)) {
      const { added, requested } = result.payload;
      dispatch(
        showSuccess(
          added < requested
            ? `Only ${added} more could be added (stock limit).`
            : "Added to cart.",
        ),
      );
    } else {
      dispatch(showError(result.payload ?? "Failed to add item to cart."));
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      dispatch(showError("Please sign in to manage your wishlist."));
      return;
    }

    const result = isWishlisted
      ? await dispatch(removeFromWishlistAsync(product.id))
      : await dispatch(addToWishlistAsync(product.id));

    if (
      addToWishlistAsync.fulfilled.match(result) ||
      removeFromWishlistAsync.fulfilled.match(result)
    ) {
      dispatch(
        showSuccess(
          isWishlisted ? "Removed from wishlist." : "Added to wishlist.",
        ),
      );
    }
  };

  return (
    <PageTransition>
      <div className="container px-4 sm:px-6 py-8 md:py-12 max-w-screen-xl mx-auto selection:bg-blue-500/20">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-8"
        >
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <Link
            to="/collections"
            className="hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-24 shrink-0 pb-2 sm:pb-0">
                {product.images.map((image, index) => (
                  <button
                    key={image + index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 bg-muted shrink-0 w-20 sm:w-full",
                      selectedImageIndex === index
                        ? "border-blue-600 shadow-md ring-2 ring-blue-600/20"
                        : "border-transparent hover:border-border opacity-70 hover:opacity-100",
                    )}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-[2rem] overflow-hidden bg-muted relative group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={handleWishlist}
                  className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-background transition-all duration-300 hover:scale-105"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-foreground/80",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
                  product.inStock
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    product.inStock
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-red-500",
                  )}
                />
                {product.inStock ? "In Stock & Ready" : "Out of Stock"}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Heart className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-foreground">{product.rating}</span>
                <span>({product.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-border/55">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through font-medium">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border/70 rounded-xl bg-background h-14 w-36 shrink-0 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors font-medium text-lg"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-semibold text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors font-medium text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-xl shadow-blue-600/25 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-border/70 font-medium hover:bg-muted/60 transition-colors"
                  onClick={handleWishlist}
                >
                  <Heart
                    className={cn(
                      "mr-2 h-4 w-4 transition-colors",
                      isWishlisted && "fill-red-500 text-red-500",
                    )}
                  />
                  {isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-border/70 font-medium hover:bg-muted/60 transition-colors"
                >
                  <Scale className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                  Compare
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold block text-foreground">
                    Free Global Delivery
                  </span>
                  <span className="text-muted-foreground text-xs">
                    On all orders exceeding $150
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3.5 pt-3 border-t border-border/40">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold block text-foreground">
                    Effortless Returns
                  </span>
                  <span className="text-muted-foreground text-xs">
                    30-day hassle-free return guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <div className="flex border-b border-border/60 mb-8 overflow-x-auto">
            {["Description", "Specifications", `Reviews (${reviews})`].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab.startsWith("Reviews")) {
                      document
                        .getElementById("product-reviews")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={cn(
                    "px-8 py-4 font-semibold text-sm transition-all relative whitespace-nowrap",
                    activeTab === tab
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-px"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab}
                </button>
              ),
            )}
          </div>

          {activeTab === "Description" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                Product Description
              </h2>
              <div className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">
                {apiProduct.description ||
                  "No description available for this product."}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-6 border-t border-border/50 text-sm">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <ShieldCheck className="h-4 w-4 text-blue-600" /> Premium
                  grade certified materials
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Sparkles className="h-4 w-4 text-blue-600" /> Handcrafted
                  precision and finish
                </div>
              </div>
            </div>
          )}

          {activeTab === "Specifications" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                Specifications
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Specification details are not available for this product.
              </p>
            </div>
          )}
        </div>

        <Separator className="my-20" />

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2 block">
                You Might Also Like
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Complete the Look
              </h2>
            </div>
            <Link
              to="/collections"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
            >
              <span>Explore More</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="transition-transform duration-300 hover:-translate-y-1"
              >
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>

        <ProductReviews
          key={product.id}
          productId={product.id}
          onSummaryChange={updateReviewSummary}
        />
      </div>
    </PageTransition>
  );
}
