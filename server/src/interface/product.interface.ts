
import { Types } from "mongoose";

export interface IProduct {
  _id?: Types.ObjectId;

  name: string;
  slug: string;
  sku: string;

  description: string;

  brand?: string;

  category: Types.ObjectId;
  subCategory?: Types.ObjectId;

  purchasePrice: number;
  price: number;

  discountPercentage?: number;
  finalPrice?: number;

  stock: number;
  lowStockThreshold: number;

  unit?: string;

  images: string[];

  specifications?: Map<string, string>;

  rating?: number;
  reviewCount?: number;

  isFeatured: boolean;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}