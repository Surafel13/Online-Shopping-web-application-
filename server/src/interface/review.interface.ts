import type { Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
