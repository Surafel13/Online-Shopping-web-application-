// src/seeds/Products.ts
import "dotenv/config";
import mongoose, { Types } from "mongoose";
import type { IProduct } from "../interface/product.interface.js";
import Product from "../database/product.model.js";

const oid = (hex: string) => new Types.ObjectId(hex);

/**
 * Category IDs — must match the ones created by `seed:categories`.
 * If your Catagory docs use the auto-generated ObjectIds from
 * `Categories.ts`, replace these hex values with the real ones
 * (run `db.categories.find({}, {name:1})` in mongosh to grab them).
 *
 * The values below assume you seed categories with these exact _ids,
 * so update `Categories.ts` to use them if you want cross-seed stability.
 */
const CATEGORY = {
  electronics: oid("660000000000000000000001"),
  fashion: oid("660000000000000000000002"),
  homeKitchen: oid("660000000000000000000003"),
  beauty: oid("660000000000000000000004"),
  sports: oid("660000000000000000000005"),
  books: oid("660000000000000000000006"),
  toys: oid("660000000000000000000007"),
  health: oid("660000000000000000000008"),
};

/**
 * 20 seed products.
 * SKU + slug are the natural keys → seeding is idempotent
 * (re-running skips existing products instead of duplicating them).
 *
 * `finalPrice` is derived from `price` and `discountPercentage`
 * so it's never out of sync with the discount.
 */
const buildProduct = (
  data: Omit<IProduct, "_id" | "finalPrice" | "specifications"> & {
    specifications?: Record<string, string>;
  },
): IProduct => {
  const discount = data.discountPercentage ?? 0;
  const finalPrice =
    discount > 0
      ? Math.round(data.price * (1 - discount / 100) * 100) / 100
      : data.price;

  return {
    ...data,
    finalPrice,
    specifications: data.specifications
      ? new Map(Object.entries(data.specifications))
      : new Map(),
  };
};

