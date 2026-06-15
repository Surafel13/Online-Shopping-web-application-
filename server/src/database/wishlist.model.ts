import mongoose, { Schema } from "mongoose";
import type { IWishlist } from "../interface/wishlist.interface.js";

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = mongoose.model<IWishlist>(
  "Wishlist",
  wishlistSchema
);