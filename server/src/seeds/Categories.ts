// src/seeds/Categories.ts
import "dotenv/config";
import mongoose from "mongoose";
import type { ICatagory } from "../interface/catagory.interface.js";
import Catagory from "../database/catagory.model.js";

/**
 * 8 seed categories.
 * `name` is the natural key → seeding is idempotent (re-running skips
 * existing categories instead of duplicating them).
 */
const categoriesSeed: ICatagory[] = [
  {
    name: "Electronics",
    description:
      "Smartphones, laptops, headphones, cameras and other consumer electronics.",
  },
  {
    name: "Fashion",
    description: "Clothing, footwear, bags and accessories for men and women.",
  },
  {
    name: "Home & Kitchen",
    description: "Furniture, cookware, appliances and home decor essentials.",
  },
  {
    name: "Beauty & Personal Care",
    description:
      "Skincare, haircare, makeup, fragrances and grooming products.",
  },
  {
    name: "Sports & Outdoors",
    description: "Fitness gear, outdoor equipment, sportswear and accessories.",
  },
  {
    name: "Books & Stationery",
    description: "Books, notebooks, pens and office/school supplies.",
  },
  {
    name: "Toys & Games",
    description: "Children's toys, board games, puzzles and educational items.",
  },
  {
    name: "Health & Wellness",
    description:
      "Supplements, vitamins, medical devices and wellness products.",
  },
];

/**
 * Seeds the categories collection.
 * - Idempotent: upserts by `name` with `$setOnInsert`, so existing
 *   categories are never overwritten and no duplicates are created.
 */
async function seedCategories(): Promise<void> {
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

    for (const seedCategory of categoriesSeed) {
      const result = await Catagory.updateOne(
        { name: seedCategory.name },
        { $setOnInsert: seedCategory },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        created++;
        console.log(`  + created  ${seedCategory.name}`);
      } else {
        skipped++;
        console.log(`  · skipped  ${seedCategory.name} (already exists)`);
      }
    }

    console.log(
      `\n✓ Categories seeded: ${created} created, ${skipped} skipped (total ${categoriesSeed.length})`,
    );
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected");
  }
}

seedCategories()
  .then(() => {
    console.log("✓ Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  });
