import type { ProductType } from '../components/shared/ProductCard';
import type {
  ApiCart,
  ApiCartItem,
  ApiCategory,
  ApiOrder,
  ApiProduct,
  ApiUser,
  ApiWishlist,
} from '../types/api';
import type { CartItem } from '../redux/slices/cartSlice';
import type { WishlistItem } from '../redux/slices/wishlistSlice';

const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop',
];

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';

export function getProductMeta(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    rating: 4 + (hash % 10) / 10,
    reviews: 10 + (hash % 200),
  };
}

export function resolveCategoryName(
  category: string | ApiCategory,
  categoryMap: Map<string, string>,
): string {
  if (typeof category === 'object' && category?.name) return category.name;
  return categoryMap.get(String(category)) || 'General';
}

export function mapApiProductToProductType(
  product: ApiProduct,
  categoryMap: Map<string, string> = new Map(),
): ProductType {
  const { rating, reviews } = getProductMeta(product._id);
  const createdAt = product.createdAt ? new Date(product.createdAt).getTime() : 0;
  const isNew = createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000;

  return {
    id: product._id,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || PLACEHOLDER_IMAGE,
    category: resolveCategoryName(product.category, categoryMap),
    rating,
    reviews,
    isNew,
    isOutOfStock: product.stock <= 0,
  };
}

export function mapCategoriesForHome(
  categories: ApiCategory[],
  products: ApiProduct[],
) {
  return categories.slice(0, 4).map((category, index) => {
    const count = products.filter((product) => {
      const categoryId =
        typeof product.category === 'object'
          ? product.category._id
          : String(product.category);
      return categoryId === category._id;
    }).length;

    return {
      id: category._id,
      name: category.name,
      image: CATEGORY_IMAGES[index % CATEGORY_IMAGES.length],
      count: count || 0,
    };
  });
}

export function getProductId(value: string | ApiProduct): string {
  return typeof value === 'object' ? value._id : value;
}

export function getProductFromRef(value: string | ApiProduct): ApiProduct | null {
  return typeof value === 'object' ? value : null;
}

export function mapCartItemToUi(
  item: ApiCartItem,
  productMap: Map<string, ApiProduct>,
): CartItem | null {
  const productId = getProductId(item.productId);
  const product =
    getProductFromRef(item.productId) || productMap.get(productId);

  if (!product) {
    return {
      id: productId,
      name: 'Product',
      price: item.price,
      image: PLACEHOLDER_IMAGE,
      variant: 'Default',
      quantity: item.quantity,
    };
  }

  return {
    id: productId,
    name: product.name,
    price: item.price,
    image: product.images?.[0] || PLACEHOLDER_IMAGE,
    variant: 'Default',
    quantity: item.quantity,
  };
}

export function mapApiCartToUiItems(
  cart: ApiCart | null,
  productMap: Map<string, ApiProduct>,
): CartItem[] {
  if (!cart?.items?.length) return [];
  return cart.items
    .map((item) => mapCartItemToUi(item, productMap))
    .filter((item): item is CartItem => item !== null);
}

export function mapWishlistToUi(
  wishlist: ApiWishlist,
  categoryMap: Map<string, string>,
): WishlistItem[] {
  return wishlist.products
    .map((entry) => {
      const product = getProductFromRef(entry);
      if (!product) return null;
      const mapped = mapApiProductToProductType(product, categoryMap);
      const item: WishlistItem = {
        id: mapped.id,
        name: mapped.name,
        price: mapped.price,
        image: mapped.image,
        category: mapped.category,
      };
      if (mapped.originalPrice) item.originalPrice = mapped.originalPrice;
      return item;
    })
    .filter((item): item is WishlistItem => item !== null);
}

export function mapOrderStatusToUi(status: ApiOrder['orderStatus']): string {
  return status.toUpperCase();
}

export function mapPaymentStatusToUi(status: ApiOrder['paymentStatus']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatOrderDate(date?: string): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function mapUserToAuth(user: ApiUser) {
  return {
    id: user._id,
    name: user.username,
    email: user.email,
    avatar: user.profileImg,
    role: user.role,
    permissions: user.permissionCodes ?? [],
  };
}

export function buildCategoryMap(categories: ApiCategory[]): Map<string, string> {
  return new Map(categories.map((category) => [category._id, category.name]));
}

export function buildProductMap(products: ApiProduct[]): Map<string, ApiProduct> {
  return new Map(products.map((product) => [product._id, product]));
}