const productsSeed: IProduct[] = [
  // ---------------- Electronics (4) ----------------
  buildProduct({
    name: "iPhone 15 Pro 256GB",
    slug: "iphone-15-pro-256gb",
    sku: "ELEC-IP15P-256",
    description:
      "Apple iPhone 15 Pro with A17 Pro chip, titanium frame, and 48MP main camera.",
    brand: "Apple",
    category: CATEGORY.electronics,
    purchasePrice: 950,
    price: 1199,
    discountPercentage: 8,
    stock: 25,
    lowStockThreshold: 5,
    unit: "piece",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800",
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR",
      Storage: "256GB",
      Chip: "A17 Pro",
      Camera: "48MP main",
      Battery: "Up to 23 hours video playback",
    },
    rating: 4.8,
    reviewCount: 1240,
    isFeatured: true,
    isActive: true,
  }),
  buildProduct({
    name: "Samsung Galaxy S24 Ultra 512GB",
    slug: "samsung-galaxy-s24-ultra-512gb",
    sku: "ELEC-SGS24U-512",
    description:
      "Samsung flagship with Snapdragon 8 Gen 3, 200MP camera and S Pen support.",
    brand: "Samsung",
    category: CATEGORY.electronics,
    purchasePrice: 1050,
    price: 1349,
    discountPercentage: 10,
    stock: 18,
    lowStockThreshold: 4,
    unit: "piece",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
      "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800",
    ],
    specifications: {
      Display: "6.8-inch QHD+ AMOLED",
      Storage: "512GB",
      Camera: "200MP main",
      Battery: "5000mAh",
    },
    rating: 4.7,
    reviewCount: 890,
    isFeatured: true,
    isActive: true,
  }),
  buildProduct({
    name: "Sony WH-1000XM5 Wireless Headphones",
    slug: "sony-wh-1000xm5-wireless-headphones",
    sku: "ELEC-SNY-XM5-BLK",
    description:
      "Industry-leading noise cancelling headphones with 30-hour battery life.",
    brand: "Sony",
    category: CATEGORY.electronics,
    purchasePrice: 280,
    price: 399,
    discountPercentage: 15,
    stock: 60,
    lowStockThreshold: 10,
    unit: "piece",
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    ],
    specifications: {
      "Noise Cancelling": "Adaptive ANC",
      Battery: "30 hours",
      Connectivity: "Bluetooth 5.2",
      Weight: "250g",
    },
    rating: 4.8,
    reviewCount: 2100,
    isFeatured: true,
    isActive: true,
  }),
  buildProduct({
    name: "MacBook Air 13-inch M3 8GB/256GB",
    slug: "macbook-air-13-m3-8gb-256gb",
    sku: "ELEC-MBA13-M3",
    description:
      "Apple MacBook Air with M3 chip, 13.6-inch Liquid Retina display and all-day battery.",
    brand: "Apple",
    category: CATEGORY.electronics,
    purchasePrice: 900,
    price: 1099,
    stock: 12,
    lowStockThreshold: 3,
    unit: "piece",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    ],
    specifications: {
      Chip: "Apple M3",
      RAM: "8GB",
      Storage: "256GB SSD",
      Display: "13.6-inch Liquid Retina",
    },
    rating: 4.9,
    reviewCount: 540,
    isFeatured: false,
    isActive: true,
  }),

  // ---------------- Fashion (3) ----------------
  buildProduct({
    name: "Men's Classic Denim Jacket",
    slug: "mens-classic-denim-jacket",
    sku: "FASH-MDN-JKT-BLU",
    description:
      "Timeless denim jacket with a relaxed fit, made from 100% cotton.",
    brand: "Levi's",
    category: CATEGORY.fashion,
    purchasePrice: 30,
    price: 89,
    discountPercentage: 20,
    stock: 45,
    lowStockThreshold: 8,
    unit: "piece",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
    specifications: {
      Material: "100% Cotton",
      Fit: "Relaxed",
      Color: "Indigo Blue",
      Care: "Machine wash cold",
    },
    rating: 4.4,
    reviewCount: 320,
    isFeatured: false,
    isActive: true,
  }),
  buildProduct({
    name: "Women's Running Sneakers AirZoom",
    slug: "womens-running-sneakers-airzoom",
    sku: "FASH-WRZ-SNK-WHT",
    description:
      "Lightweight running sneakers with breathable mesh and cushioned sole.",
    brand: "Nike",
    category: CATEGORY.fashion,
    purchasePrice: 45,
    price: 129,
    discountPercentage: 15,
    stock: 70,
    lowStockThreshold: 15,
    unit: "pair",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
    specifications: {
      Material: "Mesh upper",
      Sole: "Rubber",
      Color: "White",
      Sizes: "US 5–11",
    },
    rating: 4.6,
    reviewCount: 780,
    isFeatured: true,
    isActive: true,
  }),
  buildProduct({
    name: "Leather Crossbody Bag",
    slug: "leather-crossbody-bag",
    sku: "FASH-LCB-BRN",
    description:
      "Genuine leather crossbody bag with adjustable strap and multiple compartments.",
    brand: "Michael Kors",
    category: CATEGORY.fashion,
    purchasePrice: 60,
    price: 189,
    discountPercentage: 25,
    stock: 30,
    lowStockThreshold: 5,
    unit: "piece",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
    specifications: {
      Material: "Genuine Leather",
      Color: "Brown",
      Dimensions: "9 x 7 x 3 inches",
    },
    rating: 4.5,
    reviewCount: 210,
    isFeatured: false,
    isActive: true,
  }),

  // ---------------- Home & Kitchen (3) ----------------
  buildProduct({
    name: "Stainless Steel Cookware Set (10-Piece)",
    slug: "stainless-steel-cookware-set-10-piece",
    sku: "HOME-SSC-SET10",
    description:
      "Professional-grade stainless steel cookware set with tri-ply construction.",
    brand: "Cuisinart",
    category: CATEGORY.homeKitchen,
    purchasePrice: 120,
    price: 249,
    discountPercentage: 18,
    stock: 22,
    lowStockThreshold: 4,
    unit: "set",
    images: [
      "https://images.unsplash.com/photo-1584990347449-a8a2b4ef4f4a?w=800",
    ],
    specifications: {
      Material: "Stainless Steel",
      Pieces: "10",
      "Oven Safe": "Up to 500°F",
      "Dishwasher Safe": "Yes",
    },
    rating: 4.6,
    reviewCount: 430,
    isFeatured: false,
    isActive: true,
  }),
  buildProduct({
    name: "Ceramic Non-Stick Frying Pan 10-inch",
    slug: "ceramic-non-stick-frying-pan-10-inch",
    sku: "HOME-CNS-FP10",
    description:
      "Eco-friendly ceramic coated frying pan, PFOA-free and induction compatible.",
    brand: "GreenPan",
    category: CATEGORY.homeKitchen,
    purchasePrice: 20,
    price: 59,
    discountPercentage: 10,
    stock: 90,
    lowStockThreshold: 20,
    unit: "piece",
    images: ["https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800"],
    specifications: {
      Material: "Ceramic-coated aluminum",
      Diameter: "10 inches",
      "Induction Compatible": "Yes",
    },
    rating: 4.3,
    reviewCount: 180,
    isFeatured: false,
    isActive: true,
  }),
  buildProduct({
    name: "Modern Velvet Accent Chair",
    slug: "modern-velvet-accent-chair",
    sku: "HOME-MVC-CHR-GRN",
    description:
      "Mid-century modern accent chair upholstered in soft velvet with gold legs.",
    brand: "Article",
    category: CATEGORY.homeKitchen,
    purchasePrice: 150,
    price: 379,
    discountPercentage: 12,
    stock: 15,
    lowStockThreshold: 3,
    unit: "piece",
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800",
    ],
    specifications: {
      Material: "Velvet",
      Color: "Emerald Green",
      Legs: "Gold metal",
      Dimensions: "28 x 30 x 32 inches",
    },
    rating: 4.7,
    reviewCount: 95,
    isFeatured: true,
    isActive: true,
  }),

  // ---------------- Beauty & Personal Care (3) ----------------
  buildProduct({
    name: "Vitamin C Brightening Serum 30ml",
    slug: "vitamin-c-brightening-serum-30ml",
    sku: "BEAU-VCS-30ML",
    description:
      "20% Vitamin C serum with hyaluronic acid for brighter, smoother skin.",
    brand: "The Ordinary",
    category: CATEGORY.beauty,
    purchasePrice: 8,
    price: 24,
    discountPercentage: 5,
    stock: 150,
    lowStockThreshold: 25,
    unit: "bottle",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
    ],
    specifications: {
      Volume: "30ml",
      "Key Ingredient": "20% Vitamin C",
      "Skin Type": "All",
    },
    rating: 4.5,
    reviewCount: 1650,
    isFeatured: false,
    isActive: true,
  }),
  buildProduct({
    name: "Hydrating Shampoo & Conditioner Set",
    slug: "hydrating-shampoo-conditioner-set",
    sku: "BEAU-HSC-SET",
    description:
      "Sulfate-free shampoo and conditioner set for dry, damaged hair.",
    brand: "Moroccanoil",
    category: CATEGORY.beauty,
    purchasePrice: 18,
    price: 48,
    stock: 80,
    lowStockThreshold: 15,
    unit: "set",
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800",
    ],
    specifications: {
      Volume: "250ml each",
      "Hair Type": "Dry, damaged",
      "Sulfate-Free": "Yes",
    },
    rating: 4.4,
    reviewCount: 720,
    isFeatured: false,
    isActive: true,
  }),
  buildProduct({
    name: "Luxury Eau de Parfum 50ml",
    slug: "luxury-eau-de-parfum-50ml",
    sku: "BEAU-EDP-50ML",
    description:
      "Elegant floral-woody fragrance with notes of jasmine, sandalwood and vanilla.",
    brand: "Chanel",
    category: CATEGORY.beauty,
    purchasePrice: 55,
    price: 145,
    discountPercentage: 8,
    stock: 40,
    lowStockThreshold: 8,
    unit: "bottle",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    ],
    specifications: {
      Volume: "50ml",
      "Fragrance Family": "Floral Woody",
      "Top Notes": "Bergamot, Jasmine",
    },
    rating: 4.9,
    reviewCount: 380,
    isFeatured: true,
    isActive: true,
  }),

  // ---------------- Sports & Outdoors (3) ----------------
  buildProduct({
    name: "Adjustable Dumbbell Set 5-25kg",
    slug: "adjustable-dumbbell-set-5-25kg",
    sku: "SPRT-ADS-5-25",
    description:
      "Space-saving adjustable dumbbell set with quick-change weight plates.",
    brand: "Bowflex",
    category: CATEGORY.sports,
    purchasePrice: 120,
    price: 299,
    discountPercentage: 12,
    stock: 25,
    lowStockThreshold: 5,
    unit: "pair",
    images: [
      "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800",
    ],
    specifications: {
      "Weight Range": "5–25kg per dumbbell",
      Material: "Steel & composite",
      "Quick Adjust": "Yes",
    },
    rating: 4.6,
    reviewCount: 340,
    isFeatured: false,
    isActive: true,
  }),
  buildProduct({
    name: "4-Person Waterproof Camping Tent",
    slug: "4-person-waterproof-camping-tent",
    sku: "SPRT-WCT-4P",
    description:
      "Dome tent for 4 people with waterproof coating and quick setup.",
    brand: "Coleman",
    category: CATEGORY.sports,
    purchasePrice: 55,
    price: 149,
    discountPercentage: 15,
    stock: 35,
    lowStockThreshold: 6,
    unit: "piece",
    images: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
    ],
    specifications: {
      Capacity: "4 persons",
      "Waterproof Rating": "2000mm",
      Weight: "3.5kg",
    },
    rating: 4.4,
    reviewCount: 260,
    isFeatured: false,
    isActive: true,
  }),
  buildProduct({
    name: "Yoga Mat Non-Slip 6mm",
    slug: "yoga-mat-non-slip-6mm",
    sku: "SPRT-YM-6MM",
    description:
      "Eco-friendly TPE yoga mat with alignment lines and non-slip surface.",
    brand: "Gaiam",
    category: CATEGORY.sports,
    purchasePrice: 8,
    price: 39,
    discountPercentage: 10,
    stock: 120,
    lowStockThreshold: 20,
    unit: "piece",
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
    ],
    specifications: {
      Thickness: "6mm",
      Material: "TPE",
      Dimensions: "72 x 24 inches",
    },
    rating: 4.5,
    reviewCount: 950,
    isFeatured: false,
    isActive: true,
  }),

  // ---------------- Books (2) ----------------
  buildProduct({
    name: "Atomic Habits — James Clear",
    slug: "atomic-habits-james-clear",
    sku: "BOOK-ATOMIC-HC",
    description:
      "An easy & proven way to build good habits and break bad ones.",
    brand: "Penguin",
    category: CATEGORY.books,
    purchasePrice: 6,
    price: 18,
    discountPercentage: 10,
    stock: 200,
    lowStockThreshold: 30,
    unit: "piece",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800"],
    specifications: {
      Format: "Hardcover",
      Pages: "320",
      Language: "English",
      ISBN: "978-0735211292",
    },
    rating: 4.8,
    reviewCount: 3200,
    isFeatured: true,
    isActive: true,
  }),
  buildProduct({
    name: "The Psychology of Money — Morgan Housel",
    slug: "psychology-of-money-morgan-housel",
    sku: "BOOK-POM-HC",
    description: "Timeless lessons on wealth, greed and happiness.",
    brand: "Harriman House",
    category: CATEGORY.books,
    purchasePrice: 5,
    price: 16,
    stock: 180,
    lowStockThreshold: 25,
    unit: "piece",
    images: ["https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800"],
    specifications: {
      Format: "Paperback",
      Pages: "256",
      Language: "English",
      ISBN: "978-0857197689",
    },
    rating: 4.7,
    reviewCount: 1850,
    isFeatured: false,
    isActive: true,
  }),

  // ---------------- Toys & Games (1) ----------------
  buildProduct({
    name: "LEGO Technic Race Car 42141",
    slug: "lego-technic-race-car-42141",
    sku: "TOYS-LGO-42141",
    description:
      "1:8 scale LEGO Technic McLaren Formula 1 race car with 1434 pieces.",
    brand: "LEGO",
    category: CATEGORY.toys,
    purchasePrice: 60,
    price: 179,
    discountPercentage: 8,
    stock: 40,
    lowStockThreshold: 8,
    unit: "set",
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
    ],
    specifications: {
      Pieces: "1434",
      "Age Range": "18+",
      Theme: "Technic / Racing",
    },
    rating: 4.7,
    reviewCount: 410,
    isFeatured: false,
    isActive: true,
  }),

  // ---------------- Health & Wellness (1) ----------------
  buildProduct({
    name: "Omega-3 Fish Oil 1000mg (120 Softgels)",
    slug: "omega-3-fish-oil-1000mg-120-softgels",
    sku: "HLTH-OMG3-120",
    description:
      "High-purity omega-3 supplement supporting heart, brain and joint health.",
    brand: "Nordic Naturals",
    category: CATEGORY.health,
    purchasePrice: 9,
    price: 28,
    discountPercentage: 5,
    stock: 140,
    lowStockThreshold: 20,
    unit: "bottle",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
    ],
    specifications: {
      Strength: "1000mg",
      Quantity: "120 softgels",
      EPA: "650mg",
      DHA: "450mg",
    },
    rating: 4.6,
    reviewCount: 620,
    isFeatured: false,
    isActive: true,
  }),
];

/**
 * Seeds the products collection.
 * - Idempotent: upserts by `sku` with `$setOnInsert`, so existing
 *   products are never overwritten and no duplicates are created.
 */
async function seedProducts(): Promise<void> {
  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGO_URI (or MONGODB_URI) is not set — check your .env and that --env-file / dotenv is loaded",
    );
  }

  console.log("→ Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✓ Connected");

  try {
    let created = 0;
    let skipped = 0;

    for (const seedProduct of productsSeed) {
      const result = await Product.updateOne(
        { sku: seedProduct.sku },
        { $setOnInsert: seedProduct },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        created++;
        console.log(`  + created  ${seedProduct.sku}  ${seedProduct.name}`);
      } else {
        skipped++;
        console.log(
          `  · skipped  ${seedProduct.sku}  ${seedProduct.name} (already exists)`,
        );
      }
    }

    console.log(
      `\n✓ Products seeded: ${created} created, ${skipped} skipped (total ${productsSeed.length})`,
    );
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected");
  }
}

seedProducts()
  .then(() => {
    console.log("✓ Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  });
