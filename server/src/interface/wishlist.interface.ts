import { Types } from "mongoose";

export interface IWishlist {
  userId: Types.ObjectId;
  products: Types.ObjectId[]; // list of product IDs
  createdAt?: Date;
  updatedAt?: Date;
}